import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Text, Integer, func
from sqlalchemy import Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class ConstitutionRule(Base):
    __tablename__ = "constitution_rules"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    rule_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )
    rule_key: Mapped[str] = mapped_column(String(50), nullable=False)
    rule_value: Mapped[dict] = mapped_column(JSON, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    effective_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expired_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
