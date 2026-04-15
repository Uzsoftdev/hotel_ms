from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (CheckConstraint("rating >= 1 AND rating <= 5", name="ck_reviews_rating_range"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    user = relationship("User")
    hotel = relationship("Hotel")

    def __repr__(self) -> str:
        return (
            f"<Review(id={self.id}, user_id={self.user_id}, "
            f"hotel_id={self.hotel_id}, rating={self.rating})>"
        )
