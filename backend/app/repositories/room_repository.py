from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.room import Room


def create_room(db: Session, data: dict) -> Room:
    room = Room(**data)
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


def get_room_by_id(db: Session, room_id: int, hotel_id: int) -> Optional[Room]:
    return (
        db.query(Room)
        .filter(
            Room.id == room_id,
            Room.hotel_id == hotel_id,
        )
        .first()
    )


def get_rooms_by_hotel(db: Session, hotel_id: int) -> List[Room]:
    return db.query(Room).filter(Room.hotel_id == hotel_id).all()


def update_room(db: Session, room_id: int, data: dict) -> Optional[Room]:
    hotel_id = data.get("hotel_id")
    if hotel_id is None:
        return None

    room = (
        db.query(Room)
        .filter(
            Room.id == room_id,
            Room.hotel_id == hotel_id,
        )
        .first()
    )
    if not room:
        return None

    for field, value in data.items():
        setattr(room, field, value)

    db.commit()
    db.refresh(room)
    return room


def deactivate_room(db: Session, room_id: int) -> bool:
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        return False

    scoped_room = (
        db.query(Room)
        .filter(
            Room.id == room_id,
            Room.hotel_id == room.hotel_id,
        )
        .first()
    )
    if not scoped_room:
        return False

    scoped_room.is_active = False
    db.commit()
    return True
