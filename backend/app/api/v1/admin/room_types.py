from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies import get_current_hotel, get_db
from app.middleware.rbac import require_admin
from app.models.room_type import RoomType
from app.models.user import User

router = APIRouter(prefix="/room-types", tags=["Admin Room Types"])


class RoomTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None


class RoomTypeResponse(BaseModel):
    id: int
    hotel_id: int
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[RoomTypeResponse])
def list_room_types(hotel_id: int = Depends(get_current_hotel), db: Session = Depends(get_db)) -> Any:
    return db.query(RoomType).filter(RoomType.hotel_id == hotel_id).all()


@router.post("/", response_model=RoomTypeResponse, status_code=status.HTTP_201_CREATED)
def create_room_type(
    data: RoomTypeCreate,
    hotel_id: int = Depends(get_current_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    rt = RoomType(hotel_id=hotel_id, **data.model_dump())
    db.add(rt)
    db.commit()
    db.refresh(rt)
    return rt


@router.put("/{rt_id}", response_model=RoomTypeResponse)
def update_room_type(
    rt_id: int,
    data: RoomTypeCreate,
    hotel_id: int = Depends(get_current_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> Any:
    rt = db.query(RoomType).filter(RoomType.id == rt_id, RoomType.hotel_id == hotel_id).first()
    if not rt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room type not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(rt, k, v)
    db.commit()
    db.refresh(rt)
    return rt


@router.delete("/{rt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room_type(
    rt_id: int,
    hotel_id: int = Depends(get_current_hotel),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> None:
    rt = db.query(RoomType).filter(RoomType.id == rt_id, RoomType.hotel_id == hotel_id).first()
    if not rt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room type not found")
    db.delete(rt)
    db.commit()
