from typing import Any, Generator

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.models.user import User
from app.services.token_blacklist import is_blacklisted

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/public/auth/login")


def get_db(request: Request) -> Any:
    """Write DB session — attached to request state by DBSessionMiddleware."""
    db = getattr(request.state, "db", None)
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database session unavailable",
        )
    return db


def get_read_db() -> Generator[Session, None, None]:
    """Read-only DB session — routes to replica via PgBouncer when configured.
    Falls back to the write engine transparently in local dev."""
    from app.core.database import ReadSessionLocal
    db = ReadSessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Any = Depends(get_db),
) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise credentials_exc
        user_id = payload.get("user_id")
        if user_id is None:
            raise credentials_exc
        jti = payload.get("jti")
        if jti and is_blacklisted(jti):
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exc
    return user


def get_current_hotel(user: User = Depends(get_current_user)) -> int:
    hotel_id = getattr(user, "hotel_id", None)
    if hotel_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not assigned to a hotel",
        )
    return int(hotel_id)
