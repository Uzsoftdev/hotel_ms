import importlib
import sys
import types
from unittest.mock import MagicMock


def _ensure_core_database_module() -> None:
    if "core.database" in sys.modules:
        return

    core_module = types.ModuleType("core")
    database_module = types.ModuleType("core.database")
    database_module.Base = object
    core_module.database = database_module
    sys.modules["core"] = core_module
    sys.modules["core.database"] = database_module


def test_create_booking():
    _ensure_core_database_module()
    booking_repository = importlib.import_module("app.repositories.booking_repository")

    class FakeBooking:
        def __init__(self, **kwargs):
            self.kwargs = kwargs

    db = MagicMock()
    booking_repository.Booking = FakeBooking

    payload = {
        "hotel_id": 1,
        "user_id": 3,
        "room_id": 12,
        "check_in": "2026-04-20",
        "check_out": "2026-04-22",
        "total_price": 250,
        "status": "pending",
    }
    booking = booking_repository.create_booking(db, payload)

    assert booking.kwargs == payload
    db.add.assert_called_once_with(booking)
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(booking)


def test_get_booking_by_id_scopes_to_hotel():
    _ensure_core_database_module()
    booking_repository = importlib.import_module("app.repositories.booking_repository")

    db = MagicMock()
    query_mock = db.query.return_value
    query_mock.filter.return_value.first.return_value = "booking"

    result = booking_repository.get_booking_by_id(db, booking_id=9, hotel_id=4)

    assert result == "booking"
    db.query.assert_called_once_with(booking_repository.Booking)
    query_mock.filter.assert_called_once()
