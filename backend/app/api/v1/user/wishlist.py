from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.models.wishlist import WishlistItem

router = APIRouter(prefix="/wishlist", tags=["User Wishlist"])


class WishlistResponse(BaseModel):
    id: int
    hotel_id: int | None

    class Config:
        from_attributes = True


class SavedRoomResponse(BaseModel):
    id: int
    room_id: int

    class Config:
        from_attributes = True


# ── Hotel-level wishlist ────────────────────────────────────────────────────

@router.get("/", response_model=List[WishlistResponse])
def list_wishlist(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Any:
    return db.query(WishlistItem).filter(WishlistItem.user_id == user.id, WishlistItem.hotel_id.isnot(None)).all()


@router.post("/{hotel_id}", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(hotel_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Any:
    existing = db.query(WishlistItem).filter(WishlistItem.user_id == user.id, WishlistItem.hotel_id == hotel_id).first()
    if existing:
        return existing
    item = WishlistItem(user_id=user.id, hotel_id=hotel_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{hotel_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(hotel_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> None:
    item = db.query(WishlistItem).filter(WishlistItem.user_id == user.id, WishlistItem.hotel_id == hotel_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not in wishlist")
    db.delete(item)
    db.commit()


# ── Room-level favourites ──────────────────────────────────────────────────

@router.get("/rooms", response_model=List[SavedRoomResponse])
def list_saved_rooms(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Any:
    return (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == user.id, WishlistItem.room_id.isnot(None))
        .all()
    )


@router.post("/rooms/{room_id}", response_model=SavedRoomResponse, status_code=status.HTTP_201_CREATED)
def save_room(room_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> Any:
    existing = db.query(WishlistItem).filter(WishlistItem.user_id == user.id, WishlistItem.room_id == room_id).first()
    if existing:
        return existing
    item = WishlistItem(user_id=user.id, room_id=room_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/rooms/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave_room(room_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> None:
    item = db.query(WishlistItem).filter(WishlistItem.user_id == user.id, WishlistItem.room_id == room_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not saved")
    db.delete(item)
    db.commit()
