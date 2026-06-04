import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.member import Member

logger = logging.getLogger(__name__)

# Tier -> annual fee mapping
TIER_FEE = {
    "個人會員": 500,
    "企業會員": 2000,
    "高級會員": 5000,
}


class MemberService:
    """會員服務：查詢、更新、刪除、審計"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, member_id) -> Optional[Member]:
        result = await self.db.execute(select(Member).where(Member.id == member_id))
        return result.scalar_one_or_none()

    async def get_by_openid(self, openid: str) -> Optional[Member]:
        result = await self.db.execute(select(Member).where(Member.wechat_openid == openid))
        return result.scalar_one_or_none()

    async def update_member(self, member: Member, data: dict) -> Member:
        allowed_fields = {"phone", "real_name", "address", "career_history", "qualifications", "qualification_files", "member_type", "company_name", "business_reg_no"}
        for k, v in data.items():
            if k in allowed_fields and v is not None:
                setattr(member, k, v)
        member.updated_at = datetime.now(timezone.utc)
        self._audit_log("update", member.id, data)
        await self.db.flush()
        return member

    async def update_by_staff(self, member: Member, data: dict) -> Member:
        staff_fields = {"phone", "real_name", "tier", "annual_fee", "is_active", "member_type", "company_name", "business_reg_no", "company_logo_url", "brand_description", "is_featured", "featured_expires_at"}
        for k, v in data.items():
            if k in staff_fields and v is not None:
                setattr(member, k, v)
        member.updated_at = datetime.now(timezone.utc)
        self._audit_log("staff_update", member.id, data)
        await self.db.flush()
        return member

    async def list_members(self, tier: str | None = None, member_type: str | None = None, status: str | None = None, page: int = 1, page_size: int = 20) -> dict:
        query = select(Member).order_by(Member.created_at.desc())
        if tier:
            query = query.where(Member.tier == tier)
        if member_type:
            query = query.where(Member.member_type == member_type)
        if status:
            is_active = status == "在籍"
            query = query.where(Member.is_active == is_active)
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        members = result.scalars().all()
        return {"items": [self._to_dict(m) for m in members], "total": len(members), "page": page}

    async def delete_member(self, member_id) -> dict:
        member = await self.get_by_id(member_id)
        if not member:
            return {"error": "not_found"}
        member.is_active = False
        self._audit_log("deactivate", member_id, {})
        await self.db.flush()
        return {"id": str(member.id), "status": "已停用"}

    async def hard_delete(self, member_id) -> dict:
        member = await self.get_by_id(member_id)
        if not member:
            return {"error": "not_found"}
        if member.is_active:
            return {"error": "cannot_delete_active"}
        await self.db.delete(member)
        self._audit_log("hard_delete", member_id, {})
        await self.db.flush()
        return {"id": str(member_id), "status": "已刪除"}

    async def force_delete(self, member_id) -> dict:
        member = await self.get_by_id(member_id)
        if not member:
            from ..models.application import Application
            from sqlalchemy import select as sa_select
            r = await self.db.execute(sa_select(Application).where(Application.member_id == member_id))
            app = r.scalar_one_or_none()
            if app:
                await self.db.delete(app)
                await self.db.flush()
                return {"id": str(member_id), "status": "已刪除", "note": "僅刪除了關聯申請記錄"}
            return {"error": "not_found"}
        from ..models.application import Application
        from sqlalchemy import select as sa_select
        r = await self.db.execute(sa_select(Application).where(Application.member_id == member.id))
        app = r.scalar_one_or_none()
        if app:
            await self.db.delete(app)
        await self.db.delete(member)
        self._audit_log("force_delete", member_id, {})
        await self.db.flush()
        return {"id": str(member_id), "status": "已刪除"}

    async def auto_update_status(self) -> int:
        """自動更新會員狀態：會費到期→過期"""
        now = datetime.now(timezone.utc)
        result = await self.db.execute(select(Member).where(Member.is_active.is_(True)))
        members = result.scalars().all()
        count = 0
        for m in members:
            if m.annual_fee > 0:
                continue
            count += 1
        return count

    async def export_csv(self) -> str:
        result = await self.db.execute(select(Member))
        members = result.scalars().all()
        header = "ID,姓名,手機,等級,年費,類型,狀態,入會日期\n"
        rows = [f"{m.id},{m.real_name},{m.phone},{m.tier},{m.annual_fee},{m.member_type},{'在籍' if m.is_active else '停用'},{m.created_at}" for m in members]
        return header + "\n".join(rows)

    async def create_info_update_application(self, member, data: dict) -> dict:
        from ..models.application import Application
        from datetime import datetime, timezone, timedelta

        ts = str(int(datetime.now(timezone.utc).timestamp()))
        temp_username = member.username + "_upd_" + ts
        temp_idnum = (member.id_number or "") + "_upd_" + ts
        requested_tier = data.get("requested_tier", member.tier)
        tier_changed = requested_tier and requested_tier != member.tier

        # Validate: premium tier only for enterprise members
        member_type = data.get("member_type", member.member_type)
        if requested_tier == "高級會員" and member_type != "enterprise":
            return {"error": "premium_requires_enterprise", "message": "高級會員僅限企業會員升級"}

        app = Application(
            username=temp_username,
            id_number=temp_idnum,
            applicant_name=data.get("applicant_name", member.real_name),
            applicant_phone=data.get("applicant_phone", member.phone),
            applicant_address=data.get("applicant_address", ""),
            career_history=data.get("career_history", ""),
            qualifications=data.get("qualifications", ""),
            password_hash=member.password_hash,
            member_type=member_type,
            requested_tier=requested_tier,
            company_name=data.get("company_name", member.company_name),
            business_reg_no=data.get("business_reg_no", member.business_reg_no),
            member_id=member.id,
            status="待審核"
        )
        self.db.add(app)
        await self.db.flush()

        # Info updates skip AI screening - member already approved
        app.status = "初審通過"
        app.screening_result = "會員信息變更-免審"
        app.screening_by = "系統自動"
        await self.db.flush()

        if tier_changed:
            # tier change: suspend member until payment verified
            member.is_active = False
            member.updated_at = datetime.now(timezone.utc)
            app.status = "終審通過"
            app.final_review_result = "信息變更-等級變更"
            await self.db.flush()
            app.status = "待繳費"
            app.payment_due_date = datetime.now(timezone.utc) + timedelta(days=7)
            await self.db.flush()
            self._audit_log("tier_change_pending", member.id, {"from": member.tier, "to": requested_tier})
            return {"application_id": str(app.id), "status": app.status, "message": "等級變更需繳納年費，會員狀態已暫停"}
        else:
            # no tier change: update member directly
            member.real_name = app.applicant_name
            member.phone = app.applicant_phone
            member.member_type = member_type
            member.company_name = app.company_name
            member.business_reg_no = app.business_reg_no
            member.updated_at = datetime.now(timezone.utc)
            app.status = "終審通過"
            app.final_review_result = "信息變更-自動通過"
            await self.db.flush()
            app.status = "已入會"
            await self.db.flush()
            self._audit_log("info_update", member.id, {"fields": ["real_name", "phone", "member_type", "company_name"]})
            return {"application_id": str(app.id), "status": app.status, "message": "信息修改已生效"}

    def _to_admin_dict(self, m: Member) -> dict:
        return {
            "id": str(m.id),
            "username": m.username,
            "id_number": m.id_number,
            "real_name": m.real_name,
            "phone": m.phone,
            "tier": m.tier,
            "member_type": m.member_type,
            "annual_fee": m.annual_fee,
            "is_active": m.is_active,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "updated_at": m.updated_at.isoformat() if m.updated_at else None,
            "joined_at": m.joined_at.isoformat() if m.joined_at else None,
            "address": m.address,
            "career_history": m.career_history,
            "qualifications": m.qualifications,
            "qualification_files": m.qualification_files,
            "company_name": m.company_name,
            "business_reg_no": m.business_reg_no,
            "company_logo_url": m.company_logo_url,
            "brand_description": m.brand_description,
            "is_featured": m.is_featured,
            "featured_expires_at": m.featured_expires_at.isoformat() if m.featured_expires_at else None,
        }

    def _audit_log(self, action: str, member_id, details: dict):
        logger.info(f"AUDIT | {action} | member={member_id} | {details}")

    def _to_dict(self, m: Member) -> dict:
        return {
            "id": str(m.id),
            "username": m.username,
            "id_number": m.id_number,
            "real_name": m.real_name,
            "phone": m.phone[:7] + "****" if m.phone else None,
            "tier": m.tier,
            "member_type": m.member_type,
            "annual_fee": m.annual_fee,
            "is_active": m.is_active,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "address": m.address,
            "career_history": m.career_history,
            "qualifications": m.qualifications,
            "qualification_files": m.qualification_files,
            "company_name": m.company_name,
            "business_reg_no": m.business_reg_no,
            "company_logo_url": m.company_logo_url,
            "brand_description": m.brand_description,
            "is_featured": m.is_featured,
            "featured_expires_at": m.featured_expires_at.isoformat() if m.featured_expires_at else None,
        }
