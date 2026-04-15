from sqlalchemy import Column, Date, ForeignKey, Index, Integer, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class BlackoutDate(Base):
    __tablename__ = "blackout_dates"
    __table_args__ = (Index("ix_blackout_dates_hotel_id_date", "hotel_id", "date"),)

    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    date = Column(Date, nullable=False)
    reason = Column(Text)

    hotel = relationship("Hotel")
    room = relationship("Room")

    def __repr__(self) -> str:
        return (
            f"<BlackoutDate(id={self.id}, hotel_id={self.hotel_id}, "
            f"room_id={self.room_id}, date={self.date})>"
        )
