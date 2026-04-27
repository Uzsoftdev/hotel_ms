from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.booking import Booking
from app.models.user import User
from app.repositories.review_repository import (
    create_review,
    delete_review,
    get_reviews_by_user,
    update_review,
    user_has_reviewed,
)

router = APIRouter(prefix="/reviews", tags=["User Reviews"])


class ReviewCreate(BaseModel):
    hotel_id: int
    rating: int
    comment: Optional[str] = None


class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    hotel_id: int
    user_id: int
    rating: int
    comment: Optional[str]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ReviewResponse])
def list_my_reviews(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Any:
    return get_reviews_by_user(db, user.id)


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Any:
    if not 1 <= data.rating <= 5:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rating must be between 1 and 5")

    completed = (
        db.query(Booking)
        .filter(Booking.user_id == user.id, Booking.hotel_id == data.hotel_id, Booking.status == "completed")
        .first()
    )
    if not completed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review hotels where you have completed a stay",
        )

    if user_has_reviewed(db, user.id, data.hotel_id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already reviewed this hotel")

    return create_review(db, {"user_id": user.id, "hotel_id": data.hotel_id, "rating": data.rating, "comment": data.comment})


@router.put("/{review_id}", response_model=ReviewResponse)
def edit_review(
    review_id: int,
    data: ReviewUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Any:
    updated = update_review(db, review_id, user.id, data.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return updated


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_review(review_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> None:
    if not delete_review(db, review_id, user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
