from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies import get_current_hotel, get_db
from app.middleware.rbac import require_staff_or_admin
from app.models.booking import Booking
from app.models.user import User
from app.repositories.booking_repository import update_booking_status
from app.repositories.notification_repository import create_notification

router = APIRouter(prefix="/bookings", tags=["Admin Bookings"])


class BookingAdminResponse(BaseModel):
    id: int
    hotel_id: int
    user_id: int
    room_id: int
    check_in: Any
    check_out: Any
    total_price: Any
    status: str
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/", response_model=List[BookingAdminResponse])
def list_all_bookings(
    hotel_id: int = Depends(get_current_hotel),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    q = db.query(Booking).filter(Booking.hotel_id == hotel_id)
    if status_filter:
        q = q.filter(Booking.status == status_filter)
    bookings = q.order_by(Booking.created_at.desc()).all()
    result = []
    for b in bookings:
        user = db.query(User).filter(User.id == b.user_id).first()
        result.append({
            **{c.name: getattr(b, c.name) for c in b.__table__.columns},
            "guest_name": getattr(user, "full_name", None),
            "guest_email": getattr(user, "email", None),
        })
    return result


@router.put("/{booking_id}/checkin", status_code=status.HTTP_200_OK)
def check_in_booking(
    booking_id: int,
    hotel_id: int = Depends(get_current_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_staff_or_admin),
) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.hotel_id == hotel_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if booking.status != "confirmed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot check-in booking with status '{booking.status}'")
    update_booking_status(db, booking_id, "completed")
    create_notification(db, booking.user_id, "Checked In", "You have been successfully checked in. Enjoy your stay!", "success")
    return {"message": "Guest checked in successfully"}


@router.put("/{booking_id}/checkout", status_code=status.HTTP_200_OK)
def check_out_booking(
    booking_id: int,
    hotel_id: int = Depends(get_current_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_staff_or_admin),
) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.hotel_id == hotel_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if booking.status != "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot check-out booking with status '{booking.status}'")
    create_notification(db, booking.user_id, "Checked Out", "Thank you for staying with us! We hope to see you again.", "info")
    return {"message": "Guest checked out successfully"}


@router.put("/{booking_id}/status", status_code=status.HTTP_200_OK)
def update_booking(
    booking_id: int,
    new_status: str,
    hotel_id: int = Depends(get_current_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_staff_or_admin),
) -> dict:
    valid = {"pending", "confirmed", "cancelled", "completed"}
    if new_status not in valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status. Choose from: {valid}")
    updated = update_booking_status(db, booking_id, new_status)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return {"message": f"Booking status updated to '{new_status}'"}
