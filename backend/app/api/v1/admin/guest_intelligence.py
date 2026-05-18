"""Admin Guest Intelligence API

Endpoints for the Guest Intelligence & Monitoring dashboard.
Provides paginated guest lists with computed AI metrics, individual profiles,
booking timelines, and structured notes.
"""

from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, case, desc

from app.dependencies import get_optional_hotel, get_db
from app.middleware.rbac import require_admin
from app.models.user import User
from app.models.booking import Booking
from app.models.guest_note import GuestNote
from app.services.guest_intelligence import (
    compute_ai_score,
    compute_segment,
    compute_churn_probability,
    compute_ltv,
    compute_risk_score,
)

router = APIRouter(prefix="/guest-intelligence", tags=["Admin Guest Intelligence"])


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic request models
# ─────────────────────────────────────────────────────────────────────────────

class NoteCreate(BaseModel):
    content: str
    note_type: str = "general"


class SegmentUpdate(BaseModel):
    segment: str


class BlacklistUpdate(BaseModel):
    ban: bool
    reason: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _booking_stats_subquery(db: Session):
    """Return a subquery that aggregates booking stats per user."""
    return (
        db.query(
            Booking.user_id.label("user_id"),
            func.count(Booking.id).label("total_bookings"),
            func.sum(case((Booking.status == "completed", 1), else_=0)).label("completed_stays"),
            func.sum(case((Booking.status == "cancelled", 1), else_=0)).label("cancelled_bookings"),
            func.sum(Booking.total_price).label("total_spent"),
            func.max(Booking.check_out).label("last_visit"),
        )
        .group_by(Booking.user_id)
        .subquery()
    )


def _guest_dict(user: User, sq_row: Any) -> dict:
    """Build the standard guest dict from a User ORM object and a stats row."""
    total_bookings: int = int(sq_row.total_bookings or 0) if sq_row else 0
    completed_stays: int = int(sq_row.completed_stays or 0) if sq_row else 0
    cancelled_bookings: int = int(sq_row.cancelled_bookings or 0) if sq_row else 0
    total_spent: float = float(sq_row.total_spent or 0) if sq_row else 0.0
    last_visit = sq_row.last_visit if sq_row else None

    ai_score = compute_ai_score(user, total_bookings, completed_stays, cancelled_bookings, total_spent)
    risk = compute_risk_score(user, cancelled_bookings, total_bookings)
    churn = compute_churn_probability(last_visit, completed_stays)
    ltv = compute_ltv(total_spent, completed_stays, last_visit, user.created_at)  # type: ignore[arg-type]

    # Segment: stored column wins, fallback to computed
    segment_stored = getattr(user, "segment", None)
    segment = segment_stored if segment_stored else compute_segment(
        user, total_bookings, completed_stays, cancelled_bookings, total_spent, last_visit
    )

    avg_stay = round(total_spent / completed_stays, 2) if completed_stays else 0.0

    last_visit_str: Optional[str] = None
    if last_visit:
        last_visit_str = last_visit.isoformat() if hasattr(last_visit, "isoformat") else str(last_visit)

    raw_ca = user.created_at  # type: ignore[assignment]
    created_at_str: Optional[str] = raw_ca.isoformat() if raw_ca is not None else None  # type: ignore[union-attr]

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "photo_url": user.photo_url,
        "created_at": created_at_str,
        "is_banned": bool(user.is_banned),
        "ban_reason": user.ban_reason,
        "vip_status": bool(user.vip_status),
        "loyalty_tier": user.loyalty_tier,
        "loyalty_points": int(user.loyalty_points or 0),  # type: ignore[arg-type]
        "notes": user.notes,
        "segment": segment,
        "ai_score": ai_score,
        "risk_score": risk,
        "churn_probability": churn,
        "total_spent": total_spent,
        "total_bookings": total_bookings,
        "completed_stays": completed_stays,
        "cancelled_bookings": cancelled_bookings,
        "last_visit": last_visit_str,
        "lifetime_value": ltv,
        "avg_stay_value": avg_stay,
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /  — paginated guest list
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/")
def list_guests(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(None),
    segment: Optional[str] = Query(None),
    tier: Optional[str] = Query(None),
    hotel_id: Optional[int] = Depends(get_optional_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    sq = _booking_stats_subquery(db)

    q = (
        db.query(User, sq)
        .outerjoin(sq, User.id == sq.c.user_id)
        .filter(User.role == "guest")
    )

    # Hotel scoping via booking subquery
    if hotel_id is not None:
        hotel_sq = (
            db.query(Booking.user_id)
            .filter(Booking.hotel_id == hotel_id)
            .distinct()
            .subquery()
        )
        q = q.filter(User.id.in_(db.query(hotel_sq.c.user_id)))

    # Search
    if search:
        like = f"%{search}%"
        q = q.filter(
            User.full_name.ilike(like)  # type: ignore[arg-type]
            | User.email.ilike(like)  # type: ignore[arg-type]
        )

    # Tier filter
    if tier:
        q = q.filter(User.loyalty_tier == tier)

    total = q.count()
    rows = q.order_by(desc(sq.c.total_spent)).offset(offset).limit(limit).all()

    guests = []
    for user, sq_row in rows:
        gd = _guest_dict(user, sq_row)
        # Apply segment filter after computing (segment may be derived)
        if segment and gd["segment"] != segment:
            continue
        guests.append(gd)

    return {"total": total, "guests": guests}


# ─────────────────────────────────────────────────────────────────────────────
# GET /overview
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/overview")
def get_overview(
    hotel_id: Optional[int] = Depends(get_optional_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    sq = _booking_stats_subquery(db)

    base_q = (
        db.query(User, sq)
        .outerjoin(sq, User.id == sq.c.user_id)
        .filter(User.role == "guest")
    )

    if hotel_id is not None:
        hotel_sq = (
            db.query(Booking.user_id)
            .filter(Booking.hotel_id == hotel_id)
            .distinct()
            .subquery()
        )
        base_q = base_q.filter(User.id.in_(db.query(hotel_sq.c.user_id)))

    all_rows = base_q.all()

    total_guests = len(all_rows)
    vip_count = 0
    banned_count = 0
    at_risk_count = 0
    ltv_sum = 0.0
    total_revenue = 0.0
    returning_count = 0
    segment_dist: dict = {}
    tier_dist: dict = {}
    top_guests_raw: list = []

    # 30 days ago
    cutoff = datetime.now(timezone.utc).replace(tzinfo=None)
    from datetime import timedelta
    cutoff_30d = cutoff - timedelta(days=30)

    new_guests_30d = 0

    for user, sq_row in all_rows:
        total_bookings = int(sq_row.total_bookings or 0) if sq_row else 0
        completed_stays = int(sq_row.completed_stays or 0) if sq_row else 0
        cancelled_bookings = int(sq_row.cancelled_bookings or 0) if sq_row else 0
        total_spent = float(sq_row.total_spent or 0) if sq_row else 0.0
        last_visit = sq_row.last_visit if sq_row else None

        if bool(user.vip_status):
            vip_count += 1
        if bool(user.is_banned):
            banned_count += 1

        churn = compute_churn_probability(last_visit, completed_stays)
        if churn >= 60:
            at_risk_count += 1

        ltv = compute_ltv(total_spent, completed_stays, last_visit, user.created_at)  # type: ignore[arg-type]
        ltv_sum += ltv
        total_revenue += total_spent

        if total_bookings > 1:
            returning_count += 1

        # New in last 30 days
        if user.created_at:
            ca = user.created_at
            if hasattr(ca, "replace"):
                ca_naive = ca.replace(tzinfo=None)  # type: ignore[union-attr]
            else:
                ca_naive = ca
            if ca_naive >= cutoff_30d:
                new_guests_30d += 1

        # Segment distribution
        segment = getattr(user, "segment", None) or compute_segment(
            user, total_bookings, completed_stays, cancelled_bookings, total_spent, last_visit
        )
        segment_dist[segment] = segment_dist.get(segment, 0) + 1

        # Tier distribution
        tier = str(user.loyalty_tier or "bronze").lower()
        tier_dist[tier] = tier_dist.get(tier, 0) + 1

        top_guests_raw.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "photo_url": user.photo_url,
            "total_spent": total_spent,
            "loyalty_tier": user.loyalty_tier,
            "vip_status": bool(user.vip_status),
            "segment": segment,
            "total_bookings": total_bookings,
        })

    avg_ltv = round(ltv_sum / total_guests, 2) if total_guests else 0.0
    returning_rate = round(returning_count / total_guests * 100, 1) if total_guests else 0.0

    top_guests_raw.sort(key=lambda x: x["total_spent"], reverse=True)
    top_guests = top_guests_raw[:5]

    return {
        "total_guests": total_guests,
        "vip_count": vip_count,
        "banned_count": banned_count,
        "new_guests_30d": new_guests_30d,
        "at_risk_count": at_risk_count,
        "avg_ltv": avg_ltv,
        "total_revenue_from_guests": round(total_revenue, 2),
        "returning_rate": returning_rate,
        "segment_distribution": segment_dist,
        "tier_distribution": tier_dist,
        "top_guests": top_guests,
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /{user_id}  — full guest profile
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{user_id}")
def get_guest_profile(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    user = db.query(User).filter(User.id == user_id, User.role == "guest").first()
    if not user:
        raise HTTPException(404, "Guest not found")

    sq = _booking_stats_subquery(db)
    row = db.query(sq).filter(sq.c.user_id == user_id).first()

    return _guest_dict(user, row)


# ─────────────────────────────────────────────────────────────────────────────
# GET /{user_id}/timeline
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{user_id}/timeline")
def get_guest_timeline(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    from app.models.hotel import Hotel

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Guest not found")

    bookings = (
        db.query(Booking, Hotel.name.label("hotel_name"))
        .outerjoin(Hotel, Booking.hotel_id == Hotel.id)
        .filter(Booking.user_id == user_id)
        .order_by(desc(Booking.created_at))
        .all()
    )

    result = []
    for booking, hotel_name in bookings:
        nights = 0
        if booking.check_in and booking.check_out:
            nights = (booking.check_out - booking.check_in).days

        result.append({
            "id": booking.id,
            "hotel_id": booking.hotel_id,
            "hotel_name": hotel_name,
            "room_id": booking.room_id,
            "check_in": booking.check_in.isoformat() if booking.check_in else None,
            "check_out": booking.check_out.isoformat() if booking.check_out else None,
            "adults": booking.adults,
            "children": booking.children,
            "total_price": float(booking.total_price or 0),  # type: ignore[arg-type]
            "status": booking.status,
            "created_at": booking.created_at.isoformat() if booking.created_at else None,
            "nights": nights,
        })

    return result


# ─────────────────────────────────────────────────────────────────────────────
# GET /{user_id}/notes
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{user_id}/notes")
def get_guest_notes(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    # Use alias to join author
    AuthorUser = db.query(User).filter(User.id == user_id).first()
    if not AuthorUser:
        raise HTTPException(404, "Guest not found")

    from sqlalchemy.orm import aliased
    AuthorAlias = aliased(User)

    notes_q = (
        db.query(GuestNote, AuthorAlias.full_name.label("author_name"))
        .outerjoin(AuthorAlias, GuestNote.author_id == AuthorAlias.id)
        .filter(GuestNote.user_id == user_id)
        .order_by(desc(GuestNote.created_at))
        .all()
    )

    return [
        {
            "id": note.id,
            "content": note.content,
            "note_type": note.note_type,
            "author_id": note.author_id,
            "author_name": author_name,
            "created_at": note.created_at.isoformat() if note.created_at else None,
        }
        for note, author_name in notes_q
    ]


# ─────────────────────────────────────────────────────────────────────────────
# POST /{user_id}/notes
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/{user_id}/notes", status_code=201)
def add_guest_note(
    user_id: int,
    body: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Guest not found")

    note = GuestNote(
        user_id=user_id,
        author_id=current_user.id,
        content=body.content,
        note_type=body.note_type,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    return {
        "id": note.id,
        "content": note.content,
        "note_type": note.note_type,
        "author_id": note.author_id,
        "author_name": current_user.full_name,
        "created_at": note.created_at.isoformat() if note.created_at else None,
    }


# ─────────────────────────────────────────────────────────────────────────────
# DELETE /{user_id}/notes/{note_id}
# ─────────────────────────────────────────────────────────────────────────────

@router.delete("/{user_id}/notes/{note_id}", status_code=204)
def delete_guest_note(
    user_id: int,
    note_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> None:
    note = db.query(GuestNote).filter(GuestNote.id == note_id, GuestNote.user_id == user_id).first()
    if not note:
        raise HTTPException(404, "Note not found")
    db.delete(note)
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /{user_id}/segment
# ─────────────────────────────────────────────────────────────────────────────

@router.patch("/{user_id}/segment")
def update_guest_segment(
    user_id: int,
    body: SegmentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Guest not found")
    user.segment = body.segment  # type: ignore[assignment]
    db.commit()
    db.refresh(user)
    return {"id": user.id, "segment": getattr(user, "segment", None)}


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /{user_id}/blacklist
# ─────────────────────────────────────────────────────────────────────────────

@router.patch("/{user_id}/blacklist")
def blacklist_guest(
    user_id: int,
    body: BlacklistUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "Guest not found")
    user.is_banned = body.ban  # type: ignore[assignment]
    user.ban_reason = body.reason if body.ban else None  # type: ignore[assignment]
    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "is_banned": bool(user.is_banned),
        "ban_reason": user.ban_reason,
    }
