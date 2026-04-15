import importlib
import sys
import types
from datetime import date
from decimal import Decimal
from types import SimpleNamespace


def _ensure_core_database_module() -> None:
    if "core.database" in sys.modules:
        return

    core_module = types.ModuleType("core")
    database_module = types.ModuleType("core.database")
    database_module.Base = object
    core_module.database = database_module
    sys.modules["core"] = core_module
    sys.modules["core.database"] = database_module


class _FakeRule:
    def __init__(self, price=None, multiplier=None, priority=0):
        self.price = price
        self.multiplier = multiplier
        self.priority = priority


def _make_room(base_price=100, hotel_id=1, room_type_id=2):
    return SimpleNamespace(
        base_price=Decimal(str(base_price)),
        hotel_id=hotel_id,
        room_type_id=room_type_id,
    )


def test_base_price_calculation_without_rules(monkeypatch):
    _ensure_core_database_module()
    pricing_service = importlib.import_module("app.services.pricing")

    def fake_get_rules_for_room_type(**kwargs):
        return []

    monkeypatch.setattr(
        pricing_service,
        "get_rules_for_room_type",
        fake_get_rules_for_room_type,
    )

    room = _make_room(base_price=100)
    total = pricing_service.calculate_booking_price(
        db=object(),
        room=room,
        check_in=date(2026, 5, 1),
        check_out=date(2026, 5, 4),
    )

    assert total == Decimal("300")


def test_seasonal_override_uses_fixed_rule_price(monkeypatch):
    _ensure_core_database_module()
    pricing_service = importlib.import_module("app.services.pricing")

    seasonal_rule = _FakeRule(price=Decimal("150"), priority=50)

    def fake_get_rules_for_room_type(**kwargs):
        return [seasonal_rule]

    monkeypatch.setattr(
        pricing_service,
        "get_rules_for_room_type",
        fake_get_rules_for_room_type,
    )

    room = _make_room(base_price=100)
    total = pricing_service.calculate_booking_price(
        db=object(),
        room=room,
        check_in=date(2026, 12, 24),
        check_out=date(2026, 12, 26),
    )

    assert total == Decimal("300")


def test_multiplier_logic_applies_to_base_price(monkeypatch):
    _ensure_core_database_module()
    pricing_service = importlib.import_module("app.services.pricing")

    multiplier_rule = _FakeRule(multiplier=Decimal("1.50"), priority=10)

    def fake_get_rules_for_room_type(**kwargs):
        return [multiplier_rule]

    monkeypatch.setattr(
        pricing_service,
        "get_rules_for_room_type",
        fake_get_rules_for_room_type,
    )

    room = _make_room(base_price=200)
    total = pricing_service.calculate_booking_price(
        db=object(),
        room=room,
        check_in=date(2026, 6, 10),
        check_out=date(2026, 6, 12),
    )

    assert total == Decimal("600.00")


def test_priority_rules_pick_top_rule(monkeypatch):
    _ensure_core_database_module()
    pricing_service = importlib.import_module("app.services.pricing")

    high_priority_rule = _FakeRule(price=Decimal("175"), priority=100)
    low_priority_rule = _FakeRule(price=Decimal("120"), priority=10)

    def fake_get_rules_for_room_type(**kwargs):
        # Repository normally sorts by priority desc; this list emulates that contract.
        return [high_priority_rule, low_priority_rule]

    monkeypatch.setattr(
        pricing_service,
        "get_rules_for_room_type",
        fake_get_rules_for_room_type,
    )

    room = _make_room(base_price=100)
    total = pricing_service.calculate_booking_price(
        db=object(),
        room=room,
        check_in=date(2026, 7, 1),
        check_out=date(2026, 7, 3),
    )

    assert total == Decimal("350")


def test_blackout_blocking_returns_true_when_blackout_exists():
    _ensure_core_database_module()
    availability_service = importlib.import_module("app.services.availability")

    db = _FakeDb(first_result=(1,))

    is_blocked = availability_service.check_blackout_dates(
        db=db,
        hotel_id=5,
        room_id=20,
        check_in=date(2026, 8, 1),
        check_out=date(2026, 8, 3),
    )

    assert is_blocked is True


def test_blackout_blocking_returns_false_when_no_blackout():
    _ensure_core_database_module()
    availability_service = importlib.import_module("app.services.availability")

    db = _FakeDb(first_result=None)

    is_blocked = availability_service.check_blackout_dates(
        db=db,
        hotel_id=5,
        room_id=20,
        check_in=date(2026, 8, 1),
        check_out=date(2026, 8, 3),
    )

    assert is_blocked is False


class _FakeQuery:
    def __init__(self, first_result):
        self._first_result = first_result

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self._first_result


class _FakeDb:
    def __init__(self, first_result):
        self._first_result = first_result

    def query(self, *args, **kwargs):
        return _FakeQuery(first_result=self._first_result)
