from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.user import User


def create_booking(db: Session, data: dict) -> Booking:
    booking = Booking(**data)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def get_booking_by_id(db: Session, booking_id: int, hotel_id: int) -> Optional[Booking]:
    return (
        db.query(Booking)
        .filter(
            Booking.id == booking_id,
            Booking.hotel_id == hotel_id,
        )
        .first()
    )


def get_user_bookings(db: Session, user_id: int) -> List[Booking]:
    return (
        db.query(Booking)
        .join(User, User.id == Booking.user_id)
        .filter(
            Booking.user_id == user_id,
            Booking.hotel_id == User.hotel_id,
        )
        .all()
    )


def update_booking_status(db: Session, booking_id: int, status: str) -> Optional[Booking]:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        return None

    scoped_booking = (
        db.query(Booking)
        .filter(
            Booking.id == booking_id,
            Booking.hotel_id == booking.hotel_id,
        )
        .first()
    )
    if not scoped_booking:
        return None

    scoped_booking.status = status
    db.commit()
    db.refresh(scoped_booking)
    return scoped_booking
