from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.room import Room
from app.repositories.pricing_repository import get_rules_for_room_type


def calculate_booking_price(
    db: Session,
    room: Room,
    check_in: date,
    check_out: date,
) -> Decimal:
    total_price = Decimal("0")
    base_price = Decimal(room.base_price or 0)
    current_day = check_in

    while current_day < check_out:
        daily_price = base_price
        rules = get_rules_for_room_type(
            db=db,
            hotel_id=room.hotel_id,
            room_type_id=room.room_type_id,
            check_in=current_day,
            check_out=current_day,
        )

        if rules:
            top_rule = rules[0]
            if top_rule.price is not None:
                daily_price = Decimal(top_rule.price)
            elif top_rule.multiplier is not None:
                daily_price = base_price * Decimal(top_rule.multiplier)

        total_price += daily_price
        current_day += timedelta(days=1)

    return total_price
