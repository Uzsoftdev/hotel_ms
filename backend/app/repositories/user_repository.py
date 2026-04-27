from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower().strip()).first()


def get_all_users(db: Session, hotel_id: Optional[int] = None, role: Optional[str] = None) -> List[User]:
    q = db.query(User)
    if hotel_id is not None:
        q = q.filter(User.hotel_id == hotel_id)
    if role:
        q = q.filter(User.role == role)
    return q.order_by(User.created_at.desc()).all()


def update_user(db: Session, user_id: int, data: dict) -> Optional[User]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    for k, v in data.items():
        setattr(user, k, v)
    db.commit()
    db.refresh(user)
    return user


def create_user(db: Session, data: dict) -> User:
    user = User(**data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> bool:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True
