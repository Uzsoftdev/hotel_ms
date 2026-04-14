from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, root_validator


class BookingCreate(BaseModel):
    check_in: date
    check_out: date
    room_id: int

    @root_validator
    def validate_date_range(cls, values: dict) -> dict:
        check_in = values.get("check_in")
        check_out = values.get("check_out")
        if check_in and check_out and check_out <= check_in:
            raise ValueError("check_out must be later than check_in")
        return values


class BookingUpdate(BaseModel):
    check_in: Optional[date] = None
    check_out: Optional[date] = None
    room_id: Optional[int] = None

    @root_validator
    def validate_date_range(cls, values: dict) -> dict:
        check_in = values.get("check_in")
        check_out = values.get("check_out")
        if check_in and check_out and check_out <= check_in:
            raise ValueError("check_out must be later than check_in")
        return values


class BookingResponse(BaseModel):
    id: int
    hotel_id: int
    user_id: int
    room_id: int
    check_in: date
    check_out: date
    total_price: Decimal
    status: str
    created_at: datetime

    class Config:
        orm_mode = True
