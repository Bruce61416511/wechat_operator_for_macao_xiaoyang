import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Boolean, Text, Integer, ForeignKey, func
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    id_number: Mapped[str] = mapped_column(String(18), unique=True, nullable=False, index=True)
    applicant_name: Mapped[str] = mapped_column(String(50), nullable=False)
    applicant_phone: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    applicant_email: Mapped[str | None] = mapped_column(String(100), nullable=True)
    applicant_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    career_history: Mapped[str | None] = mapped_column(Text, nullable=True)
    qualifications: Mapped[str | None] = mapped_column(Text, nullable=True)
    qualification_files: Mapped[str | None] = mapped_column(Text, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False, default='')
    requested_tier: Mapped[str | None] = mapped_column(String(20), nullable=True, default=None)
    status: Mapped[str] = mapped_column(
        String(20),
        default="待審核", nullable=False, index=True
    )
    screening_result: Mapped[str | None] = mapped_column(Text, nullable=True)
    screening_by: Mapped[str | None] = mapped_column(String(50), nullable=True)
    final_review_result: Mapped[str | None] = mapped_column(Text, nullable=True)
    final_review_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("members.id"), nullable=True)
    payment_proof_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    payment_verified_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("members.id"), nullable=True)
    payment_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    payment_reject_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    member_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("members.id"), nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    payment_due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
