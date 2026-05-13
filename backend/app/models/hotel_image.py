from sqlalchemy import Boolean, Column, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class HotelImage(Base):
    __tablename__ = "hotel_images"

    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    image_url = Column(Text, nullable=False)
    is_primary = Column(Boolean, nullable=False, default=False)

    hotel = relationship("Hotel", back_populates="images")

    def __repr__(self) -> str:
        return (
            f"<HotelImage(id={self.id}, hotel_id={self.hotel_id}, "
            f"is_primary={self.is_primary})>"
        )
