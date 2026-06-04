import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Boolean, Text, func
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class Member(Base):
    __tablename__ = "members"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    id_number: Mapped[str | None] = mapped_column(String(18), unique=True, nullable=True)
    real_name: Mapped[str] = mapped_column(String(50), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    wechat_openid: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    tier: Mapped[str] = mapped_column(String(30), default="個人會員", nullable=False)
    member_type: Mapped[str] = mapped_column(String(20), default="????", nullable=False)
    annual_fee: Mapped[int] = mapped_column(default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    career_history: Mapped[str | None] = mapped_column(Text, nullable=True)
    qualifications: Mapped[str | None] = mapped_column(Text, nullable=True)
    qualification_files: Mapped[str | None] = mapped_column(Text, nullable=True)
    company_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    business_reg_no: Mapped[str | None] = mapped_column(String(50), nullable=True)
    company_logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    brand_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    featured_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
