from sqlalchemy import (
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class PricingRule(Base):
    __tablename__ = "pricing_rules"
    __table_args__ = (
        Index(
            "ix_pricing_rules_hotel_room_type_dates",
            "hotel_id",
            "room_type_id",
            "start_date",
            "end_date",
        ),
        CheckConstraint(
            "price IS NOT NULL OR multiplier IS NOT NULL",
            name="ck_pricing_rules_price_or_multiplier",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False)
    room_type_id = Column(Integer, ForeignKey("room_types.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    price = Column(Numeric(10, 2), nullable=True)
    multiplier = Column(Numeric(6, 3), nullable=True)
    priority = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    hotel = relationship("Hotel")
    room_type = relationship("RoomType")

    def __repr__(self) -> str:
        return (
            f"<PricingRule(id={self.id}, hotel_id={self.hotel_id}, "
            f"room_type_id={self.room_type_id}, priority={self.priority})>"
        )
