from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, decode_token
from app.dependencies import get_db
from app.middleware.rate_limit import limiter
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services.auth import authenticate_user, register_user

router = APIRouter(prefix="/auth", tags=["Auth"])


def _token_payload(user: Any) -> dict:
    return {
        "user_id": user.id,
        "role": user.role,
        "hotel_id": user.hotel_id,
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def register_endpoint(
    request: Request,
    payload: RegisterRequest,
    db: Session = Depends(get_db),
) -> dict:
    user = register_user(db, payload)
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "hotel_id": user.hotel_id,
    }


@router.post("/login", response_model=TokenResponse)
@limiter.limit("20/minute")
def login_endpoint(
    request: Request,
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    data = _token_payload(user)
    return TokenResponse(
        access_token=create_access_token(data),
        refresh_token=create_refresh_token(data),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_endpoint(refresh_token: str, db: Session = Depends(get_db)) -> TokenResponse:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
    )
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise credentials_exc
        user_id = payload.get("user_id")
        if not user_id:
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    from app.models.user import User
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise credentials_exc

    data = _token_payload(user)
    return TokenResponse(
        access_token=create_access_token(data),
        refresh_token=create_refresh_token(data),
    )
