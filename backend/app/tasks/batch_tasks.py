"""
Batch pipeline tasks — moved from background_tasks.py.

These are sync Celery tasks (no async/await needed — Celery workers run in
their own process and can call SessionLocal() directly without an event loop).
Celery Beat triggers them on schedule, replacing APScheduler.
"""
import logging
from datetime import date, timedelta

from sqlalchemy import text

from app.celery_app import celery_app
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.batch_tasks.nightly_revenue_snapshot")
def nightly_revenue_snapshot() -> None:
    """Aggregate yesterday's revenue and write a daily snapshot to activity_logs."""
    yesterday = date.today() - timedelta(days=1)
    db = SessionLocal()
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
        total_bk  = sum(int(row.total_bookings)  for row in rows)

        logger.info("[BATCH] Nightly snapshot %s: %d bookings, $%.2f revenue", yesterday, total_bk, total_rev)

        if rows:
            db.execute(
                text("""
                    INSERT INTO activity_logs (user_id, action, resource, detail, created_at)
                    VALUES (NULL, 'NIGHTLY_SNAPSHOT', 'revenue', :detail, NOW())
                """),
                {
                    "detail": (
                        f"date={yesterday} bookings={total_bk} revenue={total_rev:.2f} "
                        + " | ".join(
                            f"{r.room_type}:{r.total_bookings}:{float(r.total_revenue):.2f}"
                            for r in rows
                        )
                    )
                },
            )
            db.commit()
    except Exception as exc:
        logger.error("[BATCH] nightly_revenue_snapshot failed: %s", exc, exc_info=True)
        db.rollback()
    finally:
        db.close()


@celery_app.task(name="app.tasks.batch_tasks.hourly_cache_warmup")
def hourly_cache_warmup() -> None:
    """Pre-warm availability cache for the next 7 days to cut cold-miss latency."""
    from app.models.hotel import Hotel
    from app.services.availability import get_available_rooms
    from app.services.cache import set_cached_availability

    db = SessionLocal()
    try:
        hotels = db.query(Hotel).all()
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
