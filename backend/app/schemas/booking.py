from datetime import date
from typing import Optional, Self
from decimal import Decimal
from datetime import datetime

from pydantic import BaseModel, ConfigDict, model_validator


class BookingCreate(BaseModel):
    check_in: date
    check_out: date
    room_id: int

    @model_validator(mode="after")
    def validate_date_range(self) -> Self:
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be later than check_in")
        return self


class BookingUpdate(BaseModel):
    check_in: Optional[date] = None
    check_out: Optional[date] = None
    room_id: Optional[int] = None

    @model_validator(mode="after")
    def validate_date_range(self) -> Self:
        if self.check_in and self.check_out and self.check_out <= self.check_in:
            raise ValueError("check_out must be later than check_in")
        return self


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

    model_config = ConfigDict(from_attributes=True)
