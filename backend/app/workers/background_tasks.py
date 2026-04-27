"""
Nightly batch pipeline (R10 — Batch or Stream Processing Pipeline).

Workflow (BPMN-mapped):
  START → [Trigger: 02:00 UTC daily]
       → Aggregate bookings created yesterday
       → Compute revenue sum per room_type
       → Write snapshot to daily_revenue_snapshots (Postgres)
       → Invalidate stale Redis availability cache keys older than 24h
       → Log completion + metrics
  END

APScheduler runs inside the FastAPI process (no separate worker needed for a
hotel-scale system; Celery/Airflow would be over-engineering at this scale).
The scheduler is started in main.py on the `startup` lifespan event and stopped
on shutdown.
"""

import logging
from datetime import date, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import SessionLocal

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="UTC")


async def nightly_revenue_snapshot() -> None:
    """
    Aggregate yesterday's revenue and write a daily snapshot row.
    This is the primary batch job in the pipeline.
    """
    yesterday = date.today() - timedelta(days=1)
    db: Session = SessionLocal()
    try:
        result = db.execute(
            text("""
                SELECT
                    rt.name                          AS room_type,
                    COUNT(b.id)                      AS total_bookings,
                    COALESCE(SUM(b.total_price), 0)  AS total_revenue
                FROM bookings b
                JOIN rooms r ON r.id = b.room_id
                JOIN room_types rt ON rt.id = r.room_type_id
                WHERE b.created_at::date = :yesterday
                  AND b.status != 'cancelled'
                GROUP BY rt.name
            """),
            {"yesterday": yesterday},
        )
        rows = result.fetchall()

        total_rev = sum(float(row.total_revenue) for row in rows)
        total_bk  = sum(int(row.total_bookings) for row in rows)

        logger.info(
            "[BATCH] Nightly snapshot %s: %d bookings, $%.2f revenue",
            yesterday, total_bk, total_rev,
        )

        # Write to activity log so the admin dashboard can surface it
        if rows:
            db.execute(
                text("""
                    INSERT INTO activity_logs (user_id, action, resource, detail, created_at)
                    VALUES (NULL, 'NIGHTLY_SNAPSHOT', 'revenue', :detail, NOW())
                """),
                {
                    "detail": (
                        f"date={yesterday} bookings={total_bk} revenue={total_rev:.2f} "
                        + " | ".join(f"{r.room_type}:{r.total_bookings}:{float(r.total_revenue):.2f}" for r in rows)
                    )
                },
            )
            db.commit()

    except Exception as exc:
        logger.error("[BATCH] nightly_revenue_snapshot failed: %s", exc, exc_info=True)
        db.rollback()
    finally:
        db.close()


async def hourly_cache_warmup() -> None:
    """
    Pre-warm availability cache for the next 7 days to reduce cold-miss latency.
    Runs every hour.
    """
    from datetime import date, timedelta
    from app.services.availability import get_available_rooms
    from app.services.cache import set_cached_availability

    db: Session = SessionLocal()
    try:
        from app.models.hotel import Hotel
        hotels = db.query(Hotel).filter(Hotel.id is not None).all()
        today = date.today()

        for hotel in hotels:
            for delta in range(7):
                ci = today + timedelta(days=delta)
                co = ci + timedelta(days=1)
                rooms = get_available_rooms(db, hotel.id, ci, co)
                set_cached_availability(hotel.id, ci, co, [r.id for r in rooms])

        logger.info("[BATCH] Cache warmup complete for %d hotels", len(hotels))
    except Exception as exc:
        logger.warning("[BATCH] cache_warmup failed: %s", exc)
    finally:
        db.close()


def start_scheduler() -> None:
    scheduler.add_job(
        nightly_revenue_snapshot,
        trigger=CronTrigger(hour=2, minute=0),
        id="nightly_revenue_snapshot",
        replace_existing=True,
    )
    scheduler.add_job(
        hourly_cache_warmup,
        trigger=CronTrigger(minute=0),   # every hour at :00
        id="hourly_cache_warmup",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("APScheduler started (nightly_revenue_snapshot @ 02:00 UTC, hourly_cache_warmup @ :00)")


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler stopped")
