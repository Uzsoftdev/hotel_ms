from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.dependencies import get_current_hotel, get_db
from app.middleware.rbac import require_admin
from app.models.user import User
from app.repositories.user_repository import create_user, delete_user, get_all_users, update_user

router = APIRouter(prefix="/users", tags=["Admin Users"])


class UserAdminCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "guest"


class UserAdminResponse(BaseModel):
    id: int
    full_name: Optional[str]
    email: str
    role: str
    hotel_id: Optional[int]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[UserAdminResponse])
def list_users(
    role: Optional[str] = Query(None),
    hotel_id: int = Depends(get_current_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    return get_all_users(db, hotel_id=hotel_id, role=role)


@router.post("/", response_model=UserAdminResponse, status_code=status.HTTP_201_CREATED)
def add_user(
    data: UserAdminCreate,
    hotel_id: int = Depends(get_current_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    payload = data.model_dump()
    payload["email"] = payload["email"].lower()
    password = payload.pop("password")
    payload["hashed_password"] = hash_password(password)
    payload["hotel_id"] = hotel_id
    return create_user(db, payload)


@router.put("/{user_id}", response_model=UserAdminResponse)
def edit_user(
    user_id: int,
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    updated = update_user(db, user_id, data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> None:
    if not delete_user(db, user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
