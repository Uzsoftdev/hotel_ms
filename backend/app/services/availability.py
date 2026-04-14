from datetime import date
from typing import List

from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.room import Room


def get_available_rooms(
    db: Session,
    hotel_id: int,
    check_in: date,
    check_out: date,
) -> List[Room]:
    overlapping_room_ids = (
        db.query(Booking.room_id)
        .filter(
            Booking.hotel_id == hotel_id,
            ~( (Booking.check_out <= check_in) | (Booking.check_in >= check_out) ),
        )
        .subquery()
    )

    return (
        db.query(Room)
        .filter(
            Room.hotel_id == hotel_id,
            Room.id.notin_(overlapping_room_ids),
            Room.is_active.is_(True),
        )
        .all()
    )
