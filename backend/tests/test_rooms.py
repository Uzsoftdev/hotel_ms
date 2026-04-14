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


class _Expr:
    def __init__(self, value):
        self.value = value

    def __invert__(self):
        return ("not", self.value)

    def __or__(self, other):
        return ("or", self.value, other)


class _FakeColumn:
    def __init__(self, name: str):
        self.name = name

    def __eq__(self, other):
        return ("eq", self.name, other)

    def __le__(self, other):
        return _Expr(("le", self.name, other))

    def __ge__(self, other):
        return _Expr(("ge", self.name, other))

    def notin_(self, other):
        return ("notin", self.name, other)

    def is_(self, other):
        return ("is", self.name, other)


def test_create_room():
    _ensure_core_database_module()
    room_repository = importlib.import_module("app.repositories.room_repository")

    class FakeRoom:
        def __init__(self, **kwargs):
            self.kwargs = kwargs

    db = MagicMock()
    room_repository.Room = FakeRoom

    payload = {"hotel_id": 1, "room_type_id": 2, "room_number": "101"}
    room = room_repository.create_room(db, payload)

    assert room.kwargs == payload
    db.add.assert_called_once_with(room)
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(room)


def test_get_rooms_by_hotel():
    _ensure_core_database_module()
    room_repository = importlib.import_module("app.repositories.room_repository")

    db = MagicMock()
    query_mock = db.query.return_value
    filtered_mock = query_mock.filter.return_value
    expected_rooms = [MagicMock(id=1), MagicMock(id=2)]
    filtered_mock.all.return_value = expected_rooms

    result = room_repository.get_rooms_by_hotel(db, hotel_id=7)

    assert result == expected_rooms
    db.query.assert_called_once_with(room_repository.Room)
    query_mock.filter.assert_called_once()


def test_get_available_rooms_excludes_overlapping_bookings():
    _ensure_core_database_module()
    availability_service = importlib.import_module("app.services.availability")

    fake_booking = types.SimpleNamespace(
        room_id=_FakeColumn("room_id"),
        hotel_id=_FakeColumn("hotel_id"),
        check_out=_FakeColumn("check_out"),
        check_in=_FakeColumn("check_in"),
    )
    fake_room = types.SimpleNamespace(
        id=_FakeColumn("id"),
        hotel_id=_FakeColumn("hotel_id"),
        is_active=_FakeColumn("is_active"),
    )
    availability_service.Booking = fake_booking
    availability_service.Room = fake_room

    db = MagicMock()
    booking_query = MagicMock()
    room_query = MagicMock()
    db.query.side_effect = [booking_query, room_query]

    overlap_filtered = booking_query.filter.return_value
    overlap_filtered.subquery.return_value = "overlap_subquery"
    room_query.filter.return_value.all.return_value = ["room-1"]

    result = availability_service.get_available_rooms(
        db=db,
        hotel_id=10,
        check_in="2026-05-10",
        check_out="2026-05-12",
    )

    assert result == ["room-1"]
    assert db.query.call_count == 2
    booking_query.filter.assert_called_once()
    room_query.filter.assert_called_once()
