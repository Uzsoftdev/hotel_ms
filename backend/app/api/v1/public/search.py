from datetime import date
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies import get_read_db
from app.models.hotel import Hotel
from app.schemas.hotel import HotelResponse
from app.schemas.room import RoomResponse
from app.services.availability import get_available_rooms
from app.services.pricing import calculate_booking_price
from app.services.search import search_hotels

router = APIRouter(prefix="/search", tags=["Public Search"])


class RoomSearchResponse(RoomResponse):
    total_price: Decimal


@router.get("/hotels", response_model=List[HotelResponse])
def search_hotels_endpoint(
    q: str = Query(..., min_length=1, description="Text search query"),
    city: Optional[str] = Query(None, description="Filter by city"),
    db: Session = Depends(get_read_db),
) -> List[HotelResponse]:
    """
    Full-text hotel search via Meilisearch.
    Results are typo-tolerant and ranked by relevance.
    Availability filtering is not applied here — use GET /search/ for that.
    Falls back to an empty list if Meilisearch is unreachable.
    """
    hits = search_hotels(q, city=city)
    if not hits:
        return []
    hotel_ids = [h["id"] for h in hits]
    return db.query(Hotel).filter(Hotel.id.in_(hotel_ids)).all()


@router.get("/", response_model=List[RoomSearchResponse])
def search_available_rooms(
    hotel_id: int,
    check_in: date,
    check_out: date,
    db: Session = Depends(get_read_db),
) -> List[RoomSearchResponse]:
    rooms = get_available_rooms(db, hotel_id, check_in, check_out)
    results: List[RoomSearchResponse] = []

    for room in rooms:
        total_price = calculate_booking_price(
            db=db,
            room=room,
            check_in=check_in,
            check_out=check_out,
        )
        room_payload = {
            "id": room.id,
            "hotel_id": room.hotel_id,
            "room_type_id": room.room_type_id,
            "room_number": room.room_number,
            "capacity": room.capacity,
            "base_price": room.base_price,
            "description": room.description,
            "is_active": room.is_active,
            "room_type": room.room_type,
            "total_price": total_price,
        }
        results.append(RoomSearchResponse(**room_payload))

    return results
