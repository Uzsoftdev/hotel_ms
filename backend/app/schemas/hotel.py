from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class HotelImageResponse(BaseModel):
    id: int
    image_url: str
    is_primary: bool

    model_config = ConfigDict(from_attributes=True)


class HotelBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    rating: Decimal = Decimal("0.0")


class HotelCreate(HotelBase):
    pass


class HotelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    rating: Optional[Decimal] = None


class HotelResponse(HotelBase):
    id: int
    created_at: datetime
    images: List[HotelImageResponse] = []

    model_config = ConfigDict(from_attributes=True)
