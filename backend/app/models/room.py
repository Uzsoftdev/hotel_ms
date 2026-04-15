from sqlalchemy import Boolean, Column, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Room(Base):
    __tablename__ = "rooms"
    __table_args__ = (Index("ix_rooms_hotel_id", "hotel_id"),)

    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_type_id = Column(Integer, ForeignKey("room_types.id"), nullable=False)
    room_number = Column(String)
    capacity = Column(Integer)
    base_price = Column(Numeric(10, 2))
    description = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True)

    hotel = relationship("Hotel")
    room_type = relationship("RoomType")

    def __repr__(self) -> str:
        return (
            f"<Room(id={self.id}, hotel_id={self.hotel_id}, "
            f"room_type_id={self.room_type_id}, room_number='{self.room_number}')>"
        )
