import uuid
from datetime import datetime

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.database import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    price_normal: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    price_advanced: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_participants: Mapped[int | None] = mapped_column(Integer, nullable=True)
    registration_status: Mapped[str] = mapped_column(
        String(20),
        default="開放", nullable=False, index=True
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("members.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class EventRegistration(Base):
    __tablename__ = "event_registrations"
    __table_args__ = (UniqueConstraint("event_id", "member_id", name="uq_event_member"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    event_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("events.id"), nullable=False)
    member_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("members.id"), nullable=False)
    registered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    status: Mapped[str] = mapped_column(
        String(20),
        default="已報名", nullable=False
    )
