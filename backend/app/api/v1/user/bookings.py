from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.room import Room
from app.repositories.booking_repository import (
    create_booking,
    get_booking_by_id,
    get_user_bookings,
    update_booking_status,
)
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.availability import get_available_rooms
from app.services.pricing import calculate_booking_price

router = APIRouter(prefix="/bookings", tags=["User Bookings"])


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking_endpoint(
    data: BookingCreate,
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user),
) -> BookingResponse:
    user_id = getattr(user, "id", None)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user context")

    # Derive hotel from the room being booked — guests have no hotel_id
    room = db.query(Room).filter(Room.id == data.room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    hotel_id = room.hotel_id

    available_rooms = get_available_rooms(db, hotel_id, data.check_in, data.check_out)
    if data.room_id not in {r.id for r in available_rooms}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Room is not available for the selected dates")

    total_price = calculate_booking_price(
        db=db,
        room=room,
        check_in=data.check_in,
        check_out=data.check_out,
    )

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
) -> List[BookingResponse]:
    user_id = getattr(user, "id", None)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user context")

    return get_user_bookings(db, int(user_id))


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_endpoint(
    booking_id: int,
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user),
) -> BookingResponse:
    user_id = getattr(user, "id", None)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user context")

    booking = get_booking_by_id(db, booking_id)
    if not booking or booking.user_id != int(user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return booking


@router.put("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking_endpoint(
    booking_id: int,
    db: Session = Depends(get_db),
    user: Any = Depends(get_current_user),
) -> BookingResponse:
    user_id = getattr(user, "id", None)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user context")

    booking = get_booking_by_id(db, booking_id)
    if not booking or booking.user_id != int(user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    cancelled = update_booking_status(db, booking_id, "cancelled")
    if not cancelled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return cancelled
