"""
Meilisearch re-indexing tasks.

Triggered by admin hotel/room create and update endpoints so the search index
stays in sync with Postgres without a manual seed step on every change.
"""
import logging

from app.celery_app import celery_app

logger = logging.getLogger(__name__)


def _hotel_to_dict(hotel) -> dict:
    return {
        "id": hotel.id,
        "name": hotel.name,
        "description": hotel.description or "",
        "city": hotel.city or "",
        "country": hotel.country or "",
        "country_code": hotel.country_code or "",
        "address": hotel.address or "",
        "rating": float(hotel.rating or 0),
    }


def _room_to_dict(room) -> dict:
    return {
        "id": room.id,
        "hotel_id": room.hotel_id,
        "room_type_id": room.room_type_id,
        "room_number": room.room_number or "",
        "capacity": room.capacity or 0,
        "base_price": float(room.base_price or 0),
        "description": room.description or "",
        "is_active": room.is_active,
    }


@celery_app.task(name="app.tasks.indexing_tasks.reindex_hotel")
def reindex_hotel(hotel_id: int) -> None:
    from app.core.database import SessionLocal
    from app.models.hotel import Hotel
    from app.services.search import index_hotel

    db = SessionLocal()
    try:
        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        if hotel:
            index_hotel(_hotel_to_dict(hotel))
            logger.info("Reindexed hotel id=%d", hotel_id)
        else:
            logger.warning("reindex_hotel: hotel id=%d not found", hotel_id)
    finally:
        db.close()


@celery_app.task(name="app.tasks.indexing_tasks.reindex_room")
def reindex_room(room_id: int) -> None:
    from app.core.database import SessionLocal
    from app.models.room import Room
    from app.services.search import index_room

    db = SessionLocal()
    try:
        room = db.query(Room).filter(Room.id == room_id).first()
        if room:
            index_room(_room_to_dict(room))
            logger.info("Reindexed room id=%d", room_id)
        else:
            logger.warning("reindex_room: room id=%d not found", room_id)
    finally:
        db.close()


@celery_app.task(name="app.tasks.indexing_tasks.delete_hotel_index")
def delete_hotel_index(hotel_id: int) -> None:
    from app.services.search import delete_hotel_from_index
    delete_hotel_from_index(hotel_id)
    logger.info("Removed hotel id=%d from Meilisearch index", hotel_id)
