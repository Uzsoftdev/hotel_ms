from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.core.database import Base


class RoomAmenity(Base):
    __tablename__ = "room_amenities"

    room_id = Column(Integer, ForeignKey("rooms.id"), primary_key=True)
    amenity_id = Column(Integer, ForeignKey("amenities.id"), primary_key=True)

    room = relationship("Room")
    amenity = relationship("Amenity")
