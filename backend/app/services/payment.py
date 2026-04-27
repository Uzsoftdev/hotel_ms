"""
Payment service.

Currently wired for manual/cash confirmation. To integrate Stripe:
  1. pip install stripe
  2. Set STRIPE_SECRET_KEY in .env
  3. Replace _charge_card() with stripe.PaymentIntent.create(...)
"""
import logging
import uuid
from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.repositories.payment_repository import create_payment, update_payment_status

logger = logging.getLogger(__name__)


class PaymentError(Exception):
    pass


def _charge_card(amount: Decimal, currency: str, method: str) -> str:
    """Simulate a payment gateway call. Returns a transaction ID on success."""
    # Replace with: stripe.PaymentIntent.create(amount=int(amount*100), currency=currency)
    return f"txn_{uuid.uuid4().hex[:16]}"


def process_payment(
    db: Session,
    booking_id: int,
    user_id: int,
    amount: Decimal,
    method: str = "card",
    currency: str = "USD",
) -> Booking:
    if amount <= 0:
        raise PaymentError("Payment amount must be positive")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise PaymentError(f"Booking {booking_id} not found")
    if booking.status in {"cancelled", "completed"}:
        raise PaymentError(f"Cannot pay for a booking with status '{booking.status}'")

    payment = create_payment(
        db,
        booking_id=booking_id,
        user_id=user_id,
        amount=amount,
        method=method,
        currency=currency,
    )

    try:
        transaction_id = _charge_card(amount, currency, method)
    except Exception as exc:
        update_payment_status(db, payment.id, "failed")
        logger.error("Payment gateway error for booking_id=%d: %s", booking_id, exc)
        raise PaymentError("Payment gateway error. Please try again.") from exc

    update_payment_status(db, payment.id, "succeeded", transaction_id=transaction_id)

    booking.status = "confirmed"
    db.commit()
    db.refresh(booking)

    logger.info(
        "Payment succeeded booking_id=%d user_id=%d amount=%s txn=%s",
        booking_id,
        user_id,
        amount,
        transaction_id,
    )
    return booking


def refund_payment(db: Session, payment_id: int) -> Optional[object]:
    from app.repositories.payment_repository import get_payment_by_id

    payment = get_payment_by_id(db, payment_id)
    if not payment:
        raise PaymentError(f"Payment {payment_id} not found")
    if payment.status != "succeeded":
        raise PaymentError(f"Cannot refund a payment with status '{payment.status}'")

    # Replace with actual gateway refund call
    update_payment_status(db, payment_id, "refunded")
    logger.info("Payment refunded payment_id=%d", payment_id)
    return payment
