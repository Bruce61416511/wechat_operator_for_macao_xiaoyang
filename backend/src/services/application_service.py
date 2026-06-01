import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.application import Application
from ..models.member import Member


class ApplicationService:
    """入會申請服務：CRUD + 狀態流轉 + 重複檢測 + 駁回重申請"""

    VALID_TRANSITIONS = {
        "待審核": ["初審通過", "初審不通過"],
        "初審通過": ["終審通過", "終審不通過"],
        "終審通過": ["待繳費"],
        "待繳費": ["已繳費", "已過期"],
        "已繳費": ["已入會", "待繳費"],
        "初審不通過": ["待審核"],
        "終審不通過": ["待審核"],
    }

    RESUBMIT_COOLDOWN = {"初審不通過": timedelta(0), "終審不通過": timedelta(days=30)}

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_application(self, data: dict) -> Application:
        existing = await self.db.execute(select(Application).where(Application.username == data["username"]))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail={"error": "duplicate_application", "message": "該用戶名已被佔用"})
        existing = await self.db.execute(select(Application).where(Application.id_number == data["id_number"]))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail={"error": "duplicate_application", "message": "該身份證號已提交過申請"})
        
        from ..core.security import hash_password
        data['password_hash'] = hash_password(data.pop('password', ''))
        app = Application(**data)
        self.db.add(app)
        await self.db.flush()
        # Auto-trigger screening
        from .screening_service import ScreeningService
        screener = ScreeningService(self.db)
        result = await screener.evaluate(app)
        await screener.perform_screening(app, "pass" if result["passed"] else "fail", "; ".join(result["reasons"]))
        await self.db.flush()
        return app

    async def get_application(self, app_id: uuid.UUID) -> Application:
        result = await self.db.execute(select(Application).where(Application.id == app_id))
        app = result.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=404, detail={"error": "not_found", "message": "申請不存在"})
        return app

    async def list_applications(self, status: str | None = None, id_number: str | None = None, member_id = None, page: int = 1, page_size: int = 20) -> dict:
        query = select(Application).order_by(Application.submitted_at.desc())
        if status:
            query = query.where(Application.status == status)
        if id_number:
            query = query.where(Application.id_number == id_number)
        if member_id:
            query = query.where(Application.member_id == member_id)
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        apps = result.scalars().all()
        return {"items": [self._to_dict(a) for a in apps], "total": len(apps), "page": page}

    async def transition_status(self, app_id: uuid.UUID, new_status: str, extra: dict | None = None) -> Application:
        app = await self.get_application(app_id)
        allowed = self.VALID_TRANSITIONS.get(app.status, [])
        if new_status not in allowed:
            raise HTTPException(status_code=400, detail={"error": "invalid_transition", "message": f"無法從 {app.status} 變更爲 {new_status}"})
        app.status = new_status
        if extra:
            for k, v in extra.items():
                setattr(app, k, v)
        if new_status == "待繳費":
            app.payment_proof_url = None
            app.payment_due_date = datetime.now(timezone.utc) + timedelta(days=7)
        await self.db.flush()
        return app

    async def verify_payment_and_create_member(self, app_id: uuid.UUID, verifier_id: uuid.UUID) -> dict:
        app = await self.get_application(app_id)
        if app.status not in ("已繳費", "待繳費"):
            raise HTTPException(status_code=400, detail={"error": "invalid_status", "message": "當前狀態不允許操作"})
        app.payment_verified_by = verifier_id
        app.payment_verified_at = datetime.now(timezone.utc)

        # If member_id is set, this is a member info update (tier change), not a new application
        if app.member_id:
            member_result = await self.db.execute(select(Member).where(Member.id == app.member_id))
            member = member_result.scalar_one_or_none()
            if member:
                member.tier = app.requested_tier or member.tier
                member.annual_fee = {"普通會員": 500, "普通會員": 500, "高級會員": 1000}.get(app.requested_tier, 500)
                member.is_active = True
                member.updated_at = datetime.now(timezone.utc)
                app.status = "已入會"
                await self.db.flush()
                return {"application_id": str(app.id), "member_id": str(member.id), "status": "已入會"}

        # New member flow: create member record
        member = Member(
            username=app.username,
            id_number=app.id_number,
            real_name=app.applicant_name,
            phone=app.applicant_phone,
            email=app.applicant_email,
            tier=app.requested_tier or "普通會員",
            password_hash=app.password_hash,
            annual_fee={"普通會員": 500, "普通會員": 500, "高級會員": 1000}.get(app.requested_tier, 500),
        )
        self.db.add(member)
        await self.db.flush()
        app.member_id = member.id
        app.status = "已入會"
        await self.db.flush()
        return {"application_id": str(app.id), "member_id": str(member.id), "status": "已入會"}

    async def resubmit(self, app_id: uuid.UUID, updated_data: dict) -> Application:
        """駁回重申請：檢查冷卻期，保留原數據，修改後重新提交"""
        old_app = await self.get_application(app_id)
        if old_app.status not in ("初審不通過", "終審不通過"):
            raise HTTPException(status_code=400, detail={"error": "not_rejected", "message": "只有被駁回的申請才能重申請"})

        cooldown = self.RESUBMIT_COOLDOWN.get(old_app.status, timedelta(0))
        if cooldown > timedelta(0):
            elapsed = datetime.now(timezone.utc) - old_app.updated_at.replace(tzinfo=timezone.utc)
            if elapsed < cooldown:
                remaining = (cooldown - elapsed).days
                raise HTTPException(status_code=400, detail={"error": "cooldown", "message": f"終審駁回需等待30天，還剩 {remaining} 天"})

        # Delete old app and create new one
        old_username = old_app.username
        old_id_number = old_app.id_number
        await self.db.delete(old_app)
        await self.db.flush()

        new_data = {
            "username": old_username,
            "id_number": old_id_number,
            "password_hash": old_app.password_hash,
            "applicant_name": updated_data.get("applicant_name", old_app.applicant_name),
            "applicant_phone": updated_data.get("applicant_phone", old_app.applicant_phone),
            "applicant_email": updated_data.get("applicant_email", old_app.applicant_email),
            "applicant_address": updated_data.get("applicant_address", old_app.applicant_address),
            "career_history": updated_data.get("career_history", old_app.career_history),
            "qualifications": updated_data.get("qualifications", old_app.qualifications),
        }
        new_app = Application(**new_data)
        self.db.add(new_app)
        await self.db.flush()
        # Auto-trigger screening
        from .screening_service import ScreeningService
        screener = ScreeningService(self.db)
        result = await screener.evaluate(new_app)
        await screener.perform_screening(new_app, "pass" if result["passed"] else "fail", "; ".join(result["reasons"]))
        await self.db.flush()
        return new_app

    async def get_rejection_reason(self, app_id: uuid.UUID) -> dict:
        app = await self.get_application(app_id)
        reason = app.screening_result or app.final_review_result or "無"
        return {"application_id": str(app.id), "status": app.status, "reason": reason, "updated_at": app.updated_at.isoformat() if app.updated_at else None}

    def _to_dict(self, app: Application) -> dict:
        return {
            "id": str(app.id),
            "username": app.username,
            "applicant_name": app.applicant_name,
            "applicant_phone": app.applicant_phone,
            "id_number": app.id_number,
            "applicant_email": app.applicant_email,
            "applicant_address": app.applicant_address,
            "career_history": app.career_history,
            "qualifications": app.qualifications,
            "qualification_files": app.qualification_files,
            "status": app.status,
            "submitted_at": app.submitted_at.isoformat() if app.submitted_at else None,
            "member_id": str(app.member_id) if app.member_id else None,
            "payment_proof_url": app.payment_proof_url,
            "payment_reject_reason": app.payment_reject_reason,
            "requested_tier": app.requested_tier,
            "screening_result": app.screening_result,
            "final_review_result": app.final_review_result,
        }
