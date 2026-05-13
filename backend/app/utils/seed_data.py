"""
Seed script — reconstruct the database with one command:
  cd backend && python -m app.utils.seed_data
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.hotel import Hotel
from app.models.room_type import RoomType
from app.models.room import Room
from app.models.user import User
from app.models.facility import Facility
from app.models.hotel_facility import HotelFacility


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).first():
            print("Database already seeded — skipping.")
            return

        # ── Users ─────────────────────────────────────────────────────────
        admin = User(
            full_name="Admin User",
            email="admin@allstay.rest",
            hashed_password=hash_password("Admin@12345"),
            role="super_admin",
        )
        staff = User(
            full_name="Staff Member",
            email="staff@allstay.com",
            hashed_password=hash_password("Staff@12345"),
            role="staff",
        )
        guest = User(
            full_name="John Doe",
            email="guest@example.com",
            hashed_password=hash_password("Guest@12345"),
            role="guest",
        )
        db.add_all([admin, staff, guest])
        db.flush()

        # ── Hotel ─────────────────────────────────────────────────────────
        hotel = Hotel(
            name="allStay Hotel",
            description="A luxury hotel with stunning ocean views and world-class amenities.",
            address="123 Ocean Drive",
            city="Miami",
            country="United States",
            country_code="US",
            phone="+1-305-555-0100",
            email="info@allstay.com",
            latitude=25.7617,
            longitude=-80.1918,
            rating=4.8,
        )
        db.add(hotel)
        db.flush()

        # Assign hotel to admin and staff
        admin.hotel_id = hotel.id
        staff.hotel_id = hotel.id
        db.flush()

        # ── Facilities ────────────────────────────────────────────────────
        facilities = []
        for name in ["WiFi", "Pool", "Gym", "Spa", "Restaurant", "Bar", "Parking", "Concierge"]:
            f = Facility(name=name)
            db.add(f)
            facilities.append(f)
        db.flush()
        for f in facilities:
            db.add(HotelFacility(hotel_id=hotel.id, facility_id=f.id))

        # ── Room types ────────────────────────────────────────────────────
        rt_standard = RoomType(hotel_id=hotel.id, name="Standard",    description="Comfortable room with city view.")
        rt_deluxe   = RoomType(hotel_id=hotel.id, name="Deluxe",      description="Spacious room with partial ocean view.")
        rt_suite    = RoomType(hotel_id=hotel.id, name="Ocean Suite",  description="Premium suite with panoramic ocean view.")
        rt_economy  = RoomType(hotel_id=hotel.id, name="Economy",      description="Budget-friendly room.")
        db.add_all([rt_standard, rt_deluxe, rt_suite, rt_economy])
        db.flush()

        # ── Rooms ─────────────────────────────────────────────────────────
        rooms_data = [
            ("101", rt_standard.id, 2,  120.00),
            ("102", rt_standard.id, 2,  120.00),
            ("103", rt_standard.id, 2,  120.00),
            ("201", rt_deluxe.id,   3,  200.00),
            ("202", rt_deluxe.id,   3,  200.00),
            ("301", rt_suite.id,    4,  450.00),
            ("302", rt_suite.id,    4,  450.00),
            ("401", rt_economy.id,  2,   80.00),
            ("402", rt_economy.id,  2,   80.00),
        ]
        for number, type_id, cap, price in rooms_data:
            db.add(Room(
                hotel_id=hotel.id,
                room_type_id=type_id,
                room_number=number,
                capacity=cap,
                base_price=price,
                is_active=True,
            ))

        db.commit()
        print("✓ Seed complete.")
        print("  admin@allstay.rest / Admin@12345")
        print("  staff@allstay.com  / Staff@12345")
        print("  guest@example.com      / Guest@12345")
    except Exception as exc:
        db.rollback()
        print(f"✗ Seed failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
