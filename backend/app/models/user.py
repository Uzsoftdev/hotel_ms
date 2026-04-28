from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (Index("ix_users_hotel_id", "hotel_id"),)

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(
        Enum("guest", "staff", "hotel_admin", "super_admin", name="user_role"),
        nullable=False,
        default="guest",
    )
    phone = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    is_email_verified = Column(Boolean, nullable=False, default=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    hotel = relationship("Hotel")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
