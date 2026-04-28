from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.repositories.hotel_repository import (
    create_hotel,
    delete_hotel,
    get_all_hotels,
    get_hotel_by_id,
    update_hotel,
)
from app.schemas.hotel import HotelCreate, HotelResponse, HotelUpdate
from app.services.cache import (
    cache_delete,
    cache_get,
    cache_set,
    hotel_detail_key,
    hotel_list_key,
    HOTEL_DETAIL_TTL,
    HOTEL_LIST_TTL,
)

router = APIRouter(prefix="/hotels", tags=["Admin Hotels"])


@router.post("/", response_model=HotelResponse, status_code=status.HTTP_201_CREATED)
def create_hotel_endpoint(hotel_data: HotelCreate, db: Session = Depends(get_db)) -> HotelResponse:
    hotel = create_hotel(db, hotel_data.dict())
    from app.tasks.indexing_tasks import reindex_hotel
    reindex_hotel.delay(hotel.id)
    cache_delete(hotel_list_key())
    return hotel


@router.get("/", response_model=List[HotelResponse])
def list_hotels_endpoint(db: Session = Depends(get_db)) -> List[HotelResponse]:
    cached = cache_get(hotel_list_key())
    if cached is not None:
        return cached
    hotels = get_all_hotels(db)
    payload = [HotelResponse.model_validate(h).model_dump() for h in hotels]
    cache_set(hotel_list_key(), payload, HOTEL_LIST_TTL)
    return hotels


@router.get("/{hotel_id}", response_model=HotelResponse)
def get_hotel_endpoint(hotel_id: int, db: Session = Depends(get_db)) -> HotelResponse:
    cached = cache_get(hotel_detail_key(hotel_id))
    if cached is not None:
        return cached
    hotel = get_hotel_by_id(db, hotel_id)
    if not hotel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    cache_set(hotel_detail_key(hotel_id), HotelResponse.model_validate(hotel).model_dump(), HOTEL_DETAIL_TTL)
    return hotel


@router.put("/{hotel_id}", response_model=HotelResponse)
def update_hotel_endpoint(
    hotel_id: int,
    update_data: HotelUpdate,
    db: Session = Depends(get_db),
) -> HotelResponse:
    hotel = update_hotel(db, hotel_id, update_data.dict(exclude_unset=True))
    if not hotel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    from app.tasks.indexing_tasks import reindex_hotel
    reindex_hotel.delay(hotel.id)
    cache_delete(hotel_list_key())
    cache_delete(hotel_detail_key(hotel_id))
    return hotel


@router.delete("/{hotel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hotel_endpoint(hotel_id: int, db: Session = Depends(get_db)) -> None:
    deleted = delete_hotel(db, hotel_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    from app.tasks.indexing_tasks import delete_hotel_index
    delete_hotel_index.delay(hotel_id)
    cache_delete(hotel_list_key())
    cache_delete(hotel_detail_key(hotel_id))
