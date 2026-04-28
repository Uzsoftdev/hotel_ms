"""
factory_boy factories for test data creation.

Usage:
    hotel = HotelFactory(db)
    room_type = RoomTypeFactory(db, hotel_id=hotel.id)
    room = RoomFactory(db, hotel_id=hotel.id, room_type_id=room_type.id)
    user = UserFactory(db)
"""

import random
import string
from decimal import Decimal

from app.core.security import hash_password
from app.models.booking import Booking
from app.models.hotel import Hotel
from app.models.room import Room
from app.models.room_type import RoomType
from app.models.user import User


def _rand_str(length: int = 8) -> str:
    return "".join(random.choices(string.ascii_lowercase, k=length))


def HotelFactory(db, **kwargs) -> Hotel:
    defaults = dict(
        name=f"Hotel {_rand_str()}",
        city="Testville",
        country="TC",
        country_code="TC",
        rating=Decimal("4.20"),
    )
    defaults.update(kwargs)
    hotel = Hotel(**defaults)
    db.add(hotel)
    db.commit()
    db.refresh(hotel)
    return hotel


def RoomTypeFactory(db, hotel_id: int, **kwargs) -> RoomType:
    defaults = dict(
        hotel_id=hotel_id,
        name=f"Type {_rand_str(4)}",
        description="Standard room type",
    )
    defaults.update(kwargs)
    rt = RoomType(**defaults)
    db.add(rt)
    db.commit()
    db.refresh(rt)
    return rt


def RoomFactory(db, hotel_id: int, room_type_id: int, **kwargs) -> Room:
    defaults = dict(
        hotel_id=hotel_id,
        room_type_id=room_type_id,
        room_number=str(random.randint(100, 999)),
        capacity=2,
        base_price=Decimal("120.00"),
        is_active=True,
    )
    defaults.update(kwargs)
    room = Room(**defaults)
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


def UserFactory(db, role: str = "guest", hotel_id: int | None = None, **kwargs) -> User:
    email = kwargs.pop("email", f"user_{_rand_str()}@example.com")
    defaults = dict(
        full_name="Test User",
        email=email,
        hashed_password=hash_password("SecureP@ss1"),
        role=role,
        hotel_id=hotel_id,
    )
    defaults.update(kwargs)
    user = User(**defaults)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def BookingFactory(
    db,
    hotel_id: int,
    user_id: int,
    room_id: int,
    check_in=None,
    check_out=None,
    **kwargs,
) -> Booking:
    from datetime import date, timedelta
    ci = check_in or date.today() + timedelta(days=10)
    co = check_out or ci + timedelta(days=2)
    defaults = dict(
        hotel_id=hotel_id,
        user_id=user_id,
        room_id=room_id,
        check_in=ci,
        check_out=co,
        adults=2,
        children=0,
        total_price=Decimal("240.00"),
        status="confirmed",
    )
    defaults.update(kwargs)
    booking = Booking(**defaults)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking
