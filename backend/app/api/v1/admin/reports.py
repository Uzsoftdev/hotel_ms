from datetime import date, timedelta
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.dependencies import get_optional_hotel, get_read_db
from app.middleware.rbac import require_staff_or_admin
from app.models.activity_log import ActivityLog
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.room import Room
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Admin Reports"])


def _date_range(days: int) -> tuple[date, date]:
    end = date.today()
    start = end - timedelta(days=days)
    return start, end


def _apply_hotel(q, model, hotel_id):
    if hotel_id is not None:
        q = q.filter(model.hotel_id == hotel_id)
    return q


@router.get("/occupancy")
def occupancy_report(
    days: int = Query(30, ge=1, le=365),
    hotel_id: Optional[int] = Depends(get_optional_hotel),
    db: Session = Depends(get_read_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    start, end = _date_range(days)

    room_q = db.query(func.count(Room.id)).filter(Room.is_active == True)
    if hotel_id is not None:
        room_q = room_q.filter(Room.hotel_id == hotel_id)
    total_rooms = room_q.scalar() or 1

    booked_q = (
        db.query(func.count(Booking.id))
        .filter(
            Booking.status.in_(["confirmed", "completed"]),
            Booking.check_in >= start,
            Booking.check_in <= end,
        )
    )
    if hotel_id is not None:
        booked_q = booked_q.filter(Booking.hotel_id == hotel_id)
    booked = booked_q.scalar() or 0

    occupancy_rate = round((booked / (total_rooms * days)) * 100, 2) if total_rooms else 0

    daily_q = (
        db.query(Booking.check_in, func.count(Booking.id).label("bookings"))
        .filter(Booking.check_in >= start, Booking.check_in <= end)
    )
    if hotel_id is not None:
        daily_q = daily_q.filter(Booking.hotel_id == hotel_id)
    daily = daily_q.group_by(Booking.check_in).order_by(Booking.check_in).all()

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
    hotel_id: Optional[int] = Depends(get_optional_hotel),
    db: Session = Depends(get_read_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    start, end = _date_range(days)

    rev_q = (
        db.query(func.sum(Payment.amount))
        .join(Booking, Booking.id == Payment.booking_id)
        .filter(Payment.status == "succeeded", Payment.created_at >= start)
    )
    if hotel_id is not None:
        rev_q = rev_q.filter(Booking.hotel_id == hotel_id)
    total = rev_q.scalar() or 0

    daily_q = (
        db.query(
            func.date(Payment.created_at).label("day"),
            func.sum(Payment.amount).label("revenue"),
        )
        .join(Booking, Booking.id == Payment.booking_id)
        .filter(Payment.status == "succeeded", Payment.created_at >= start)
    )
    if hotel_id is not None:
        daily_q = daily_q.filter(Booking.hotel_id == hotel_id)
    daily = daily_q.group_by(func.date(Payment.created_at)).order_by(func.date(Payment.created_at)).all()

    return {
        "period_days": days,
        "total_revenue": float(total),
        "currency": "USD",
        "daily_revenue": [{"date": str(d.day), "revenue": float(d.revenue or 0)} for d in daily],
    }


@router.get("/guests")
def guest_analytics(
    days: int = Query(30, ge=1, le=365),
    hotel_id: Optional[int] = Depends(get_optional_hotel),
    db: Session = Depends(get_read_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    start, _ = _date_range(days)

    new_q = db.query(func.count(func.distinct(Booking.user_id))).filter(Booking.created_at >= start)
    if hotel_id is not None:
        new_q = new_q.filter(Booking.hotel_id == hotel_id)
    new_guests = new_q.scalar() or 0

    ret_q = db.query(func.count(func.distinct(Booking.user_id))).filter(Booking.created_at < start)
    if hotel_id is not None:
        ret_q = ret_q.filter(Booking.hotel_id == hotel_id)
    returning = ret_q.scalar() or 0

    status_q = (
        db.query(Booking.status, func.count(Booking.id).label("count"))
        .filter(Booking.created_at >= start)
    )
    if hotel_id is not None:
        status_q = status_q.filter(Booking.hotel_id == hotel_id)
    status_counts = status_q.group_by(Booking.status).all()

    return {
        "period_days": days,
        "new_guests": new_guests,
        "returning_guests": returning,
        "bookings_by_status": {s.status: s.count for s in status_counts},
    }


@router.get("/activity-logs")
def activity_logs(
    limit: int = Query(50, ge=1, le=200),
    hotel_id: Optional[int] = Depends(get_optional_hotel),
    db: Session = Depends(get_read_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    q = db.query(ActivityLog)
    if hotel_id is not None:
        hotel_user_ids = (
            db.query(User.id)
            .filter(User.hotel_id == hotel_id)
            .subquery()
        )
        q = q.filter(ActivityLog.user_id.in_(hotel_user_ids) | ActivityLog.user_id.is_(None))
    logs = q.order_by(ActivityLog.created_at.desc()).limit(limit).all()

    return [
        {
            "id": log.id,
            "action": log.action,
            "resource": log.resource,
            "resource_id": log.resource_id,
            "detail": log.detail,
            "user_id": log.user_id,
            "created_at": str(log.created_at),
        }
        for log in logs
    ]
