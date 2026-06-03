import uuid
import os
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..core.security import require_role
from ..services.resource_service import ResourceService

router = APIRouter(prefix="/v1/resources", tags=["resources"])

UPLOAD_DIR = Path("uploads/resources")


class ResourceCreate(BaseModel):
    title: str
    description: str = ""
    category: str
    file_url: str | None = None
    original_filename: str | None = None


class ResourceUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    file_url: str | None = None
    original_filename: str | None = None


@router.post("/upload-file", response_model=dict)
async def upload_resource_file(
    file: UploadFile = File(...),
    user: dict = Depends(require_role("root")),
):
    """上傳資源附件（僅 root）"""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    orig_name = file.filename or "file"
    safe_name = "".join(c for c in orig_name if c.isalnum() or c in "._- ").strip() or "file"
    ext = os.path.splitext(orig_name)[1] or ".pdf"
    filename = f"{uuid.uuid4().hex}_{safe_name}{ext}"
    filepath = UPLOAD_DIR / filename
    content = await file.read()
    filepath.write_bytes(content)
    return {"url": f"/uploads/resources/{filename}", "filename": orig_name}


@router.get("", response_model=dict)
async def list_resources(
    category: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """公開接口：列出資源"""
    svc = ResourceService(db)
    return await svc.list_resources(category=category, page=page, page_size=page_size)


@router.get("/{res_id}", response_model=dict)
async def get_resource(res_id: str, db: AsyncSession = Depends(get_db)):
    svc = ResourceService(db)
    res = await svc.get(uuid.UUID(res_id))
    return svc._to_dict(res)


@router.post("", status_code=201, response_model=dict)
async def create_resource(
    body: ResourceCreate,
    user: dict = Depends(require_role("root")),
    db: AsyncSession = Depends(get_db),
):
    """僅 root：創建資源"""
    svc = ResourceService(db)
    res = await svc.create(body.model_dump(), created_by=uuid.UUID(user["sub"]))
    return svc._to_dict(res)


@router.put("/{res_id}", response_model=dict)
async def update_resource(
    res_id: str,
    body: ResourceUpdate,
    user: dict = Depends(require_role("root")),
    db: AsyncSession = Depends(get_db),
):
    """僅 root：更新資源"""
    svc = ResourceService(db)
    res = await svc.update(uuid.UUID(res_id), body.model_dump(exclude_none=True))
    return svc._to_dict(res)


@router.delete("/{res_id}", response_model=dict)
async def delete_resource(
    res_id: str,
    user: dict = Depends(require_role("root")),
    db: AsyncSession = Depends(get_db),
):
    """僅 root：刪除資源"""
    svc = ResourceService(db)
    return await svc.delete(uuid.UUID(res_id))