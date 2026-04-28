from datetime import date, timedelta
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.dependencies import get_current_hotel, get_db
from app.middleware.rbac import require_staff_or_admin
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.room import Room
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Admin Reports"])


def _date_range(days: int) -> tuple[date, date]:
    end = date.today()
    start = end - timedelta(days=days)
    return start, end


@router.get("/occupancy")
def occupancy_report(
    days: int = Query(30, ge=1, le=365),
    hotel_id: int = Depends(get_current_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    start, end = _date_range(days)
    total_rooms = db.query(func.count(Room.id)).filter(Room.hotel_id == hotel_id, Room.is_active == True).scalar() or 1

    booked = (
        db.query(func.count(Booking.id))
        .filter(
            Booking.hotel_id == hotel_id,
            Booking.status.in_(["confirmed", "completed"]),
            Booking.check_in >= start,
            Booking.check_in <= end,
        )
        .scalar()
    ) or 0

    occupancy_rate = round((booked / (total_rooms * days)) * 100, 2) if total_rooms else 0

    daily = (
        db.query(Booking.check_in, func.count(Booking.id).label("bookings"))
        .filter(Booking.hotel_id == hotel_id, Booking.check_in >= start, Booking.check_in <= end)
        .group_by(Booking.check_in)
        .order_by(Booking.check_in)
        .all()
    )

    return {
        "period_days": days,
        "total_rooms": total_rooms,
        "total_bookings": booked,
        "occupancy_rate_pct": occupancy_rate,
        "daily_bookings": [{"date": str(d.check_in), "bookings": d.bookings} for d in daily],
    }


@router.get("/revenue")
def revenue_report(
    days: int = Query(30, ge=1, le=365),
    hotel_id: int = Depends(get_current_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    start, end = _date_range(days)

    total = (
        db.query(func.sum(Payment.amount))
        .join(Booking, Booking.id == Payment.booking_id)
        .filter(
            Booking.hotel_id == hotel_id,
            Payment.status == "succeeded",
            Payment.created_at >= start,
        )
        .scalar()
    ) or 0

    daily = (
        db.query(
            func.date(Payment.created_at).label("day"),
            func.sum(Payment.amount).label("revenue"),
        )
        .join(Booking, Booking.id == Payment.booking_id)
        .filter(Booking.hotel_id == hotel_id, Payment.status == "succeeded", Payment.created_at >= start)
        .group_by(func.date(Payment.created_at))
        .order_by(func.date(Payment.created_at))
        .all()
    )

    return {
        "period_days": days,
        "total_revenue": float(total),
        "currency": "USD",
        "daily_revenue": [{"date": str(d.day), "revenue": float(d.revenue or 0)} for d in daily],
    }


@router.get("/guests")
def guest_analytics(
    days: int = Query(30, ge=1, le=365),
    hotel_id: int = Depends(get_current_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    start, _ = _date_range(days)

    new_guests = (
        db.query(func.count(func.distinct(Booking.user_id)))
        .filter(Booking.hotel_id == hotel_id, Booking.created_at >= start)
        .scalar()
    ) or 0

    returning = (
        db.query(func.count(func.distinct(Booking.user_id)))
        .filter(
            Booking.hotel_id == hotel_id,
            Booking.created_at < start,
        )
        .scalar()
    ) or 0

    status_counts = (
        db.query(Booking.status, func.count(Booking.id).label("count"))
        .filter(Booking.hotel_id == hotel_id, Booking.created_at >= start)
        .group_by(Booking.status)
        .all()
    )

    return {
        "period_days": days,
        "new_guests": new_guests,
        "returning_guests": returning,
        "bookings_by_status": {s.status: s.count for s in status_counts},
    }


@router.get("/activity-logs")
def activity_logs(
    limit: int = Query(50, ge=1, le=200),
    hotel_id: int = Depends(get_current_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    from app.models.activity_log import ActivityLog
    logs = (
        db.query(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": l.id,
            "action": l.action,
            "resource": l.resource,
            "resource_id": l.resource_id,
            "detail": l.detail,
            "user_id": l.user_id,
            "created_at": str(l.created_at),
        }
        for l in logs
    ]
