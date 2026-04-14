from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.hotel import Hotel


def create_hotel(db: Session, hotel_data: dict) -> Hotel:
    hotel = Hotel(**hotel_data)
    db.add(hotel)
    db.commit()
    db.refresh(hotel)
    return hotel


def get_hotel_by_id(db: Session, hotel_id: int) -> Optional[Hotel]:
    return db.query(Hotel).filter(Hotel.id == hotel_id).first()


def get_all_hotels(db: Session) -> List[Hotel]:
    return db.query(Hotel).all()


def update_hotel(db: Session, hotel_id: int, update_data: dict) -> Optional[Hotel]:
    hotel = get_hotel_by_id(db, hotel_id)
    if not hotel:
        return None

    for field, value in update_data.items():
        setattr(hotel, field, value)

    db.commit()
    db.refresh(hotel)
    return hotel


def delete_hotel(db: Session, hotel_id: int) -> bool:
    hotel = get_hotel_by_id(db, hotel_id)
    if not hotel:
        return False

    db.delete(hotel)
    db.commit()
    return True
