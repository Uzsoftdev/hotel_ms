import os
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User

try:
    from app.repositories import user_repository
except Exception:  # pragma: no cover
    user_repository = None  # type: ignore[assignment]


# Enable this only for local testing.
ENABLE_HARDCODED_AUTH = os.getenv("ENABLE_HARDCODED_AUTH", "false").lower() == "true"

_HARDCODED_USERS: Dict[str, Dict[str, Any]] = {
    "admin@hotel.test": {
        "id": 9001,
        "full_name": "Demo Admin",
        "email": "admin@hotel.test",
        "password": "Admin@123",
        "role": "hotel_admin",
        "hotel_id": 1,
    },
    "staff@hotel.test": {
        "id": 9002,
        "full_name": "Demo Staff",
        "email": "staff@hotel.test",
        "password": "Staff@123",
        "role": "staff",
        "hotel_id": 1,
    },
    "guest@hotel.test": {
        "id": 9003,
        "full_name": "Demo Guest",
        "email": "guest@hotel.test",
        "password": "Guest@123",
        "role": "guest",
        "hotel_id": 1,
    },
}


def _repo_create_user(db: Session, data: dict) -> User:
    if user_repository and hasattr(user_repository, "create_user"):
        return user_repository.create_user(db, data) # type: ignore

    user = User(**data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _repo_get_user_by_email(db: Session, email: str) -> Optional[User]:
    if user_repository and hasattr(user_repository, "get_user_by_email"):
        return user_repository.get_user_by_email(db, email) # type: ignore

    return db.query(User).filter(User.email == email).first()


def _authenticate_hardcoded_user(email: str, password: str) -> Optional[User]:
    if not ENABLE_HARDCODED_AUTH:
        return None

    record = _HARDCODED_USERS.get(email.lower())
    if not record:
        return None

    if password != record["password"]:
        return None

    return User(
        id=record["id"],
        full_name=record["full_name"],
        email=record["email"],
        hashed_password=hash_password(record["password"]),
        role=record["role"],
        hotel_id=record["hotel_id"],
    )


def register_user(db: Session, user_data: Any) -> User:
    if hasattr(user_data, "dict"):
        payload = user_data.dict()
    elif isinstance(user_data, dict):
        payload = dict(user_data)
    else:
        payload = dict(vars(user_data))

    password = payload.pop("password")
    payload["hashed_password"] = hash_password(password)

    return _repo_create_user(db, payload)


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    try:
        user = _repo_get_user_by_email(db, email)
        if user and verify_password(password, user.hashed_password):  # type: ignore[arg-type]
            return user
    except Exception:
        # If DB auth fails in local/dev setup, optional hard-coded auth can be used.
        pass

    return _authenticate_hardcoded_user(email, password)
