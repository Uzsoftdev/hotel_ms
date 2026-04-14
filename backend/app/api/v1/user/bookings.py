from datetime import date
from decimal import Decimal
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_hotel, get_current_user, get_db
from app.models.room import Room
from app.repositories.booking_repository import (
    create_booking,
    get_booking_by_id,
    get_user_bookings,
    update_booking_status,
)
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.availability import get_available_rooms

router = APIRouter(prefix="/bookings", tags=["User Bookings"])


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking_endpoint(
    data: BookingCreate,
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user),
    hotel_id: int = Depends(get_current_hotel),
) -> BookingResponse:
    user_id = getattr(user, "id", None)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user context")

    available_rooms = get_available_rooms(db, hotel_id, data.check_in, data.check_out)
    if data.room_id not in {room.id for room in available_rooms}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Room is not available")

    room = db.query(Room).filter(Room.id == data.room_id, Room.hotel_id == hotel_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    nights = (data.check_out - data.check_in).days
    total_price = (room.base_price or Decimal("0")) * nights

    booking = create_booking(
        db,
        {
            "hotel_id": hotel_id,
            "user_id": int(user_id),
            "room_id": data.room_id,
            "check_in": data.check_in,
            "check_out": data.check_out,
            "total_price": total_price,
            "status": "pending",
        },
    )
    return booking


@router.get("/", response_model=List[BookingResponse])
def list_user_bookings_endpoint(
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user),
    hotel_id: int = Depends(get_current_hotel),
) -> List[BookingResponse]:
    user_id = getattr(user, "id", None)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user context")

    bookings = get_user_bookings(db, int(user_id))
    return [booking for booking in bookings if booking.hotel_id == hotel_id]


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_endpoint(
    booking_id: int,
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user),
    hotel_id: int = Depends(get_current_hotel),
) -> BookingResponse:
    user_id = getattr(user, "id", None)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user context")

    booking = get_booking_by_id(db, booking_id, hotel_id)
    if not booking or booking.user_id != int(user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return booking


@router.put("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking_endpoint(
    booking_id: int,
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user),
    hotel_id: int = Depends(get_current_hotel),
) -> BookingResponse:
    user_id = getattr(user, "id", None)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user context")

    booking = get_booking_by_id(db, booking_id, hotel_id)
    if not booking or booking.user_id != int(user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    cancelled_booking = update_booking_status(db, booking_id, "cancelled")
    if not cancelled_booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return cancelled_booking
