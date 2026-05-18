from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class GuestNote(Base):
    __tablename__ = "guest_notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    note_type = Column(String, nullable=False, default="general")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # The guest this note belongs to
    user = relationship("User", foreign_keys=[user_id], back_populates=None)
    # The admin/staff who wrote the note
    author = relationship("User", foreign_keys=[author_id], back_populates=None)

    def __repr__(self) -> str:
        return f"<GuestNote(id={self.id}, user_id={self.user_id}, type='{self.note_type}')>"
