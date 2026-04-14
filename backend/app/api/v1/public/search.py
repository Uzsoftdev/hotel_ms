from datetime import date
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.room import RoomResponse
from app.services.availability import get_available_rooms

router = APIRouter(prefix="/search", tags=["Public Search"])


@router.get("/", response_model=List[RoomResponse])
def search_available_rooms(
    hotel_id: int,
    check_in: date,
    check_out: date,
    db: Session = Depends(get_db),
) -> List[RoomResponse]:
    return get_available_rooms(db, hotel_id, check_in, check_out)
