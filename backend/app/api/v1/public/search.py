from datetime import date
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.dependencies import get_read_db
from app.models.hotel import Hotel
from app.schemas.hotel import HotelResponse
from app.schemas.room import RoomResponse
from app.services.availability import get_available_rooms
from app.services.pricing import calculate_booking_price
from app.services.search import search_hotels

router = APIRouter(prefix="/search", tags=["Public Search"])


@router.get("/hotels/browse", response_model=List[HotelResponse])
def browse_hotels(
    country: Optional[str] = Query(None, description="Filter by country"),
    city: Optional[str] = Query(None, description="Filter by city"),
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_read_db),
) -> List[HotelResponse]:
    """Browse all hotels with optional filters. No search query required."""
    from app.models.hotel_image import HotelImage  # ensure model registered
    query = db.query(Hotel).options(joinedload(Hotel.images))
    if country:
        query = query.filter(Hotel.country.ilike(f"%{country}%"))
    if city:
        query = query.filter(Hotel.city.ilike(f"%{city}%"))
    if min_rating is not None:
        query = query.filter(Hotel.rating >= min_rating)
    offset = (page - 1) * per_page
    hotels = query.order_by(Hotel.rating.desc()).offset(offset).limit(per_page).all()
    return hotels



class RoomSearchResponse(RoomResponse):
    total_price: Decimal


@router.get("/hotels", response_model=List[HotelResponse])
def search_hotels_endpoint(
    q: str = Query(..., min_length=1, description="Text search query"),
    city: Optional[str] = Query(None, description="Filter by city"),
    country: Optional[str] = Query(None, description="Filter by country"),
    min_stars: Optional[int] = Query(None, ge=1, le=5),
    max_stars: Optional[int] = Query(None, ge=1, le=5),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_read_db),
) -> List[HotelResponse]:
    """
    Full-text hotel search. Tries Meilisearch first; falls back to
    Postgres ILIKE when Meilisearch is unreachable (e.g. not deployed).
    """
    from app.models.hotel_image import HotelImage  # ensure model registered
    hits = search_hotels(q, city=city)

    if hits:
        # Meilisearch path
        hotel_ids = [h["id"] for h in hits]
        query = db.query(Hotel).options(joinedload(Hotel.images)).filter(Hotel.id.in_(hotel_ids))
    else:
        # Postgres fallback — handles both plain queries and "City, Country" format
        parts = [p.strip() for p in q.split(",") if p.strip()]

        if len(parts) > 1:
            # "City, Country" style — each part must match somewhere
            from sqlalchemy import and_, or_
            conditions = []
            for part in parts:
                pat = f"%{part}%"
                conditions.append(or_(
                    Hotel.name.ilike(pat),
                    Hotel.city.ilike(pat),
                    Hotel.country.ilike(pat),
                    Hotel.description.ilike(pat),
                ))
            query = db.query(Hotel).options(joinedload(Hotel.images)).filter(and_(*conditions))
        else:
            # Single term — match anywhere
            pattern = f"%{q}%"
            query = db.query(Hotel).options(joinedload(Hotel.images)).filter(
                Hotel.name.ilike(pattern)
                | Hotel.city.ilike(pattern)
                | Hotel.country.ilike(pattern)
                | Hotel.description.ilike(pattern)
            )

    # Apply optional filters
    if city:
        query = query.filter(Hotel.city.ilike(f"%{city}%"))
    if country:
        query = query.filter(Hotel.country.ilike(f"%{country}%"))
    if min_stars is not None:
        query = query.filter(Hotel.star_rating >= min_stars)
    if max_stars is not None:
        query = query.filter(Hotel.star_rating <= max_stars)

    offset = (page - 1) * per_page
    return query.offset(offset).limit(per_page).all()



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
