from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from app.models.booking import Booking


def process_payment(
    booking_id: int,
    amount: Decimal,
    db: Optional[Session] = None,
) -> Optional[Booking]:
    """
    Simulate payment processing and confirm booking on success.
    """
    if db is None:
        raise ValueError("A database session is required to process payment")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        return None

    if amount <= 0:
        return None

    if booking.status in {"cancelled", "completed"}:
        return None

    booking.status = "confirmed"
    db.commit()
    db.refresh(booking)
    return booking
