import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, Boolean, ForeignKey, func, Enum as SAEnum
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column
import enum

from ..core.database import Base


class AnnouncementCategory(str, enum.Enum):
    ASSOCIATION = "協會動態"
    EVENT_PREVIEW = "活動預告"
    MEMBER_NEWS = "會員喜報"
    COOPERATION = "合作公告"
    POLICY = "制度更新"
    INDUSTRY = "行業快訊"


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("members.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
