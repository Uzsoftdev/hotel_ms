from typing import Optional

from pydantic import BaseModel, ConfigDict


class RoomTypeBase(BaseModel):
    hotel_id: int
    name: str
    description: Optional[str] = None


class RoomTypeCreate(RoomTypeBase):
    pass


class RoomTypeUpdate(BaseModel):
    hotel_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None


class RoomTypeResponse(RoomTypeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
