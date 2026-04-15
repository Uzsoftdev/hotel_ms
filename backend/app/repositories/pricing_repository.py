from datetime import date
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.pricing_rule import PricingRule


def create_rule(db: Session, data: dict) -> PricingRule:
    rule = PricingRule(**data)
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


def get_rules_for_room_type(
    db: Session,
    hotel_id: int,
    room_type_id: int,
    check_in: date,
    check_out: date,
) -> List[PricingRule]:
    return (
        db.query(PricingRule)
        .filter(
            PricingRule.hotel_id == hotel_id,
            PricingRule.room_type_id == room_type_id,
            PricingRule.start_date <= check_out,
            PricingRule.end_date >= check_in,
        )
        .order_by(PricingRule.priority.desc(), PricingRule.id.desc())
        .all()
    )


def get_rules_by_hotel(db: Session, hotel_id: int) -> List[PricingRule]:
    return (
        db.query(PricingRule)
        .filter(PricingRule.hotel_id == hotel_id)
        .order_by(PricingRule.priority.desc(), PricingRule.id.desc())
        .all()
    )


def delete_rule(db: Session, rule_id: int, hotel_id: int) -> bool:
    rule: Optional[PricingRule] = (
        db.query(PricingRule)
        .filter(
            PricingRule.id == rule_id,
            PricingRule.hotel_id == hotel_id,
        )
        .first()
    )
    if not rule:
        return False

    db.delete(rule)
    db.commit()
    return True
