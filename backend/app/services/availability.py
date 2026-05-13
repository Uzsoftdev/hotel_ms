from datetime import date
from typing import List

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.blackout_date import BlackoutDate
from app.models.booking import Booking
from app.models.room import Room


def check_blackout_dates(
    db: Session,
    hotel_id: int,
    room_id: int,
    check_in: date,
    check_out: date,
) -> bool:
    blackout_exists = (
        db.query(BlackoutDate.id)
        .filter(
            BlackoutDate.hotel_id == hotel_id,
            BlackoutDate.date >= check_in,
            BlackoutDate.date < check_out,
            or_(
                BlackoutDate.room_id.is_(None),
                BlackoutDate.room_id == room_id,
            ),
        )
        .first()
    )
    return blackout_exists is not None


def get_available_rooms(
    db: Session,
    hotel_id: int,
    check_in: date,
    check_out: date,
) -> List[Room]:
    hotel_wide_blackout = (
        db.query(BlackoutDate.id)
        .filter(
            BlackoutDate.hotel_id == hotel_id,
            BlackoutDate.room_id.is_(None),
            BlackoutDate.date >= check_in,
            BlackoutDate.date < check_out,
        )
        .first()
    )
    if hotel_wide_blackout:
        return []

    overlapping_room_ids = (
        db.query(Booking.room_id)
        .filter(
            Booking.hotel_id == hotel_id,
            Booking.status.not_in(["cancelled"]),  # FIX: cancelled bookings must not block rooms
            ~((Booking.check_out <= check_in) | (Booking.check_in >= check_out)),
        )
        .subquery()
    )

    blackout_room_ids = (
        db.query(BlackoutDate.room_id)
        .filter(
            BlackoutDate.hotel_id == hotel_id,
            BlackoutDate.room_id.isnot(None),
            BlackoutDate.date >= check_in,
            BlackoutDate.date < check_out,
        )
        .subquery()
    )

    return (
        db.query(Room)
        .filter(
            Room.hotel_id == hotel_id,
            Room.id.notin_(overlapping_room_ids),
            Room.id.notin_(blackout_room_ids),
            Room.is_active.is_(True),
        )
        .all()
    )
