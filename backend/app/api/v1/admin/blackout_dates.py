from datetime import date
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies import get_current_hotel, get_db
from app.middleware.rbac import require_admin
from app.models.blackout_date import BlackoutDate
from app.models.user import User

router = APIRouter(prefix="/blackout-dates", tags=["Admin Blackout Dates"])


class BlackoutCreate(BaseModel):
    date: date
    room_id: Optional[int] = None
    reason: Optional[str] = None


class BlackoutResponse(BaseModel):
    id: int
    hotel_id: int
    room_id: Optional[int]
    date: date
    reason: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/", response_model=List[BlackoutResponse])
def list_blackout_dates(hotel_id: int = Depends(get_current_hotel), db: Session = Depends(get_db)) -> Any:
    return db.query(BlackoutDate).filter(BlackoutDate.hotel_id == hotel_id).order_by(BlackoutDate.date).all()


@router.post("/", response_model=BlackoutResponse, status_code=status.HTTP_201_CREATED)
def create_blackout(
    data: BlackoutCreate,
    hotel_id: int = Depends(get_current_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    bd = BlackoutDate(hotel_id=hotel_id, **data.model_dump())
    db.add(bd)
    db.commit()
    db.refresh(bd)
    return bd


@router.delete("/{bd_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blackout(
    bd_id: int,
    hotel_id: int = Depends(get_current_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> None:
    bd = db.query(BlackoutDate).filter(BlackoutDate.id == bd_id, BlackoutDate.hotel_id == hotel_id).first()
    if not bd:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blackout date not found")
    db.delete(bd)
    db.commit()
