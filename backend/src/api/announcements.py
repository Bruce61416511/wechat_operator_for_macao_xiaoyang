import uuid

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..core.security import require_role
from ..services.announcement_service import AnnouncementService

router = APIRouter(prefix="/v1/announcements", tags=["announcements"])


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    category: str = "協會動態"
    is_pinned: bool = False


class AnnouncementUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    category: str | None = None
    is_pinned: bool | None = None
    published: bool | None = None


@router.get("", response_model=dict)
async def list_announcements(
    category: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    svc = AnnouncementService(db)
    return await svc.list_announcements(category=category, page=page, page_size=page_size)


@router.get("/{ann_id}", response_model=dict)
async def get_announcement(ann_id: str, db: AsyncSession = Depends(get_db)):
    svc = AnnouncementService(db)
    ann = await svc.get(uuid.UUID(ann_id))
    return svc._to_dict(ann)


@router.post("", status_code=201, response_model=dict)
async def create_announcement(
    body: AnnouncementCreate,
    user: dict = Depends(require_role("staff", "root")),
    db: AsyncSession = Depends(get_db),
):
    svc = AnnouncementService(db)
    ann = await svc.create(body.model_dump(), created_by=uuid.UUID(user["sub"]))
    return svc._to_dict(ann)


@router.put("/{ann_id}", response_model=dict)
async def update_announcement(
    ann_id: str,
    body: AnnouncementUpdate,
    user: dict = Depends(require_role("staff", "root")),
    db: AsyncSession = Depends(get_db),
):
    svc = AnnouncementService(db)
    ann = await svc.update(uuid.UUID(ann_id), body.model_dump(exclude_none=True))
    return svc._to_dict(ann)


@router.delete("/{ann_id}", response_model=dict)
async def delete_announcement(
    ann_id: str,
    user: dict = Depends(require_role("staff", "root")),
    db: AsyncSession = Depends(get_db),
):
    svc = AnnouncementService(db)
    return await svc.delete(uuid.UUID(ann_id))
