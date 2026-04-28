import os
import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.repositories.user_repository import update_user

router = APIRouter(prefix="/profile", tags=["User Profile"])

AVATAR_DIR = "static/avatars"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024  # 5 MB


class ProfileResponse(BaseModel):
    id: int
    full_name: Optional[str]
    email: str
    phone: Optional[str]
    photo_url: Optional[str] = None
    role: str
    hotel_id: Optional[int]

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


@router.get("/", response_model=ProfileResponse)
def get_profile(user: User = Depends(get_current_user)) -> Any:
    return user


@router.put("/", response_model=ProfileResponse)
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Any:
    payload = data.model_dump(exclude_none=True)
    if "email" in payload:
        payload["email"] = payload["email"].lower()
    updated = update_user(db, user.id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated


@router.put("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    from app.core.security import verify_password
    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    update_user(db, user.id, {"hashed_password": hash_password(data.new_password)})


@router.post("/photo", response_model=ProfileResponse)
async def upload_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Any:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPEG, PNG, and WebP images are allowed.")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is too large. Maximum size is 5 MB.")

    os.makedirs(AVATAR_DIR, exist_ok=True)

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    filename = f"user_{user.id}_{uuid.uuid4().hex}.{ext}"
    path = os.path.join(AVATAR_DIR, filename)

    # Delete old avatar file if it exists
    old_url = getattr(user, "photo_url", None)
    if old_url:
        old_file = old_url.lstrip("/").replace("static/avatars/", "")
        old_path = os.path.join(AVATAR_DIR, old_file)
        if os.path.isfile(old_path):
            os.remove(old_path)

    with open(path, "wb") as f:
        f.write(contents)

    photo_url = f"/static/avatars/{filename}"
    updated = update_user(db, user.id, {"photo_url": photo_url})
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated
