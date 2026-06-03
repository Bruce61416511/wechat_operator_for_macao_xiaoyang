import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.resource import Resource


class ResourceService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: dict, created_by: uuid.UUID | None = None) -> Resource:
        res = Resource(**data, created_by=created_by)
        self.db.add(res)
        await self.db.flush()
        return res

    async def get(self, res_id: uuid.UUID) -> Resource:
        result = await self.db.execute(select(Resource).where(Resource.id == res_id))
        res = result.scalar_one_or_none()
        if not res:
            raise HTTPException(status_code=404, detail="資源不存在")
        return res

    async def list_resources(
        self, category: str | None = None, page: int = 1, page_size: int = 100
    ) -> dict:
        query = select(Resource)
        if category:
            query = query.where(Resource.category == category)
        count_query = select(func.count()).select_from(Resource)
        if category:
            count_query = count_query.where(Resource.category == category)
        
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()
        
        query = query.order_by(Resource.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        items = result.scalars().all()
        return {
            "items": [self._to_dict(r) for r in items],
            "total": total,
            "page": page,
        }

    async def update(self, res_id: uuid.UUID, data: dict) -> Resource:
        res = await self.get(res_id)
        allowed = {"title", "description", "category", "file_url", "original_filename"}
        for k, v in data.items():
            if k in allowed and v is not None:
                setattr(res, k, v)
        res.updated_at = datetime.now(timezone.utc)
        await self.db.flush()
        return res

    async def delete(self, res_id: uuid.UUID) -> dict:
        res = await self.get(res_id)
        await self.db.delete(res)
        await self.db.flush()
        return {"id": str(res_id), "deleted": True}

    def _to_dict(self, r: Resource) -> dict:
        return {
            "id": str(r.id),
            "title": r.title,
            "description": r.description,
            "category": r.category,
            "file_url": r.file_url,
            "original_filename": r.original_filename,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }
