from datetime import datetime
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.dependencies import get_optional_hotel, get_db
from app.middleware.rbac import require_admin
from app.models.user import User
from app.repositories.user_repository import create_user, delete_user, get_all_users, update_user

router = APIRouter(prefix="/users", tags=["Admin Users"])


class UserAdminCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "guest"
    phone: Optional[str] = None
    department: Optional[str] = None  # staff only
    notes: Optional[str] = None


class UserAdminUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    vip_status: Optional[bool] = None
    loyalty_points: Optional[int] = None
    loyalty_tier: Optional[str] = None
    notes: Optional[str] = None
    department: Optional[str] = None


class BanRequest(BaseModel):
    ban: bool           # True = ban, False = unban
    reason: Optional[str] = None


class LoyaltyRequest(BaseModel):
    points_delta: int   # positive = add, negative = deduct
    tier: Optional[str] = None  # if provided, override tier


class UserAdminResponse(BaseModel):
    id: int
    full_name: Optional[str]
    email: str
    role: str
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    hotel_id: Optional[int] = None
    is_email_verified: Optional[bool] = None
    is_banned: Optional[bool] = None
    ban_reason: Optional[str] = None
    vip_status: Optional[bool] = None
    loyalty_points: Optional[int] = None
    loyalty_tier: Optional[str] = None
    notes: Optional[str] = None
    department: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


@router.get("/", response_model=List[UserAdminResponse])
def list_users(
    role: Optional[str] = Query(None),
    hotel_id: Optional[int] = Depends(get_optional_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    return get_all_users(db, hotel_id=hotel_id, role=role)


@router.post("/", response_model=UserAdminResponse, status_code=status.HTTP_201_CREATED)
def add_user(
    data: UserAdminCreate,
    hotel_id: Optional[int] = Depends(get_optional_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    payload = data.model_dump()
    payload["email"] = payload["email"].lower()
    password = payload.pop("password")
    payload["hashed_password"] = hash_password(password)
    if hotel_id is not None:
        payload["hotel_id"] = hotel_id
    return create_user(db, payload)


@router.put("/{user_id}", response_model=UserAdminResponse)
def edit_user(
    user_id: int,
    data: UserAdminUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    payload = data.model_dump(exclude_none=True)
    if "email" in payload:
        payload["email"] = payload["email"].lower()
    updated = update_user(db, user_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> None:
    if not delete_user(db, user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


@router.patch("/{user_id}/ban", response_model=UserAdminResponse)
def ban_user(user_id: int, body: BanRequest, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.is_banned = body.ban  # type: ignore[assignment]
    user.ban_reason = body.reason if body.ban else None  # type: ignore[assignment]
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/vip", response_model=UserAdminResponse)
def toggle_vip(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.vip_status = not bool(user.vip_status)  # type: ignore[assignment]
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/loyalty", response_model=UserAdminResponse)
def update_loyalty(user_id: int, body: LoyaltyRequest, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    _raw_pts: int = int(user.loyalty_points or 0)  # type: ignore[arg-type]
    new_pts: int = max(0, _raw_pts + body.points_delta)
    user.loyalty_points = new_pts  # type: ignore[assignment]
    # Auto-tier if not overridden
    if body.tier:
        user.loyalty_tier = body.tier  # type: ignore[assignment]
    elif new_pts >= 5000:
        user.loyalty_tier = "platinum"  # type: ignore[assignment]
    elif new_pts >= 2000:
        user.loyalty_tier = "gold"  # type: ignore[assignment]
    elif new_pts >= 500:
        user.loyalty_tier = "silver"  # type: ignore[assignment]
    else:
        user.loyalty_tier = "bronze"  # type: ignore[assignment]
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}/detail")
def get_user_detail(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)) -> Any:
    from app.models.booking import Booking
    from app.models.payment import Payment
    from sqlalchemy import func
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    bookings = db.query(Booking).filter(Booking.user_id == user_id).order_by(Booking.created_at.desc()).limit(10).all()
    total_spent = db.query(func.sum(Payment.amount)).join(Booking, Booking.id == Payment.booking_id).filter(Booking.user_id == user_id, Payment.status == "succeeded").scalar() or 0
    total_bookings = db.query(func.count(Booking.id)).filter(Booking.user_id == user_id).scalar() or 0
    return {
        "user": UserAdminResponse.model_validate(user),
        "stats": {
            "total_bookings": total_bookings,
            "total_spent": float(total_spent),
            "recent_bookings": [
                {
                    "id": b.id, "hotel_id": b.hotel_id, "room_id": b.room_id,
                    "check_in": str(b.check_in), "check_out": str(b.check_out),
                    "status": b.status, "total_price": float(b.total_price or 0)  # type: ignore[arg-type]
                }
                for b in bookings
            ]
        }
    }
