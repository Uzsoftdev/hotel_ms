from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.dependencies import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services.auth import authenticate_user, register_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_endpoint(
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
def login_endpoint(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> Any:
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        {
            "user_id": user.id,
            "role": user.role,
            "hotel_id": user.hotel_id,
        }
    )

    return TokenResponse(access_token=token, token_type="bearer")
