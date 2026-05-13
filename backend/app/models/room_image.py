from sqlalchemy import Boolean, Column, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class RoomImage(Base):
    __tablename__ = "room_images"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(Text)
    is_primary = Column(Boolean, nullable=False, default=False)

    room = relationship("Room", back_populates="images")

    def __repr__(self) -> str:
        return (
            f"<RoomImage(id={self.id}, room_id={self.room_id}, "
            f"is_primary={self.is_primary})>"
        )
