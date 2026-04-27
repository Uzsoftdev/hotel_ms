"""
Email service using aiosmtplib for async SMTP delivery.
Set EMAILS_ENABLED=true and SMTP_* variables in .env to activate.
"""
import asyncio
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Optional

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)

_TEMPLATES_DIR = Path(__file__).parent.parent / "templates"


def _load_template(name: str, context: dict) -> str:
    path = _TEMPLATES_DIR / name
    if not path.exists():
        logger.warning("Email template not found: %s", name)
        return "\n".join(f"{k}: {v}" for k, v in context.items())
    html = path.read_text(encoding="utf-8")
    for key, value in context.items():
        html = html.replace(f"{{{{{key}}}}}", str(value))
    return html


async def _send(to: str, subject: str, html: str) -> None:
    if not settings.EMAILS_ENABLED:
        logger.debug("Email disabled — would have sent '%s' to %s", subject, to)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        logger.info("Email sent subject='%s' to=%s", subject, to)
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to, exc)


def send_welcome_email(to: str, full_name: str) -> None:
    html = _load_template("welcome_email.html", {"full_name": full_name})
    asyncio.create_task(_send(to, f"Welcome to {settings.APP_NAME}!", html))


def send_booking_confirmation(to: str, full_name: str, booking_id: int, check_in: str, check_out: str, room: str, total: str) -> None:
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
    asyncio.create_task(_send(to, f"Booking #{booking_id} Confirmed", html))


def send_booking_cancellation(to: str, full_name: str, booking_id: int) -> None:
    html = _load_template("booking_cancellation.html", {"full_name": full_name, "booking_id": booking_id})
    asyncio.create_task(_send(to, f"Booking #{booking_id} Cancelled", html))


def send_password_reset(to: str, reset_link: str) -> None:
    html = _load_template("password_reset.html", {"reset_link": reset_link})
    asyncio.create_task(_send(to, "Reset your password", html))


def send_checkin_reminder(to: str, full_name: str, check_in: str, hotel_name: str) -> None:
    html = _load_template(
        "reminder_checkin.html",
        {"full_name": full_name, "check_in": check_in, "hotel_name": hotel_name},
    )
    asyncio.create_task(_send(to, f"Reminder: Your check-in at {hotel_name} is tomorrow", html))
