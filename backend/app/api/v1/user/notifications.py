from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.repositories.notification_repository import (
    get_notifications_for_user,
    mark_all_read,
    mark_read,
)

router = APIRouter(prefix="/notifications", tags=["User Notifications"])


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool

    class Config:
        from_attributes = True


@router.get("/", response_model=List[NotificationResponse])
def list_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Any:
    return get_notifications_for_user(db, user.id)


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def read_notification(notification_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Any:
    n = mark_read(db, notification_id, user.id)
    if not n:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return n


@router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
def read_all_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> None:
    mark_all_read(db, user.id)
