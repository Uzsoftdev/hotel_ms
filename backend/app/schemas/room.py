from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.schemas.room_type import RoomTypeResponse


class RoomBase(BaseModel):
    hotel_id: int
    room_type_id: int
    room_number: Optional[str] = None
    capacity: Optional[int] = None
    base_price: Optional[Decimal] = None
    description: Optional[str] = None
    is_active: bool = True


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    hotel_id: Optional[int] = None
    room_type_id: Optional[int] = None
    room_number: Optional[str] = None
    capacity: Optional[int] = None
    base_price: Optional[Decimal] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class RoomResponse(RoomBase):
    id: int
    room_type: Optional[RoomTypeResponse] = None

    class Config:
        orm_mode = True
