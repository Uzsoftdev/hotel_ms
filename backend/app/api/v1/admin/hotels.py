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

router = APIRouter(prefix="/hotels", tags=["Admin Hotels"])


@router.post("/", response_model=HotelResponse, status_code=status.HTTP_201_CREATED)
def create_hotel_endpoint(hotel_data: HotelCreate, db: Session = Depends(get_db)) -> HotelResponse:
    return create_hotel(db, hotel_data.dict())


@router.get("/", response_model=List[HotelResponse])
def list_hotels_endpoint(db: Session = Depends(get_db)) -> List[HotelResponse]:
    return get_all_hotels(db)


@router.get("/{hotel_id}", response_model=HotelResponse)
def get_hotel_endpoint(hotel_id: int, db: Session = Depends(get_db)) -> HotelResponse:
    hotel = get_hotel_by_id(db, hotel_id)
    if not hotel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
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
    return hotel


@router.delete("/{hotel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hotel_endpoint(hotel_id: int, db: Session = Depends(get_db)) -> None:
    deleted = delete_hotel(db, hotel_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
