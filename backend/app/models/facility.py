from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from core.database import Base


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    hotel_facilities = relationship("HotelFacility", back_populates="facility")
    hotels = relationship(
        "Hotel",
        secondary="hotel_facilities",
        back_populates="facilities",
    )

    def __repr__(self) -> str:
        return f"<Facility(id={self.id}, name='{self.name}')>"
