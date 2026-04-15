from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt
from passlib.context import CryptContext

from app.core import config

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def hash_password(password: str) -> str:
	return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
	return pwd_context.verify(password, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
	secret_key = getattr(config, "SECRET_KEY", None)
	if not secret_key:
		raise ValueError("SECRET_KEY is not configured")

	required_fields = ("user_id", "role", "hotel_id")
	missing_fields = [field for field in required_fields if field not in data]
	if missing_fields:
		raise ValueError(f"Missing required token fields: {', '.join(missing_fields)}")

	expire = datetime.now(timezone.utc) + (
		expires_delta if expires_delta is not None else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
	)

	to_encode = {
		"user_id": data["user_id"],
		"role": data["role"],
		"hotel_id": data["hotel_id"],
		"exp": expire,
	}
	return jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)
