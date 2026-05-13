"""
Async email dispatch via Celery.

These tasks replace the asyncio.create_task() calls in email.py that were
silently dropping emails when called from a sync context (no running event loop).
Each task uses asyncio.run() to drive the async SMTP send from a sync worker.
"""
import asyncio
import logging

from app.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60, name="app.tasks.email_tasks.send_email")
def send_email(self, to: str, subject: str, html: str) -> None:
    from app.services.email import _send
    try:
        asyncio.run(_send(to, subject, html))
    except Exception as exc:
        logger.error("send_email failed to=%s subject=%s: %s", to, subject, exc)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60, name="app.tasks.email_tasks.send_welcome_email")
def send_welcome_email_task(self, to: str, full_name: str) -> None:
    from app.core.config import settings
    from app.services.email import _load_template, _send
    try:
        html = _load_template("welcome_email.html", {"full_name": full_name})
        asyncio.run(_send(to, f"Welcome to {settings.APP_NAME}!", html))
    except Exception as exc:
        logger.error("send_welcome_email_task failed to=%s: %s", to, exc)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60, name="app.tasks.email_tasks.send_booking_confirmation")
def send_booking_confirmation_task(
    self,
    to: str,
    full_name: str,
    booking_id: int,
    check_in: str,
    check_out: str,
    room: str,
    total: str,
) -> None:
    from app.services.email import _load_template, _send
    try:
        html = _load_template(
            "booking_confirmation.html",
            {
                "full_name": full_name,
                "booking_id": booking_id,
                "check_in": check_in,
                "check_out": check_out,
                "room": room,
                "total": total,
            },
        )
        asyncio.run(_send(to, f"Booking #{booking_id} Confirmed", html))
    except Exception as exc:
        logger.error("send_booking_confirmation_task failed to=%s booking_id=%s: %s", to, booking_id, exc)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60, name="app.tasks.email_tasks.send_booking_cancellation")
def send_booking_cancellation_task(self, to: str, full_name: str, booking_id: int) -> None:
    from app.services.email import _load_template, _send
    try:
        html = _load_template("booking_cancellation.html", {"full_name": full_name, "booking_id": booking_id})
        asyncio.run(_send(to, f"Booking #{booking_id} Cancelled", html))
    except Exception as exc:
        logger.error("send_booking_cancellation_task failed to=%s booking_id=%s: %s", to, booking_id, exc)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60, name="app.tasks.email_tasks.send_checkin_reminder")
def send_checkin_reminder_task(self, to: str, full_name: str, check_in: str, hotel_name: str) -> None:
    from app.services.email import _load_template, _send
    try:
        html = _load_template(
            "reminder_checkin.html",
            {"full_name": full_name, "check_in": check_in, "hotel_name": hotel_name},
        )
        asyncio.run(_send(to, f"Reminder: Your check-in at {hotel_name} is tomorrow", html))
    except Exception as exc:
        logger.error("send_checkin_reminder_task failed to=%s: %s", to, exc)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60, name="app.tasks.email_tasks.send_verification_email")
def send_verification_email_task(self, to: str, full_name: str, token: str) -> None:
    from app.core.config import settings
    from app.services.email import _load_template, _send
    try:
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        html = _load_template(
            "email_verification.html",
            {"full_name": full_name, "verify_url": verify_url},
        )
        asyncio.run(_send(to, "Verify your email address", html))
    except Exception as exc:
        logger.error("send_verification_email_task failed to=%s: %s", to, exc)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60, name="app.tasks.email_tasks.send_password_reset")
def send_password_reset_task(self, to: str, full_name: str, token: str) -> None:
    from app.core.config import settings
    from app.services.email import _load_template, _send
    try:
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        html = _load_template(
            "password_reset.html",
            {"full_name": full_name, "reset_url": reset_url},
        )
        asyncio.run(_send(to, "Reset your password", html))
    except Exception as exc:
        logger.error("send_password_reset_task failed to=%s: %s", to, exc)
        raise self.retry(exc=exc)
