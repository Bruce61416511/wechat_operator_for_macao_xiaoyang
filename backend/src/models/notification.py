import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, Boolean, ForeignKey, func
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    member_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("members.id"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    send_status: Mapped[str] = mapped_column(
        String(20),
        default="待發送", nullable=False
    )
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
