"""
Payment processing via Celery.

Decouples the gateway call from the HTTP request so slow/failing payment
providers don't block the response thread or exhaust the request pool.
"""
import logging
from decimal import Decimal

from app.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=2, default_retry_delay=30, name="app.tasks.payment_tasks.process_payment")
def process_payment_task(
    self,
    booking_id: int,
    user_id: int,
    amount: str,     # str to survive JSON serialisation of Decimal
    method: str = "card",
    currency: str = "USD",
) -> dict:
    from app.core.database import SessionLocal
    from app.services.payment import PaymentError, process_payment

    db = SessionLocal()
    try:
        booking = process_payment(db, booking_id, user_id, Decimal(amount), method, currency)
        return {"booking_id": booking.id, "status": booking.status}
    except PaymentError as exc:
        logger.error("process_payment_task booking_id=%d: %s", booking_id, exc)
        raise self.retry(exc=exc)
    except Exception as exc:
        logger.error("process_payment_task unexpected error booking_id=%d: %s", booking_id, exc)
        raise self.retry(exc=exc)
    finally:
        db.close()
