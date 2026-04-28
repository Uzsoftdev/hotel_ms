"""
Integration tests for the booking flow.

These tests hit the full stack (real DB + Redis via testcontainers).
Each test sets up its own hotel / room / user data via factories so tests
are fully isolated from each other.
"""

from datetime import date, timedelta

import pytest

from tests.factories import (
    BookingFactory,
    HotelFactory,
    RoomFactory,
    RoomTypeFactory,
    UserFactory,
)

TODAY = date.today()
CHECK_IN = TODAY + timedelta(days=14)
CHECK_OUT = CHECK_IN + timedelta(days=3)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _auth_header(client, email: str, password: str = "SecureP@ss1") -> dict:
    resp = client.post("/api/v1/public/auth/login", json={
        "email": email,
        "password": password,
    })
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def _register_and_login(client, email: str) -> dict:
    client.post("/api/v1/public/auth/register", json={
        "full_name": "Guest",
        "email": email,
        "password": "SecureP@ss1",
    })
    return _auth_header(client, email)


# ── Tests ─────────────────────────────────────────────────────────────────────

def test_create_booking_success(client, db_session):
    hotel = HotelFactory(db_session)
    rt = RoomTypeFactory(db_session, hotel_id=hotel.id)
    room = RoomFactory(db_session, hotel_id=hotel.id, room_type_id=rt.id)
    headers = _register_and_login(client, "book_ok@example.com")

    resp = client.post("/api/v1/user/bookings/", json={
        "room_id": room.id,
        "check_in": str(CHECK_IN),
        "check_out": str(CHECK_OUT),
    }, headers=headers)

    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["room_id"] == room.id
    assert body["status"] == "pending"
    assert float(body["total_price"]) > 0


def test_create_booking_requires_auth(client, db_session):
    hotel = HotelFactory(db_session)
    rt = RoomTypeFactory(db_session, hotel_id=hotel.id)
    room = RoomFactory(db_session, hotel_id=hotel.id, room_type_id=rt.id)

    resp = client.post("/api/v1/user/bookings/", json={
        "room_id": room.id,
        "check_in": str(CHECK_IN),
        "check_out": str(CHECK_OUT),
    })
    assert resp.status_code == 401


def test_double_booking_same_dates_rejected(client, db_session):
    hotel = HotelFactory(db_session)
    rt = RoomTypeFactory(db_session, hotel_id=hotel.id)
    room = RoomFactory(db_session, hotel_id=hotel.id, room_type_id=rt.id)
    headers = _register_and_login(client, "double_book@example.com")

    # First booking
    resp = client.post("/api/v1/user/bookings/", json={
        "room_id": room.id,
        "check_in": str(CHECK_IN),
        "check_out": str(CHECK_OUT),
    }, headers=headers)
    assert resp.status_code == 201

    # Second booking for the same room & dates
    resp2 = client.post("/api/v1/user/bookings/", json={
        "room_id": room.id,
        "check_in": str(CHECK_IN),
        "check_out": str(CHECK_OUT),
    }, headers=headers)
    assert resp2.status_code == 400


def test_list_bookings_returns_only_own(client, db_session):
    hotel = HotelFactory(db_session)
    rt = RoomTypeFactory(db_session, hotel_id=hotel.id)
    room1 = RoomFactory(db_session, hotel_id=hotel.id, room_type_id=rt.id)
    room2 = RoomFactory(db_session, hotel_id=hotel.id, room_type_id=rt.id)

    user_a = UserFactory(db_session, email="list_a@example.com")
    user_b = UserFactory(db_session, email="list_b@example.com")

    BookingFactory(db_session, hotel_id=hotel.id, user_id=user_a.id, room_id=room1.id,
                   check_in=CHECK_IN, check_out=CHECK_OUT)
    BookingFactory(db_session, hotel_id=hotel.id, user_id=user_b.id, room_id=room2.id,
                   check_in=CHECK_IN, check_out=CHECK_OUT)

    headers_a = _auth_header(client, "list_a@example.com")
    resp = client.get("/api/v1/user/bookings/", headers=headers_a)
    assert resp.status_code == 200
    bookings = resp.json()
    assert all(b["user_id"] == user_a.id for b in bookings)
    assert not any(b["user_id"] == user_b.id for b in bookings)


def test_cancel_booking(client, db_session):
    hotel = HotelFactory(db_session)
    rt = RoomTypeFactory(db_session, hotel_id=hotel.id)
    room = RoomFactory(db_session, hotel_id=hotel.id, room_type_id=rt.id)
    user = UserFactory(db_session, email="cancel_ok@example.com")
    booking = BookingFactory(db_session, hotel_id=hotel.id, user_id=user.id, room_id=room.id,
                             check_in=CHECK_IN, check_out=CHECK_OUT)

    headers = _auth_header(client, "cancel_ok@example.com")
    resp = client.put(f"/api/v1/user/bookings/{booking.id}/cancel", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "cancelled"


def test_cancel_other_users_booking_rejected(client, db_session):
    hotel = HotelFactory(db_session)
    rt = RoomTypeFactory(db_session, hotel_id=hotel.id)
    room = RoomFactory(db_session, hotel_id=hotel.id, room_type_id=rt.id)
    owner = UserFactory(db_session, email="own_cancel@example.com")
    attacker = UserFactory(db_session, email="atk_cancel@example.com")

    booking = BookingFactory(db_session, hotel_id=hotel.id, user_id=owner.id, room_id=room.id,
                             check_in=CHECK_IN, check_out=CHECK_OUT)

    headers_attacker = _auth_header(client, "atk_cancel@example.com")
    resp = client.put(f"/api/v1/user/bookings/{booking.id}/cancel", headers=headers_attacker)
    assert resp.status_code == 404


def test_get_booking_detail(client, db_session):
    hotel = HotelFactory(db_session)
    rt = RoomTypeFactory(db_session, hotel_id=hotel.id)
    room = RoomFactory(db_session, hotel_id=hotel.id, room_type_id=rt.id)
    user = UserFactory(db_session, email="get_detail@example.com")
    booking = BookingFactory(db_session, hotel_id=hotel.id, user_id=user.id, room_id=room.id,
                             check_in=CHECK_IN, check_out=CHECK_OUT)

    headers = _auth_header(client, "get_detail@example.com")
    resp = client.get(f"/api/v1/user/bookings/{booking.id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == booking.id


def test_search_available_rooms(client, db_session):
    hotel = HotelFactory(db_session)
    rt = RoomTypeFactory(db_session, hotel_id=hotel.id)
    RoomFactory(db_session, hotel_id=hotel.id, room_type_id=rt.id)

    resp = client.get("/api/v1/public/search/", params={
        "hotel_id": hotel.id,
        "check_in": str(CHECK_IN),
        "check_out": str(CHECK_OUT),
    })
    assert resp.status_code == 200
    rooms = resp.json()
    assert len(rooms) >= 1
    assert all("total_price" in r for r in rooms)
