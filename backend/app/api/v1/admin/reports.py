import io
from datetime import date, timedelta, datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.dependencies import get_optional_hotel, get_read_db
from app.middleware.rbac import require_staff_or_admin
from app.models.activity_log import ActivityLog
from app.models.booking import Booking
from app.models.hotel import Hotel
from app.models.payment import Payment
from app.models.room import Room
from app.models.room_type import RoomType
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Admin Reports"])


def _date_range(days: int) -> tuple[date, date]:
    end = date.today()
    start = end - timedelta(days=days)
    return start, end



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

    # ── vs_previous ──────────────────────────────────────────────────────────
    prev_end = start
    prev_start = prev_end - timedelta(days=days)

    prev_booked_q = (
        db.query(func.count(Booking.id))
        .filter(
            Booking.status.in_(["confirmed", "completed"]),
            Booking.check_in >= prev_start,
            Booking.check_in < prev_end,
        )
    )
    if hotel_id is not None:
        prev_booked_q = prev_booked_q.filter(Booking.hotel_id == hotel_id)
    prev_booked = int(prev_booked_q.scalar() or 0)  # type: ignore[arg-type]
    prev_occupancy_rate = round((prev_booked / (total_rooms * days)) * 100, 2) if total_rooms else 0

    # ── by_room_type ─────────────────────────────────────────────────────────
    # Total rooms per room type
    rt_total_q = (
        db.query(
            RoomType.name.label("room_type"),
            func.count(Room.id).label("total_rooms"),
        )
        .join(Room, Room.room_type_id == RoomType.id)
        .filter(Room.is_active == True)
    )
    if hotel_id is not None:
        rt_total_q = rt_total_q.filter(Room.hotel_id == hotel_id)
    rt_totals = {r.room_type: int(r.total_rooms or 0) for r in rt_total_q.group_by(RoomType.name).all()}  # type: ignore[arg-type]

    # Booked rooms per room type in period
    rt_booked_q = (
        db.query(
            RoomType.name.label("room_type"),
            func.count(Booking.id).label("booked"),
        )
        .join(Room, Room.id == Booking.room_id)
        .join(RoomType, RoomType.id == Room.room_type_id)
        .filter(
            Booking.status.in_(["confirmed", "completed"]),
            Booking.check_in >= start,
            Booking.check_in <= end,
        )
    )
    if hotel_id is not None:
        rt_booked_q = rt_booked_q.filter(Booking.hotel_id == hotel_id)
    rt_booked_map = {r.room_type: int(r.booked or 0) for r in rt_booked_q.group_by(RoomType.name).all()}  # type: ignore[arg-type]

    by_room_type = []
    for rt_name, rt_count in rt_totals.items():
        booked_count = rt_booked_map.get(rt_name, 0)
        occ_pct = round((booked_count / (rt_count * days)) * 100, 2) if rt_count else 0
        by_room_type.append({
            "room_type": rt_name,
            "total_rooms": rt_count,
            "booked": booked_count,
            "occupancy_pct": occ_pct,
        })

    # ── heatmap ───────────────────────────────────────────────────────────────
    daily_map = {str(d.check_in): int(d.bookings or 0) for d in daily}  # type: ignore[arg-type]
    heatmap = []
    for i in range(days):
        day = start + timedelta(days=i)
        day_str = str(day)
        heatmap.append({
            "date": day_str,
            "dow": day.weekday(),  # Monday=0
            "bookings": daily_map.get(day_str, 0),
        })

    # ── forecast: next 14 days ────────────────────────────────────────────────
    forecast = []
    for f_i in range(14):
        future_day = date.today() + timedelta(days=f_i + 1)
        target_dow = future_day.weekday()
        # collect up to last 4 occurrences of that DOW in the current period
        same_dow_counts = [
            daily_map.get(str(start + timedelta(days=j)), 0)
            for j in range(days)
            if (start + timedelta(days=j)).weekday() == target_dow
        ]
        last_4 = same_dow_counts[-4:] if len(same_dow_counts) >= 4 else same_dow_counts
        projected = round(sum(last_4) / len(last_4), 1) if last_4 else 0.0
        forecast.append({"date": str(future_day), "projected": projected})

    return {
        "period_days": days,
        "total_rooms": total_rooms,
        "total_bookings": booked,
        "occupancy_rate_pct": occupancy_rate,
        "daily_bookings": [{"date": str(d.check_in), "bookings": d.bookings} for d in daily],
        "vs_previous": {
            "total_bookings": prev_booked,
            "occupancy_rate_pct": prev_occupancy_rate,
        },
        "by_room_type": by_room_type,
        "heatmap": heatmap,
        "forecast": forecast,
    }


@router.get("/revenue")
def revenue_report(
    days: int = Query(30, ge=1, le=365),
    hotel_id: Optional[int] = Depends(get_optional_hotel),
    db: Session = Depends(get_read_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    start, _rev_end = _date_range(days)

    rev_q = (
        db.query(func.sum(Payment.amount))
        .join(Booking, Booking.id == Payment.booking_id)
        .filter(Payment.status == "succeeded", Payment.created_at >= start)
    )
    if hotel_id is not None:
        rev_q = rev_q.filter(Booking.hotel_id == hotel_id)
    total = rev_q.scalar() or 0
    total_revenue = float(total)  # type: ignore[arg-type]

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

    # ── vs_previous ──────────────────────────────────────────────────────────
    prev_end = start
    prev_start = prev_end - timedelta(days=days)
    prev_rev_q = (
        db.query(func.sum(Payment.amount))
        .join(Booking, Booking.id == Payment.booking_id)
        .filter(Payment.status == "succeeded", Payment.created_at >= prev_start, Payment.created_at < prev_end)
    )
    if hotel_id is not None:
        prev_rev_q = prev_rev_q.filter(Booking.hotel_id == hotel_id)
    prev_total = prev_rev_q.scalar() or 0
    prev_revenue = float(prev_total)  # type: ignore[arg-type]

    # ── by_hotel ─────────────────────────────────────────────────────────────
    by_hotel_q = (
        db.query(
            Hotel.id.label("hotel_id"),
            Hotel.name.label("hotel_name"),
            func.sum(Payment.amount).label("revenue"),
        )
        .join(Booking, Booking.id == Payment.booking_id)
        .join(Hotel, Hotel.id == Booking.hotel_id)
        .filter(Payment.status == "succeeded", Payment.created_at >= start)
    )
    if hotel_id is not None:
        by_hotel_q = by_hotel_q.filter(Booking.hotel_id == hotel_id)
    by_hotel_rows = by_hotel_q.group_by(Hotel.id, Hotel.name).order_by(func.sum(Payment.amount).desc()).all()
    by_hotel = [
        {
            "hotel_id": int(r.hotel_id or 0),  # type: ignore[arg-type]
            "hotel_name": r.hotel_name or "",
            "revenue": float(r.revenue or 0),  # type: ignore[arg-type]
        }
        for r in by_hotel_rows
    ]

    # ── cancellation_losses ───────────────────────────────────────────────────
    cancel_q = (
        db.query(func.sum(Booking.total_price))
        .filter(Booking.status == "cancelled", Booking.created_at >= start)
    )
    if hotel_id is not None:
        cancel_q = cancel_q.filter(Booking.hotel_id == hotel_id)
    cancellation_losses = float(cancel_q.scalar() or 0)  # type: ignore[arg-type]

    # ── derived metrics ───────────────────────────────────────────────────────
    tax_estimate = round(total_revenue * 0.10, 2)
    net_revenue = round(total_revenue - tax_estimate, 2)
    avg_daily_revenue = round(total_revenue / max(days, 1), 2)

    return {
        "period_days": days,
        "total_revenue": total_revenue,
        "currency": "USD",
        "daily_revenue": [{"date": str(d.day), "revenue": float(d.revenue or 0)} for d in daily],  # type: ignore[arg-type]
        "vs_previous": {"total_revenue": prev_revenue},
        "by_hotel": by_hotel,
        "cancellation_losses": cancellation_losses,
        "tax_estimate": tax_estimate,
        "net_revenue": net_revenue,
        "avg_daily_revenue": avg_daily_revenue,
    }


@router.get("/guests")
def guest_analytics(
    days: int = Query(30, ge=1, le=365),
    hotel_id: Optional[int] = Depends(get_optional_hotel),
    db: Session = Depends(get_read_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    start, _guest_end = _date_range(days)

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

    total_guests = (new_guests or 0) + (returning or 0)
    return_rate = round((returning / total_guests) * 100, 1) if total_guests > 0 else 0

    top_guests_q = (
        db.query(
            User.id, User.full_name, User.email,
            func.count(Booking.id).label("booking_count"),
            func.sum(Payment.amount).label("total_spent"),
        )
        .join(Booking, Booking.user_id == User.id)
        .join(Payment, Payment.booking_id == Booking.id)
        .filter(Payment.status == "succeeded")
        .group_by(User.id, User.full_name, User.email)
        .order_by(func.sum(Payment.amount).desc())
        .limit(10)
    )
    if hotel_id is not None:
        top_guests_q = top_guests_q.filter(Booking.hotel_id == hotel_id)
    top_guests = top_guests_q.all()

    # ── avg_nights ────────────────────────────────────────────────────────────
    period_bookings_q = (
        db.query(Booking.check_in, Booking.check_out)
        .filter(Booking.created_at >= start)
    )
    if hotel_id is not None:
        period_bookings_q = period_bookings_q.filter(Booking.hotel_id == hotel_id)
    period_bookings = period_bookings_q.all()

    if period_bookings:
        nights_list = [(b.check_out - b.check_in).days for b in period_bookings if b.check_out and b.check_in]
        avg_nights = round(sum(nights_list) / len(nights_list), 1) if nights_list else 0.0
    else:
        avg_nights = 0.0

    # ── clv_segments (all-time payment totals per user) ───────────────────────
    clv_q = (
        db.query(
            Payment.user_id,
            func.sum(Payment.amount).label("total_spend"),
        )
        .filter(Payment.status == "succeeded")
        .group_by(Payment.user_id)
        .all()
    )
    clv_segments = {"under_500": 0, "500_to_2000": 0, "2000_to_5000": 0, "over_5000": 0}
    for row in clv_q:
        spend = float(row.total_spend or 0)  # type: ignore[arg-type]
        if spend < 500:
            clv_segments["under_500"] += 1
        elif spend < 2000:
            clv_segments["500_to_2000"] += 1
        elif spend < 5000:
            clv_segments["2000_to_5000"] += 1
        else:
            clv_segments["over_5000"] += 1

    # ── booking_frequency (all-time bookings per user) ────────────────────────
    freq_q = (
        db.query(
            Booking.user_id,
            func.count(Booking.id).label("booking_count"),
        )
        .group_by(Booking.user_id)
        .all()
    )
    booking_frequency = {"one_time": 0, "repeat_2x": 0, "loyal_3plus": 0}
    for row in freq_q:
        cnt = int(row.booking_count or 0)  # type: ignore[arg-type]
        if cnt == 1:
            booking_frequency["one_time"] += 1
        elif cnt == 2:
            booking_frequency["repeat_2x"] += 1
        else:
            booking_frequency["loyal_3plus"] += 1

    return {
        "period_days": days,
        "new_guests": new_guests,
        "returning_guests": returning,
        "total_guests": total_guests,
        "return_rate_pct": return_rate,
        "bookings_by_status": {s.status: s.count for s in status_counts},
        "top_guests": [
            {
                "user_id": g.id,
                "name": g.full_name or "Guest",
                "email": g.email,
                "booking_count": g.booking_count,
                "total_spent": float(g.total_spent or 0),  # type: ignore[arg-type]
            }
            for g in top_guests
        ],
        "avg_nights": avg_nights,
        "avg_stay_days": avg_nights,
        "clv_segments": clv_segments,
        "booking_frequency": booking_frequency,
    }


def _severity(action: str) -> str:
    a = (action or "").lower()
    if any(k in a for k in ("ban", "delete", "drop", "force", "wipe", "revoke")):
        return "critical"
    if any(k in a for k in ("error", "fail", "unauthoriz", "block", "cancel", "suspend")):
        return "high"
    if any(k in a for k in ("update", "change", "modify", "reset", "disable", "edit")):
        return "medium"
    if any(k in a for k in ("create", "add", "login", "register", "checkin", "checkout", "payment", "export")):
        return "low"
    return "info"


@router.get("/activity-logs/stats")
def activity_log_stats(
    days: int = Query(30, ge=1, le=90),
    hotel_id: Optional[int] = Depends(get_optional_hotel),
    db: Session = Depends(get_read_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    base_q = db.query(ActivityLog).filter(ActivityLog.created_at >= cutoff)
    if hotel_id is not None:
        hotel_user_ids = db.query(User.id).filter(User.hotel_id == hotel_id).scalar_subquery()
        base_q = base_q.filter(  # type: ignore[assignment]
            ActivityLog.user_id.in_(hotel_user_ids) | ActivityLog.user_id.is_(None)  # type: ignore[arg-type]
        )

    logs = base_q.order_by(ActivityLog.created_at.asc()).all()

    # Hourly distribution
    hourly: dict[int, int] = {h: 0 for h in range(24)}
    # Severity distribution
    severity_counts: dict[str, int] = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    # Action distribution (top 10)
    action_counts: dict[str, int] = {}
    # User activity
    user_counts: dict[int, int] = {}
    # 14-day trend
    day_counts: dict[str, int] = {}

    for log in logs:
        log_ts = log.created_at  # type: ignore[assignment]
        if log_ts:  # type: ignore[truthy-function]
            hourly[log_ts.hour] = hourly.get(log_ts.hour, 0) + 1
            day_str = log_ts.strftime("%Y-%m-%d")
            day_counts[day_str] = day_counts.get(day_str, 0) + 1
        sev = _severity(str(log.action or ""))  # type: ignore[arg-type]
        severity_counts[sev] = severity_counts.get(sev, 0) + 1
        act = str(log.action or "other").lower()  # type: ignore[arg-type]
        action_counts[act] = action_counts.get(act, 0) + 1
        uid: Optional[int] = log.user_id  # type: ignore[assignment]
        if uid:
            user_counts[uid] = user_counts.get(uid, 0) + 1

    # Resolve user names for top users
    top_user_ids = sorted(user_counts, key=lambda u_id: user_counts[u_id], reverse=True)[:10]
    users_map: dict[int, dict] = {
        int(u.id): {"name": u.full_name or u.email, "role": u.role}  # type: ignore[arg-type]
        for u in db.query(User).filter(User.id.in_(top_user_ids)).all()
    } if top_user_ids else {}

    top_users = [
        {
            "user_id": u_id,
            "name": users_map.get(u_id, {}).get("name", f"User #{u_id}"),
            "role": users_map.get(u_id, {}).get("role", "unknown"),
            "count": user_counts[u_id],
        }
        for u_id in top_user_ids
    ]

    # Top 10 actions
    top_actions = sorted(action_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    # 14-day trend (fill gaps)
    trend = []
    for i in range(14):
        d = (datetime.now(timezone.utc) - timedelta(days=13 - i)).strftime("%Y-%m-%d")
        trend.append({"date": d, "count": day_counts.get(d, 0)})

    return {
        "total": len(logs),
        "severity_counts": severity_counts,
        "hourly_distribution": [{"hour": h, "count": hourly[h]} for h in range(24)],
        "top_users": top_users,
        "top_actions": [{"action": a, "count": c} for a, c in top_actions],
        "trend": trend,
    }


@router.get("/activity-logs")
def activity_logs(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    severity_filter: Optional[str] = Query(None, alias="severity"),
    action_filter: Optional[str] = Query(None, alias="action"),
    role_filter: Optional[str] = Query(None, alias="role"),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    hotel_id: Optional[int] = Depends(get_optional_hotel),
    db: Session = Depends(get_read_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    from sqlalchemy.orm import joinedload
    q = db.query(ActivityLog).options(joinedload(ActivityLog.user))

    if hotel_id is not None:
        hotel_user_ids = (
            db.query(User.id)
            .filter(User.hotel_id == hotel_id)
            .scalar_subquery()
        )
        q = q.filter(ActivityLog.user_id.in_(hotel_user_ids) | ActivityLog.user_id.is_(None))  # type: ignore[arg-type]

    if action_filter:
        q = q.filter(ActivityLog.action == action_filter)

    if date_from:
        try:
            q = q.filter(ActivityLog.created_at >= date_from)
        except Exception:
            pass
    if date_to:
        try:
            q = q.filter(ActivityLog.created_at <= date_to + "T23:59:59")
        except Exception:
            pass

    if role_filter:
        role_user_ids = db.query(User.id).filter(User.role == role_filter).scalar_subquery()
        q = q.filter(ActivityLog.user_id.in_(role_user_ids))  # type: ignore[arg-type]

    total = q.count()
    logs = q.order_by(ActivityLog.created_at.desc()).offset(offset).limit(limit).all()

    result = []
    for log in logs:
        sev = _severity(str(log.action or ""))  # type: ignore[arg-type]
        if severity_filter and sev != severity_filter:
            continue
        u = log.user
        result.append({
            "id": log.id,
            "action": log.action,
            "severity": sev,
            "resource": log.resource,
            "resource_id": log.resource_id,
            "detail": log.detail,
            "user_id": log.user_id,
            "user_name": getattr(u, "full_name", None) or getattr(u, "email", None) if u else None,
            "user_role": getattr(u, "role", None) if u else None,
            "ip_address": log.ip_address,
            "created_at": str(log.created_at),
        })

    return {"items": result, "total": total, "offset": offset, "limit": limit}


@router.get("/export/{report_type}")
def export_report(
    report_type: str,
    days: int = Query(30, ge=1, le=365),
    hotel_id: Optional[int] = Depends(get_optional_hotel),
    db: Session = Depends(get_read_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    start, end = _date_range(days)
    buf = io.StringIO()

    if report_type == "occupancy":
        buf.write("date,bookings\n")
        daily_q = (
            db.query(Booking.check_in, func.count(Booking.id).label("bookings"))
            .filter(Booking.check_in >= start, Booking.check_in <= end)
        )
        if hotel_id is not None:
            daily_q = daily_q.filter(Booking.hotel_id == hotel_id)
        daily = daily_q.group_by(Booking.check_in).order_by(Booking.check_in).all()
        daily_map = {str(d.check_in): int(d.bookings or 0) for d in daily}  # type: ignore[arg-type]
        for i in range(days):
            day = start + timedelta(days=i)
            buf.write(f"{day},{daily_map.get(str(day), 0)}\n")

    elif report_type == "revenue":
        buf.write("date,revenue\n")
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
        daily_map_rev = {str(d.day): float(d.revenue or 0) for d in daily}  # type: ignore[arg-type]
        for i in range(days):
            day = start + timedelta(days=i)
            buf.write(f"{day},{daily_map_rev.get(str(day), 0.0)}\n")

    elif report_type == "guests":
        buf.write("user_id,name,email,booking_count,total_spent\n")
        all_guests_q = (
            db.query(
                User.id, User.full_name, User.email,
                func.count(Booking.id).label("booking_count"),
                func.sum(Payment.amount).label("total_spent"),
            )
            .join(Booking, Booking.user_id == User.id)
            .join(Payment, Payment.booking_id == Booking.id)
            .filter(Payment.status == "succeeded")
            .group_by(User.id, User.full_name, User.email)
            .order_by(func.sum(Payment.amount).desc())
        )
        if hotel_id is not None:
            all_guests_q = all_guests_q.filter(Booking.hotel_id == hotel_id)
        for g in all_guests_q.all():
            name = (g.full_name or "Guest").replace(",", " ")
            email = (g.email or "").replace(",", " ")
            buf.write(f"{g.id},{name},{email},{g.booking_count},{float(g.total_spent or 0)}\n")  # type: ignore[arg-type]

    csv_bytes = buf.getvalue().encode("utf-8")
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={report_type}_export.csv"},
    )
