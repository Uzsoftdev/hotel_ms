from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.review import Review


def create_review(db: Session, data: dict) -> Review:
    review = Review(**data)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def get_review_by_id(db: Session, review_id: int) -> Optional[Review]:
    return db.query(Review).filter(Review.id == review_id).first()


def get_reviews_for_hotel(db: Session, hotel_id: int) -> List[Review]:
    return db.query(Review).filter(Review.hotel_id == hotel_id).order_by(Review.created_at.desc()).all()


def get_reviews_by_user(db: Session, user_id: int) -> List[Review]:
    return db.query(Review).filter(Review.user_id == user_id).order_by(Review.created_at.desc()).all()


def update_review(db: Session, review_id: int, user_id: int, data: dict) -> Optional[Review]:
    review = db.query(Review).filter(Review.id == review_id, Review.user_id == user_id).first()
    if not review:
        return None
    for k, v in data.items():
        setattr(review, k, v)
    db.commit()
    db.refresh(review)
    return review


def delete_review(db: Session, review_id: int, user_id: int) -> bool:
    review = db.query(Review).filter(Review.id == review_id, Review.user_id == user_id).first()
    if not review:
        return False
    db.delete(review)
    db.commit()
    return True


def user_has_reviewed(db: Session, user_id: int, hotel_id: int) -> bool:
    return db.query(Review).filter(Review.user_id == user_id, Review.hotel_id == hotel_id).first() is not None
