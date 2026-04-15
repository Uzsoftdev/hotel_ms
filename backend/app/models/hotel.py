from sqlalchemy import Column, DateTime, Index, Integer, Numeric, String, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Hotel(Base):
    __tablename__ = "hotels"
    __table_args__ = (
        Index("ix_hotels_city_country", "city", "country"),
        Index("ix_hotels_latitude_longitude", "latitude", "longitude"),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    address = Column(Text)
    city = Column(String)
    country = Column(String)
    country_code = Column(String(5))
    phone = Column(String)
    email = Column(String)
    latitude = Column(Numeric(10, 6))
    longitude = Column(Numeric(10, 6))
    rating = Column(Numeric(3, 2), nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    hotel_facilities = relationship("HotelFacility", back_populates="hotel")
    facilities = relationship(
        "Facility",
        secondary="hotel_facilities",
        back_populates="hotels",
    )

    def __repr__(self) -> str:
        return f"<Hotel(id={self.id}, name='{self.name}')>"
