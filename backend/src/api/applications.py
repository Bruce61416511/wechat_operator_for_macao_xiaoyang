import uuid
import os
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field

from ..core.database import get_db
from ..core.security import require_role
from ..services.application_service import ApplicationService
from ..services.screening_service import ScreeningService
from ..models.application import Application
from ..models.member import Member

router = APIRouter(prefix="/v1/applications", tags=["applications"])

UPLOAD_DIR = Path("uploads/payment")


class ApplicationCreate(BaseModel):
    username: str = Field(min_length=2, max_length=50, pattern=r"^[a-zA-Z0-9]+$")
    id_number: str = Field(min_length=15, max_length=18)
    applicant_name: str = Field(min_length=1, max_length=50)
    applicant_phone: str = Field(min_length=5, max_length=20)
    applicant_address: str | None = None
    career_history: str | None = None
    qualifications: str | None = None
    qualification_files: str | None = None
    password: str | None = None
    requested_tier: str | None = None


class ScreeningRequest(BaseModel):
    result: str = Field(pattern="^(pass|fail)$")
    reason: str = ""


class FinalReviewRequest(BaseModel):
    result: str = Field(pattern="^(pass|fail)$")
    comment: str = ""


class ResubmitRequest(BaseModel):
    applicant_name: str | None = None
    applicant_phone: str | None = None
    applicant_address: str | None = None
    career_history: str | None = None
    qualifications: str | None = None
    qualification_files: str | None = None
    password: str | None = None
    requested_tier: str | None = None



UPLOAD_QUAL_DIR = Path("uploads/qualifications")

@router.post("/upload-file", response_model=dict)
async def upload_qualification_file(file: UploadFile = File(...)):
    """上傳資質文件圖片"""
    UPLOAD_QUAL_DIR.mkdir(parents=True, exist_ok=True)
    ext = os.path.splitext(file.filename or "file.jpg")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = UPLOAD_QUAL_DIR / filename
    content = await file.read()
    filepath.write_bytes(content)
    return {"url": f"/uploads/qualifications/{filename}"}
@router.get("/check", response_model=dict)
async def check_duplicate(
    username: str | None = Query(default=None),
    id_number: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """檢查用戶名或身份證號是否已被佔用（含申請記錄和已入會會員）"""
    result = {"username_exists": False, "id_number_exists": False}

    if username:
        app_exists = await db.execute(
            select(Application).where(Application.username == username)
        )
        member_exists = await db.execute(
            select(Member).where(Member.username == username)
        )
        result["username_exists"] = app_exists.scalar_one_or_none() is not None or member_exists.scalar_one_or_none() is not None

    if id_number:
        app_exists = await db.execute(
            select(Application).where(Application.id_number == id_number)
        )
        member_exists = await db.execute(
            select(Member).where(Member.id_number == id_number)
        )
        result["id_number_exists"] = app_exists.scalar_one_or_none() is not None or member_exists.scalar_one_or_none() is not None

    return result


@router.get("", response_model=dict)
async def list_applications(status: str | None = None, id_number: str | None = None, member_id: str | None = None, page: int = 1, page_size: int = 20, db: AsyncSession = Depends(get_db)):
    svc = ApplicationService(db)
    member_uuid = uuid.UUID(member_id) if member_id else None
    return await svc.list_applications(status=status, id_number=id_number, member_id=member_uuid, page=page, page_size=page_size)


@router.post("", status_code=201, response_model=dict)
async def submit_application(body: ApplicationCreate, db: AsyncSession = Depends(get_db)):
    svc = ApplicationService(db)
    app = await svc.create_application(body.model_dump())
    return {"application_id": str(app.id), "status": app.status}


@router.get("/{app_id}", response_model=dict)
async def get_application(app_id: str, db: AsyncSession = Depends(get_db)):
    svc = ApplicationService(db)
    app = await svc.get_application(uuid.UUID(app_id))
    return {
        "application": {
            "id": str(app.id),
            "username": app.username,
            "id_number": app.id_number[:4] + "****" + app.id_number[-2:],
            "applicant_name": app.applicant_name,
            "applicant_phone": app.applicant_phone,
            "applicant_address": app.applicant_address,
            "career_history": app.career_history,
            "qualifications": app.qualifications,
            "qualification_files": app.qualification_files,
            "status": app.status,
            "screening_result": app.screening_result,
            "final_review_result": app.final_review_result,
            "payment_proof_url": app.payment_proof_url,
            "payment_due_date": app.payment_due_date.isoformat() if app.payment_due_date else None,
            "submitted_at": app.submitted_at.isoformat() if app.submitted_at else None,
        },
        "status_history": [{"status": app.status, "updated_at": app.updated_at.isoformat() if app.updated_at else None}],
    }


@router.post("/{app_id}/screening", response_model=dict)
async def screening(app_id: str, body: ScreeningRequest, db: AsyncSession = Depends(get_db)):
    app_svc = ApplicationService(db)
    app = await app_svc.get_application(uuid.UUID(app_id))
    screen_svc = ScreeningService(db)
    await screen_svc.perform_screening(app, body.result, body.reason)
    return {"status": app.status}


@router.post("/{app_id}/final-review", response_model=dict)
async def final_review(app_id: str, body: FinalReviewRequest, user: dict = Depends(require_role("root")), db: AsyncSession = Depends(get_db)):
    app_svc = ApplicationService(db)
    app = await app_svc.get_application(uuid.UUID(app_id))
    new_status = "終審通過" if body.result == "pass" else "終審不通過"
    await app_svc.transition_status(app.id, new_status, {"final_review_result": body.comment})
    if new_status == "終審通過":
        if app.member_id:
            from ..models.member import Member as M
            member_result = await db.execute(select(M).where(M.id == app.member_id))
            member = member_result.scalar_one_or_none()
            if member:
                tier_changed = app.requested_tier and app.requested_tier != member.tier
                member.phone = app.applicant_phone
                member.real_name = app.applicant_name
                if tier_changed:
                    member.tier = app.requested_tier
                    member.annual_fee = {"普通會員": 500, "高級會員": 1000}.get(app.requested_tier, member.annual_fee)
                    member.updated_at = datetime.now(timezone.utc)
                    await db.flush()
                    await app_svc.transition_status(app.id, "待繳費")
                    app = await app_svc.get_application(uuid.UUID(app_id))
                else:
                    member.is_active = False
                    member.updated_at = datetime.now(timezone.utc)
                    await db.flush()
                    await app_svc.transition_status(app.id, "待繳費")
                    app = await app_svc.get_application(uuid.UUID(app_id))
        else:
            await app_svc.transition_status(app.id, "待繳費")
            app = await app_svc.get_application(uuid.UUID(app_id))
    else:
        if app.member_id:
            from ..models.member import Member as M
            member_result = await db.execute(select(M).where(M.id == app.member_id))
            member = member_result.scalar_one_or_none()
            if member and member.is_active:
                member.is_active = False
                member.updated_at = datetime.now(timezone.utc)
                await db.flush()
    return {"status": app.status}


@router.post("/{app_id}/payment-proof", response_model=dict)
async def upload_payment_proof(app_id: str, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    app_svc = ApplicationService(db)
    app = await app_svc.get_application(uuid.UUID(app_id))
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{app_id}_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}{os.path.splitext(file.filename or 'receipt.jpg')[1]}"
    filepath = UPLOAD_DIR / filename
    content = await file.read()
    filepath.write_bytes(content)
    app.payment_proof_url = f"/uploads/payment/{filename}"
    await app_svc.transition_status(app.id, "已繳費", {"payment_proof_url": app.payment_proof_url})
    await db.flush()
    return {"status": app.status, "payment_proof_url": app.payment_proof_url}


class VerifyPaymentRequest(BaseModel):
    action: str = "verify"
    reject_reason: str = ""


@router.post("/{app_id}/verify-payment", response_model=dict)
async def verify_payment(app_id: str, body: VerifyPaymentRequest | None = None, db: AsyncSession = Depends(get_db)):
    app_svc = ApplicationService(db)
    action = body.action if body else "verify"
    if action == "reject":
        app = await app_svc.get_application(uuid.UUID(app_id))
        reject_reason = body.reject_reason if body else ""
        await app_svc.transition_status(app.id, "待繳費", {"payment_rejected": True, "payment_reject_reason": reject_reason})
        return {"application_id": str(app.id), "status": "待繳費", "reject_reason": reject_reason}
    result = await app_svc.verify_payment_and_create_member(uuid.UUID(app_id), uuid.uuid4())
    return result


@router.post("/{app_id}/resubmit", status_code=201, response_model=dict)
async def resubmit_application(app_id: str, body: ResubmitRequest, db: AsyncSession = Depends(get_db)):
    app_svc = ApplicationService(db)
    new_app = await app_svc.resubmit(uuid.UUID(app_id), body.model_dump(exclude_none=True))
    return {"application_id": str(new_app.id), "status": new_app.status}


@router.get("/{app_id}/rejection-reason", response_model=dict)
async def get_rejection_reason(app_id: str, db: AsyncSession = Depends(get_db)):
    app_svc = ApplicationService(db)
    return await app_svc.get_rejection_reason(uuid.UUID(app_id))
