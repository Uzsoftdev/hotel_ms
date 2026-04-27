import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User

logger = logging.getLogger(__name__)


def _get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower().strip()).first()


def register_user(db: Session, user_data: object) -> User:
    if hasattr(user_data, "model_dump"):
        payload = user_data.model_dump()
    elif hasattr(user_data, "dict"):
        payload = user_data.dict()
    else:
        payload = dict(vars(user_data))

    password = payload.pop("password")
    payload["email"] = payload["email"].lower().strip()
    payload["hashed_password"] = hash_password(password)

    user = User(**payload)
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Registered new user id=%d email=%s role=%s", user.id, user.email, user.role)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = _get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):  # type: ignore[arg-type]
        logger.warning("Failed login attempt for email=%s", email)
        return None
    return user
