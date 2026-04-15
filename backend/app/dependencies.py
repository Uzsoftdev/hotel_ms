from typing import Any

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core import config
from app.core.security import ALGORITHM
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db(request: Request) -> Any:
    db = getattr(request.state, "db", None)
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database session is not available",
        )
    return db


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Any = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    secret_key = getattr(config, "SECRET_KEY", None)
    if not secret_key:
        raise credentials_exception

    try:
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception

    return user


def get_current_hotel(user: Any = Depends(get_current_user)) -> int:
    hotel_id = getattr(user, "hotel_id", None)

    if hotel_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not assigned to a hotel",
        )

    return int(hotel_id)
