from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Index, Integer, Numeric, String, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (
        Index("ix_payments_booking_id", "booking_id"),
        Index("ix_payments_user_id", "user_id"),
        CheckConstraint(
            "status IN ('pending', 'succeeded', 'failed', 'refunded')",
            name="ck_payments_status",
        ),
        CheckConstraint(
            "method IN ('card', 'cash', 'bank_transfer', 'wallet')",
            name="ck_payments_method",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    method = Column(String, nullable=False, default="card")
    status = Column(String, nullable=False, default="pending")
    # External gateway transaction ID (Stripe charge_id, etc.)
    transaction_id = Column(String, nullable=True, unique=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    booking = relationship("Booking", back_populates="payments")
    user = relationship("User")

    def __repr__(self) -> str:
        return f"<Payment(id={self.id}, booking_id={self.booking_id}, status='{self.status}')>"
