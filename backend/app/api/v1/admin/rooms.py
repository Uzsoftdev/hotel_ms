from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_hotel, get_db
from app.repositories.room_repository import (
    create_room,
    get_room_by_id,
    get_rooms_by_hotel,
    update_room,
)
from app.schemas.room import RoomCreate, RoomResponse, RoomUpdate

router = APIRouter(prefix="/rooms", tags=["Admin Rooms"])


@router.post("/", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room_endpoint(
    data: RoomCreate,
    db: Session = Depends(get_db),
    hotel_id: int = Depends(get_current_hotel),
) -> RoomResponse:
    payload = data.dict()
    payload["hotel_id"] = hotel_id
    return create_room(db, payload)


@router.get("/", response_model=List[RoomResponse])
def list_rooms_endpoint(
    db: Session = Depends(get_db),
    hotel_id: int = Depends(get_current_hotel),
) -> List[RoomResponse]:
    return get_rooms_by_hotel(db, hotel_id)


@router.get("/{room_id}", response_model=RoomResponse)
def get_room_endpoint(
    room_id: int,
    db: Session = Depends(get_db),
    hotel_id: int = Depends(get_current_hotel),
) -> RoomResponse:
    room = get_room_by_id(db, room_id, hotel_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return room


@router.put("/{room_id}", response_model=RoomResponse)
def update_room_endpoint(
    room_id: int,
    data: RoomUpdate,
    db: Session = Depends(get_db),
    hotel_id: int = Depends(get_current_hotel),
) -> RoomResponse:
    payload = data.dict(exclude_unset=True)
    payload["hotel_id"] = hotel_id
    room = update_room(db, room_id, payload)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    return room


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room_endpoint(
    room_id: int,
    db: Session = Depends(get_db),
    hotel_id: int = Depends(get_current_hotel),
) -> None:
    room = update_room(db, room_id, {"hotel_id": hotel_id, "is_active": False})
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
