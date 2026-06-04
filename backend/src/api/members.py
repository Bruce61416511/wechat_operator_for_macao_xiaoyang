import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..core.database import get_db
from ..core.security import get_current_user, require_role
from ..services.member_service import MemberService
from ..services.application_service import ApplicationService

router = APIRouter(prefix="/v1/members", tags=["members"])


class MemberUpdate(BaseModel):
    phone: str | None = None
    real_name: str | None = None
    address: str | None = None
    career_history: str | None = None
    qualifications: str | None = None
    qualification_files: str | None = None
    member_type: str | None = None
    company_name: str | None = None
    business_reg_no: str | None = None
    company_logo_url: str | None = None
    brand_description: str | None = None
    is_featured: bool | None = None
    featured_expires_at: str | None = None
    member_type: str | None = None
    company_name: str | None = None
    business_reg_no: str | None = None


class StaffMemberUpdate(BaseModel):
    phone: str | None = None
    real_name: str | None = None
    tier: str | None = None
    annual_fee: int | None = None
    is_active: bool | None = None
    member_type: str | None = None


from ..services.event_service import EventService
from ..services.announcement_service import AnnouncementService


@router.get("/me/feed", response_model=dict)
async def get_my_feed(limit: int = Query(default=4, ge=1), user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """聚合近期動態：已報名活動 + 繳費提醒 + 公告資訊，取最近 N 條"""
    if user is None:
        raise HTTPException(status_code=401, detail="請先登錄")
    
    member_id = uuid.UUID(user["sub"])
    member_svc = MemberService(db)
    member = await member_svc.get_by_id(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="會員不存在")
    
    feed_items = []

    # 1. 已報名活動（优先级最高）
    event_svc = EventService(db)
    try:
        regs = await event_svc.my_registrations(member_id)
        for item in (regs.get("items") or []):
            feed_items.append({
                "type": "event",
                "title": "已報名：" + item.get("title", ""),
                "description": item.get("event_date", "")[:10] + " " + (item.get("location", "") or ""),
                "date": item.get("event_date", ""),
                "link": "/events",
            })
    except Exception:
        pass

    # 2. 繳費提醒
    app_svc = ApplicationService(db)
    try:
        apps = await app_svc.list_applications(id_number=member.id_number, page=1, page_size=5)
        for app in (apps.get("items") or []):
            status = app.get("status", "")
            if status == "待繳費":
                feed_items.append({
                    "type": "payment",
                    "title": "待繳費：請提交繳費憑證",
                    "description": "申請已通過終審，請盡快完成繳費",
                    "date": app.get("submitted_at", ""),
                    "link": "/member",
                })
                break  # 只提醒一次
    except Exception:
        pass

    # 3. 公告資訊
    ann_svc = AnnouncementService(db)
    try:
        anns = await ann_svc.list_announcements(page=1, page_size=50)
        for ann in (anns.get("items") or []):
            if not ann.get("published", True):
                continue
            feed_items.append({
                "type": "announcement",
                "title": ann.get("title", ""),
                "description": (ann.get("content") or "")[:80] + ("…" if ann.get("content") and len(ann.get("content", "")) > 80 else ""),
                "date": ann.get("created_at", ""),
                "link": "/announcements",
            })
    except Exception:
        pass

    # 按日期倒序，取前 N 条（若提供 limit）
    feed_items.sort(key=lambda x: x.get("date", ""), reverse=True)
    feed_items = feed_items[:limit]

    return {"items": feed_items}
@router.get("/me", response_model=dict)
async def get_my_profile(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401, detail="請先登錄")
    svc = MemberService(db)
    member = await svc.get_by_id(uuid.UUID(user.get("sub")))
    if not member:
        raise HTTPException(status_code=404, detail="會員不存在")
    return {"member": svc._to_dict(member)}


@router.patch("/me", response_model=dict)
async def update_my_profile(body: MemberUpdate, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401, detail="請先登錄")
    svc = MemberService(db)
    member = await svc.get_by_id(uuid.UUID(user.get("sub")))
    if not member:
        raise HTTPException(status_code=404, detail="會員不存在")
    member = await svc.update_member(member, body.model_dump(exclude_none=True))
    return {"member": svc._to_dict(member)}


@router.get("/me/tier", response_model=dict)
async def get_my_tier(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401, detail="請先登錄")
    svc = MemberService(db)
    member = await svc.get_by_id(uuid.UUID(user.get("sub")))
    if not member:
        raise HTTPException(status_code=404, detail="會員不存在")
    return {"tier": member.tier, "annual_fee": member.annual_fee}


@router.get("", response_model=dict)
async def list_members(
    tier: str | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: dict = Depends(require_role("staff", "root")),
    db: AsyncSession = Depends(get_db)
):
    svc = MemberService(db)
    return await svc.list_members(tier=tier, status=status, page=page, page_size=page_size)


@router.get("/{member_id}", response_model=dict)
async def get_member(
    member_id: str,
    user: dict = Depends(require_role("staff", "root")),
    db: AsyncSession = Depends(get_db)
):
    svc = MemberService(db)
    member = await svc.get_by_id(uuid.UUID(member_id))
    if not member:
        raise HTTPException(status_code=404, detail="會員不存在")
    return {"member": svc._to_dict(member)}


@router.patch("/{member_id}", response_model=dict)
async def update_member_by_staff(
    member_id: str,
    body: StaffMemberUpdate,
    user: dict = Depends(require_role("staff", "root")),
    db: AsyncSession = Depends(get_db)
):
    svc = MemberService(db)
    member = await svc.get_by_id(uuid.UUID(member_id))
    if not member:
        raise HTTPException(status_code=404, detail="會員不存在")
    member = await svc.update_by_staff(member, body.model_dump(exclude_none=True))
    return {"member": svc._to_dict(member)}


@router.delete("/{member_id}", response_model=dict)
async def delete_member(
    member_id: str,
    user: dict = Depends(require_role("staff", "root")),
    db: AsyncSession = Depends(get_db)
):
    svc = MemberService(db)
    result = await svc.hard_delete(uuid.UUID(member_id))
    if result.get("error"):
        detail = "不能刪除在籍會員" if result["error"] == "cannot_delete_active" else "會員不存在"
        raise HTTPException(status_code=400, detail=detail)
    return result

@router.get("/export", response_class=PlainTextResponse)
async def export_members_csv(
    user: dict = Depends(require_role("staff", "root")),
    db: AsyncSession = Depends(get_db)
):
    svc = MemberService(db)
    csv_data = await svc.export_csv()
    return PlainTextResponse(content=csv_data, media_type="text/csv")


class MemberInfoUpdateRequest(BaseModel):
    applicant_name: str | None = None
    applicant_phone: str | None = None
    applicant_address: str | None = None
    career_history: str | None = None
    qualifications: str | None = None
    requested_tier: str | None = None


@router.post("/me/update-info", status_code=201, response_model=dict)
async def update_member_info(body: MemberInfoUpdateRequest, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401, detail=請先登錄)
    svc = MemberService(db)
    member = await svc.get_by_id(uuid.UUID(user.get("sub")))
    if not member:
        raise HTTPException(status_code=404, detail=會員不存在)
    if not member.is_active:
        raise HTTPException(status_code=403, detail=該賬號當前不在籍無法修改信息)
    result = await svc.create_info_update_application(member, body.model_dump(exclude_none=True))
    return result

class BoardManageRequest(BaseModel):
    member_id: str
    is_board: bool = True


@router.post("/manage-board", response_model=dict)
async def manage_board(body: BoardManageRequest, user: dict = Depends(require_role("root")), db: AsyncSession = Depends(get_db)):
    svc = MemberService(db)
    member = await svc.get_by_id(uuid.UUID(body.member_id))
    if not member:
        raise HTTPException(status_code=404, detail="會員不存在")
    if body.is_board:
        member.tier = "理事"
        member.annual_fee = 0
    await svc.update_by_staff(member, {"tier": member.tier, "annual_fee": member.annual_fee})
    return {"id": str(member.id), "tier": member.tier, "annual_fee": member.annual_fee}


# --- Admin endpoints ---

router_admin = APIRouter(prefix="/v1/admin/members", tags=["admin"])

class AdminMemberUpdate(BaseModel):
    username: str | None = None
    real_name: str | None = None
    phone: str | None = None
    tier: str | None = None
    annual_fee: int | None = None
    is_active: bool | None = None
    address: str | None = None
    career_history: str | None = None
    qualifications: str | None = None
    qualification_files: str | None = None
    member_type: str | None = None
    company_name: str | None = None
    business_reg_no: str | None = None
    company_logo_url: str | None = None
    brand_description: str | None = None
    is_featured: bool | None = None
    featured_expires_at: str | None = None


@router_admin.get("", response_model=dict)
async def admin_list_members(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500),
    user: dict = Depends(require_role("root")),
    db: AsyncSession = Depends(get_db)
):
    svc = MemberService(db)
    result = await svc.list_members(page=page, page_size=page_size)
    # Rebuild items with admin dict (unmasked phone, all fields)
    members = result["items"]
    admin_items = []
    for item in members:
        member = await svc.get_by_id(uuid.UUID(item["id"]))
        if member:
            from ..models.application import Application
            from sqlalchemy import select as sa_select
            admin_dict = svc._to_admin_dict(member)
            app_result = await db.execute(
                sa_select(Application).where(Application.member_id == member.id).order_by(Application.submitted_at.desc()).limit(1)
            )
            latest_app = app_result.scalar_one_or_none()
            admin_dict["payment_proof_url"] = latest_app.payment_proof_url if latest_app else None
            admin_items.append(admin_dict)
    return {"items": admin_items, "total": result["total"], "page": result["page"]}


@router_admin.patch("/{member_id}", response_model=dict)
async def admin_update_member(
    member_id: str,
    body: AdminMemberUpdate,
    user: dict = Depends(require_role("root")),
    db: AsyncSession = Depends(get_db)
):
    svc = MemberService(db)
    member = await svc.get_by_id(uuid.UUID(member_id))
    if not member:
        raise HTTPException(status_code=404, detail="會員不存在")
    data = body.model_dump(exclude_none=True)
    for k, v in data.items():
        setattr(member, k, v)
    member.updated_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
    await db.flush()
    return {"member": svc._to_admin_dict(member)}


@router_admin.delete("/{member_id}", response_model=dict)
async def admin_delete_member(
    member_id: str,
    user: dict = Depends(require_role("root")),
    db: AsyncSession = Depends(get_db)
):
    svc = MemberService(db)
    result = await svc.force_delete(uuid.UUID(member_id))
    if result.get("error"):
        raise HTTPException(status_code=404, detail="\u4f1a\u5458\u4e0d\u5b58\u5728")
    return result


@router_admin.delete("/applications/{app_id}", response_model=dict)
async def admin_delete_application(
    app_id: str,
    user: dict = Depends(require_role("root")),
    db: AsyncSession = Depends(get_db)
):
    app_svc = ApplicationService(db)
    app = await app_svc.get_application(uuid.UUID(app_id))
    await db.delete(app)
    await db.flush()
    return {"id": app_id, "status": "\u5df2\u5220\u9664"}

@router_admin.get("/applications", response_model=dict)
async def admin_list_applications(
    page: int = Query(1, ge=1),
    page_size: int = Query(200, ge=1, le=500),
    user: dict = Depends(require_role("root")),
    db: AsyncSession = Depends(get_db)
):
    svc = ApplicationService(db)
    result = await svc.list_applications(page=page, page_size=page_size)
    items = []
    for app in result.get("items", []):
        uname = app.get("username", "") or ""
        if "_upd_" in uname:
            uname = uname.split("_upd_")[0]
        idnum = app.get("id_number", "") or ""

        # Also unmask id_number in the username-based dedup
        raw_idnum = app.get("id_number", "") or ""
        # Strip _upd_ suffix from id_number too
        if "_upd_" in str(raw_idnum):
            idnum = str(raw_idnum).split("_upd_")[0]
        else:
            idnum = raw_idnum
        items.append({
            "id": app.get("id"),
            "username": uname,
            "id_number": idnum,
            "applicant_name": app.get("applicant_name", ""),
            "applicant_phone": app.get("applicant_phone", ""),
            "status": app.get("status", ""),
            "requested_tier": app.get("requested_tier", ""),
            "submitted_at": app.get("submitted_at"),
            "member_id": app.get("member_id"),
            "career_history": app.get("career_history", ""),
            "qualifications": app.get("qualifications", ""),
            "qualification_files": app.get("qualification_files", ""),
            "payment_proof_url": app.get("payment_proof_url", ""),
        })
    return {"items": items, "total": len(items), "page": page}

@router_admin.get("/applications-summary", response_model=dict)
async def admin_applications_summary(
    user: dict = Depends(require_role("root")),
    db: AsyncSession = Depends(get_db)
):
    """Return all unique users from applications with their latest status, deduplicated."""
    svc = ApplicationService(db)
    # Fetch all applications
    from sqlalchemy import select
    from ..models.application import Application as AppModel
    result = await db.execute(select(AppModel).order_by(AppModel.submitted_at.desc()))
    apps = result.scalars().all()
    
    # Deduplicate: keep only the latest application per unique user
    # Match by base username (strip _upd_ suffix) + base id_number (strip _upd_ suffix)
    seen = {}
    for app in apps:
        uname = (app.username or "").split("_upd_")[0]
        idnum = (app.id_number or "").split("_upd_")[0]
        key = f"{uname}||{idnum}"
        if key not in seen:
            status = (app.status or "").replace("審", "審")
            seen[key] = {
                "id": str(app.id),
                "username": uname,
                "id_number": idnum,
                "applicant_name": app.applicant_name or "",
                "applicant_phone": app.applicant_phone or "",
                "status": status,
                "requested_tier": app.requested_tier or "",
                "submitted_at": app.submitted_at.isoformat() if app.submitted_at else None,
                "member_id": str(app.member_id) if app.member_id else None,
                "career_history": app.career_history or "",
                "qualifications": app.qualifications or "",
                "qualification_files": app.qualification_files or "",
                "payment_proof_url": app.payment_proof_url or "",
                "screening_result": app.screening_result or "",
                "final_review_result": app.final_review_result or "",
            }
    
    items = list(seen.values())
    return {"items": items, "total": len(items), "page": 1}

