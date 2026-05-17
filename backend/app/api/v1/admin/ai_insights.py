"""
Admin AI Insights endpoint — requires admin role.

GET /api/v1/admin/ai/insights — returns Claude-generated KPI insights
                                 cached in Redis for 1 hour.
"""

import json
import logging
from datetime import date, datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.dependencies import get_read_db
from app.middleware.rbac import require_admin
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.user import User
from app.services.cache import get_redis

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["Admin AI"])

_CACHE_KEY = "admin:ai_insights"
_CACHE_TTL = 3600  # 1 hour


# ── Hardcoded fallback (no API key) ──────────────────────────────────────────

_FALLBACK_INSIGHTS = [
    {
        "type": "info",
        "title": "Review your occupancy trends",
        "body": (
            "Monitor daily booking counts to identify low-demand periods. "
            "Consider targeted promotions during off-peak days to boost occupancy."
        ),
    },
    {
        "type": "tip",
        "title": "Reduce cancellation rate",
        "body": (
            "Offering flexible rescheduling options instead of free cancellations "
            "can lower revenue loss while keeping guests satisfied."
        ),
    },
    {
        "type": "success",
        "title": "Upsell to returning guests",
        "body": (
            "Returning guests have higher lifetime value. "
            "A loyalty discount or room-upgrade offer can increase their average spend."
        ),
    },
]


# ── Helper ────────────────────────────────────────────────────────────────────

def _get_anthropic_client():
    if not settings.ANTHROPIC_API_KEY:
        return None
    try:
        from anthropic import Anthropic  # type: ignore[import-untyped]
        return Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    except Exception as exc:
        logger.warning("Failed to initialise Anthropic client: %s", exc)
        return None


def _fetch_kpis(db: Session) -> dict:
    """Fetch last-30-day KPIs from the database."""
    end = date.today()
    start = end - timedelta(days=30)

    # Total rooms for occupancy calculation
    from app.models.room import Room
    total_rooms = db.query(func.count(Room.id)).filter(Room.is_active == True).scalar() or 1

    # Bookings in period
    bookings_q = db.query(Booking).filter(Booking.created_at >= start)
    all_bookings = bookings_q.all()
    total_bookings = len(all_bookings)

    confirmed_bookings = sum(
        1 for b in all_bookings if str(b.status) in ("confirmed", "completed")
    )
    cancelled_bookings = sum(
        1 for b in all_bookings if str(b.status) == "cancelled"
    )

    # Occupancy rate: confirmed bookings / (total_rooms * 30 days)
    occupancy_rate = round((confirmed_bookings / (total_rooms * 30)) * 100, 1)

    # Cancellation rate
    cancellation_rate = (
        round((cancelled_bookings / total_bookings) * 100, 1)
        if total_bookings > 0 else 0.0
    )

    # Revenue
    revenue_q = (
        db.query(func.sum(Payment.amount))
        .join(Booking, Booking.id == Payment.booking_id)
        .filter(Payment.status == "succeeded", Payment.created_at >= start)
    )
    total_revenue = float(revenue_q.scalar() or 0)

    avg_rev = round(total_revenue / total_bookings, 2) if total_bookings > 0 else 0.0

    # New guests (first booking within period)
    new_guests_q = db.query(func.count(func.distinct(Booking.user_id))).filter(
        Booking.created_at >= start
    )
    new_guests = new_guests_q.scalar() or 0

    return {
        "occupancy_rate": occupancy_rate,
        "total_revenue": round(total_revenue, 2),
        "total_bookings": total_bookings,
        "cancellation_rate": cancellation_rate,
        "avg_revenue_per_booking": avg_rev,
        "new_guests": new_guests,
    }


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.get("/insights")
def ai_insights(
    db: Session = Depends(get_read_db),
    _: User = Depends(require_admin),
) -> Any:
    """Return AI-generated hotel KPI insights, cached for 1 hour."""

    # ── 1. Check Redis cache ──────────────────────────────────────────────────
    try:
        redis = get_redis()
        cached = redis.get(_CACHE_KEY)
        if cached:
            return json.loads(cached)  # type: ignore[arg-type]
    except Exception as exc:
        logger.warning("Redis cache read failed: %s", exc)

    # ── 2. Fetch KPIs ─────────────────────────────────────────────────────────
    try:
        kpis = _fetch_kpis(db)
    except Exception as exc:
        logger.error("KPI fetch failed: %s", exc)
        kpis = {
            "occupancy_rate": 0,
            "total_revenue": 0,
            "total_bookings": 0,
            "cancellation_rate": 0,
            "avg_revenue_per_booking": 0,
            "new_guests": 0,
        }

    generated_at = datetime.now(tz=timezone.utc).isoformat()

    # ── 3. No API key — return hardcoded insights ─────────────────────────────
    client = _get_anthropic_client()
    if client is None:
        result = {"insights": _FALLBACK_INSIGHTS, "generated_at": generated_at}
        try:
            get_redis().setex(_CACHE_KEY, _CACHE_TTL, json.dumps(result))
        except Exception:
            pass
        return result

    # ── 4. Call Claude ────────────────────────────────────────────────────────
    user_message = (
        f"Hotel KPIs (last 30 days): "
        f"occupancy_rate={kpis['occupancy_rate']}%, "
        f"total_revenue=${kpis['total_revenue']}, "
        f"total_bookings={kpis['total_bookings']}, "
        f"cancellation_rate={kpis['cancellation_rate']}%, "
        f"avg_revenue_per_booking=${kpis['avg_revenue_per_booking']}. "
        f"New guests={kpis['new_guests']}. "
        "Generate insights."
    )

    try:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=768,
            system=(
                "You are a hotel analytics advisor. "
                "Analyze the provided KPI data and return ONLY a JSON array of actionable insights. "
                "Each insight has: type ('warning'|'success'|'info'|'tip'), "
                "title (short, max 8 words), "
                "body (1-2 sentences of specific actionable advice). "
                "Return 4-6 insights."
            ),
            messages=[{"role": "user", "content": user_message}],
        )

        raw_text = response.content[0].text.strip()

        # Strip markdown code fences if present
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
            raw_text = raw_text.strip()

        insights = json.loads(raw_text)
        if not isinstance(insights, list):
            raise ValueError("Expected a JSON array of insights")

    except Exception as exc:
        logger.error("AI insights generation failed: %s", exc)
        insights = _FALLBACK_INSIGHTS

    result = {"insights": insights, "generated_at": generated_at}

    # ── 5. Cache the result ───────────────────────────────────────────────────
    try:
        get_redis().setex(_CACHE_KEY, _CACHE_TTL, json.dumps(result))
    except Exception as exc:
        logger.warning("Redis cache write failed: %s", exc)

    return result
