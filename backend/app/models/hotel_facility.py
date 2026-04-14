from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from core.database import Base


class HotelFacility(Base):
    __tablename__ = "hotel_facilities"

    hotel_id = Column(Integer, ForeignKey("hotels.id"), primary_key=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), primary_key=True)

    hotel = relationship("Hotel", back_populates="hotel_facilities")
    facility = relationship("Facility", back_populates="hotel_facilities")
