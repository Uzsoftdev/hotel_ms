import re
from datetime import date

_EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")
_PHONE_RE = re.compile(r"^\+?[1-9]\d{6,14}$")

# Password must have ≥8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
_PASSWORD_RE = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$")


def validate_email(value: str) -> str:
    value = value.strip().lower()
    if not _EMAIL_RE.match(value):
        raise ValueError("Invalid email address format")
    return value


def validate_password_strength(value: str) -> str:
    if not _PASSWORD_RE.match(value):
        raise ValueError(
            "Password must be at least 8 characters and include uppercase, "
            "lowercase, a digit, and a special character"
        )
    return value


def validate_phone(value: str) -> str:
    cleaned = re.sub(r"[\s\-()]", "", value)
    if not _PHONE_RE.match(cleaned):
        raise ValueError("Invalid phone number — use E.164 format e.g. +998901234567")
    return cleaned


def validate_check_in_out(check_in: date, check_out: date) -> None:
    today = date.today()
    if check_in < today:
        raise ValueError("check_in cannot be in the past")
    if check_out <= check_in:
        raise ValueError("check_out must be after check_in")
    max_stay_days = 90
    if (check_out - check_in).days > max_stay_days:
        raise ValueError(f"Stay cannot exceed {max_stay_days} days")


def validate_coordinates(lat: float, lon: float) -> None:
    if not (-90 <= lat <= 90):
        raise ValueError("Latitude must be between -90 and 90")
    if not (-180 <= lon <= 180):
        raise ValueError("Longitude must be between -180 and 180")
