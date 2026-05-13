import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from fastapi import APIRouter, Body, Depends, HTTPException, Request, status
from jose import JWTError
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password
from app.dependencies import get_db, oauth2_scheme
from app.middleware.rate_limit import limiter
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services.auth import authenticate_user, register_user
from app.services.token_blacklist import blacklist_token

router = APIRouter(prefix="/auth", tags=["Auth"])

_VERIFY_TTL_HOURS = 24
_RESET_TTL_MINUTES = 30


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class VerifyEmailRequest(BaseModel):
    token: str


def _token_payload(user: Any) -> dict:
    return {
        "user_id": user.id,
        "role": user.role,
        "hotel_id": user.hotel_id,
    }


class SocialLoginRequest(BaseModel):
    supabase_access_token: str


@router.post("/social", response_model=TokenResponse)
@limiter.limit("20/minute")
def social_login(
    request: Request,
    payload: SocialLoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Exchange a Supabase OAuth access token for the app's own JWT.

    Works for any Supabase-supported provider (Google, etc.).
    Auto-creates a guest account on first sign-in.
    """
    from app.models.user import User

    # Verify token with Supabase and get the Google user's profile
    try:
        resp = httpx.get(
            "https://svjurtammmnogarbtwou.supabase.co/auth/v1/user",
            headers={"Authorization": f"Bearer {payload.supabase_access_token}"},
            timeout=8,
        )
        resp.raise_for_status()
        supabase_user = resp.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Supabase token",
        )

    email: str = (supabase_user.get("email") or "").lower().strip()
    full_name: str = (
        supabase_user.get("user_metadata", {}).get("full_name")
        or supabase_user.get("user_metadata", {}).get("name")
        or email.split("@")[0]
    )

    if not email:
        raise HTTPException(status_code=400, detail="No email returned from provider")

    # Find existing user or auto-register as guest
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hash_password(secrets.token_urlsafe(32)),  # random unusable password
            role="guest",
            is_email_verified=True,   # trusted — already verified by Google
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    data = _token_payload(user)
    return TokenResponse(
        access_token=create_access_token(data),
        refresh_token=create_refresh_token(data),
    )


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


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout_endpoint(
    token: str = Depends(oauth2_scheme),
    refresh_token: str | None = None,
) -> None:
    """Revoke the access token (and optionally the refresh token) immediately.

    The tokens are stored in Redis until their natural expiry so any further
    requests carrying them are rejected by get_current_user. Clients should
    also discard tokens locally after calling this endpoint.
    """
    for t in filter(None, [token, refresh_token]):
        try:
            payload = decode_token(t)
            jti = payload.get("jti")
            exp = payload.get("exp")
            if jti and exp:
                blacklist_token(jti, int(exp))
        except Exception:
            pass   # expired or malformed token — nothing to revoke


@router.post("/verify-email", status_code=status.HTTP_204_NO_CONTENT)
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)) -> None:
    from app.models.email_verification import EmailVerification
    record = (
        db.query(EmailVerification)
        .filter(
            EmailVerification.token == payload.token,
            EmailVerification.used_at.is_(None),
            EmailVerification.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification token")

    from app.models.user import User
    db.query(User).filter(User.id == record.user_id).update({"is_email_verified": True})
    record.used_at = datetime.now(timezone.utc)
    db.commit()


@router.post("/resend-verification", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("3/minute")
def resend_verification(
    request: Request,
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> None:
    from app.models.email_verification import EmailVerification
    from app.models.user import User
    from app.tasks.email_tasks import send_verification_email_task

    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or user.is_email_verified:
        return  # silent — don't leak whether email is registered

    token = secrets.token_urlsafe(32)
    ev = EmailVerification(
        user_id=user.id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=_VERIFY_TTL_HOURS),
    )
    db.add(ev)
    db.commit()
    send_verification_email_task.delay(to=user.email, full_name=user.full_name or "", token=token)


@router.post("/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("5/minute")
def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> None:
    from app.models.password_reset import PasswordReset
    from app.models.user import User
    from app.tasks.email_tasks import send_password_reset_task

    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        return  # silent — don't leak whether email is registered

    token = secrets.token_urlsafe(32)
    pr = PasswordReset(
        user_id=user.id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=_RESET_TTL_MINUTES),
    )
    db.add(pr)
    db.commit()
    send_password_reset_task.delay(to=user.email, full_name=user.full_name or "", token=token)


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> None:
    from app.models.password_reset import PasswordReset
    from app.models.user import User

    record = (
        db.query(PasswordReset)
        .filter(
            PasswordReset.token == payload.token,
            PasswordReset.used_at.is_(None),
            PasswordReset.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Password must be at least 8 characters")

    db.query(User).filter(User.id == record.user_id).update({"hashed_password": hash_password(payload.new_password)})
    record.used_at = datetime.now(timezone.utc)
    db.commit()


@router.post("/refresh", response_model=TokenResponse)
def refresh_endpoint(
    refresh_token: str = Body(..., embed=True),
    db: Session = Depends(get_db),
) -> TokenResponse:
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
