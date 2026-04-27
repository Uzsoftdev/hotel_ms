from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(db: Session, user_id: int, title: str, message: str, type: str = "info") -> Notification:
    n = Notification(user_id=user_id, title=title, message=message, type=type)
    db.add(n)
    db.commit()
    db.refresh(n)
    return n


def get_notifications_for_user(db: Session, user_id: int) -> List[Notification]:
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()


def mark_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
    n = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if not n:
        return None
    n.is_read = True
    db.commit()
    db.refresh(n)
    return n


def mark_all_read(db: Session, user_id: int) -> int:
    count = db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return count
