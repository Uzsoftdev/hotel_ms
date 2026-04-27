from decimal import Decimal
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.payment import Payment


def create_payment(
    db: Session,
    booking_id: int,
    user_id: int,
    amount: Decimal,
    method: str = "card",
    currency: str = "USD",
    transaction_id: Optional[str] = None,
) -> Payment:
    payment = Payment(
        booking_id=booking_id,
        user_id=user_id,
        amount=amount,
        currency=currency,
        method=method,
        status="pending",
        transaction_id=transaction_id,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def get_payment_by_id(db: Session, payment_id: int) -> Optional[Payment]:
    return db.query(Payment).filter(Payment.id == payment_id).first()


def get_payments_for_booking(db: Session, booking_id: int) -> List[Payment]:
    return db.query(Payment).filter(Payment.booking_id == booking_id).all()


def get_payments_for_user(db: Session, user_id: int) -> List[Payment]:
    return (
        db.query(Payment)
        .filter(Payment.user_id == user_id)
        .order_by(Payment.created_at.desc())
        .all()
    )


def update_payment_status(
    db: Session,
    payment_id: int,
    status: str,
    transaction_id: Optional[str] = None,
) -> Optional[Payment]:
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        return None
    payment.status = status
    if transaction_id:
        payment.transaction_id = transaction_id
    db.commit()
    db.refresh(payment)
    return payment
