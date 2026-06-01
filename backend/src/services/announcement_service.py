import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.announcement import Announcement


class AnnouncementService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: dict, created_by: uuid.UUID | None = None) -> Announcement:
        ann = Announcement(**data, created_by=created_by)
        self.db.add(ann)
        await self.db.flush()
        return ann

    async def get(self, ann_id: uuid.UUID) -> Announcement:
        result = await self.db.execute(select(Announcement).where(Announcement.id == ann_id))
        ann = result.scalar_one_or_none()
        if not ann:
            raise HTTPException(status_code=404, detail="公告不存在")
        return ann

    async def list_announcements(
        self, category: str | None = None, published_only: bool = True, page: int = 1, page_size: int = 20
    ) -> dict:
        query = select(Announcement)
        if published_only:
            query = query.where(Announcement.published == True)
        if category:
            query = query.where(Announcement.category == category)
        query = query.order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        items = result.scalars().all()
        return {
            "items": [self._to_dict(a) for a in items],
            "total": len(items),
            "page": page,
        }

    async def update(self, ann_id: uuid.UUID, data: dict) -> Announcement:
        ann = await self.get(ann_id)
        allowed = {"title", "content", "category", "is_pinned", "published"}
        for k, v in data.items():
            if k in allowed and v is not None:
                setattr(ann, k, v)
        ann.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return ann

    async def delete(self, ann_id: uuid.UUID) -> dict:
        ann = await self.get(ann_id)
        await self.db.delete(ann)
        await self.db.flush()
        return {"id": str(ann_id), "deleted": True}

    def _to_dict(self, a: Announcement) -> dict:
        return {
            "id": str(a.id),
            "title": a.title,
            "content": a.content,
            "category": a.category,
            "is_pinned": a.is_pinned,
            "published": a.published,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "updated_at": a.updated_at.isoformat() if a.updated_at else None,
        }
