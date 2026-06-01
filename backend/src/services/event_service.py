import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.event import Event, EventRegistration


class EventService:
    """活動服務：CRUD + 報名 + 取消 + 人數上限"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: dict, created_by: uuid.UUID | None = None) -> Event:
        event = Event(**data, created_by=created_by)
        self.db.add(event)
        await self.db.flush()
        return event

    async def get(self, event_id: uuid.UUID) -> Event:
        result = await self.db.execute(select(Event).where(Event.id == event_id))
        event = result.scalar_one_or_none()
        if not event:
            raise HTTPException(status_code=404, detail="活動不存在")
        return event

    async def list_events(self, status: str | None = None, page: int = 1, page_size: int = 10) -> dict:
        query = select(Event).order_by(Event.event_date.desc())
        if status:
            query = query.where(Event.registration_status == status)
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        events = result.scalars().all()
        items = []
        for e in events:
            count_result = await self.db.execute(select(func.count()).select_from(EventRegistration).where(EventRegistration.event_id == e.id, EventRegistration.status == "已報名"))
            reg_count = count_result.scalar() or 0
            items.append({**self._to_dict(e), "registrations_count": reg_count})
        return {"items": items, "total": len(events), "page": page}

    async def update(self, event_id: uuid.UUID, data: dict) -> Event:
        event = await self.get(event_id)
        allowed = {"title", "description", "event_date", "location", "price_normal", "price_advanced", "max_participants", "registration_status"}
        for k, v in data.items():
            if k in allowed and v is not None:
                setattr(event, k, v)
        await self.db.flush()
        return event

    async def register(self, event_id: uuid.UUID, member_id: uuid.UUID) -> dict:
        event = await self.get(event_id)

        existing = await self.db.execute(
            select(EventRegistration).where(EventRegistration.event_id == event_id, EventRegistration.member_id == member_id)
        )
        reg = existing.scalar_one_or_none()
        if reg:
            if reg.status == "已報名":
                raise HTTPException(status_code=409, detail="您已報名該活動")
            reg.status = "已報名"
            if event.registration_status == "已滿":
                event.registration_status = "開放"
            await self.db.flush()
            return {"registration_id": str(reg.id), "status": "已報名"}

        if event.registration_status != "開放":
            raise HTTPException(status_code=400, detail="活動報名已截止")

        if event.max_participants:
            count_result = await self.db.execute(select(func.count()).select_from(EventRegistration).where(EventRegistration.event_id == event_id, EventRegistration.status == "已報名"))
            if count_result.scalar() >= event.max_participants:
                raise HTTPException(status_code=400, detail="活動名額已滿")

        reg = EventRegistration(event_id=event_id, member_id=member_id)
        self.db.add(reg)
        await self.db.flush()

        if event.max_participants:
            count_result = await self.db.execute(select(func.count()).select_from(EventRegistration).where(EventRegistration.event_id == event_id, EventRegistration.status == "已報名"))
            if count_result.scalar() >= event.max_participants:
                event.registration_status = "已滿"
                await self.db.flush()

        return {"registration_id": str(reg.id), "status": "已報名"}

    async def my_registrations(self, member_id: uuid.UUID) -> dict:
        # Join with Event to exclude cancelled/closed events
        result = await self.db.execute(
            select(EventRegistration, Event).join(
                Event, EventRegistration.event_id == Event.id
            ).where(
                EventRegistration.member_id == member_id,
                EventRegistration.status == "已報名",
                Event.registration_status != "截止"
            )
        )
        rows = result.all()
        if not rows:
            return {"items": []}
        events = [row[1] for row in rows]
        items = []
        for e in events:
            count_result = await self.db.execute(select(func.count()).select_from(EventRegistration).where(EventRegistration.event_id == e.id, EventRegistration.status == "已報名"))
            reg_count = count_result.scalar() or 0
            items.append({**self._to_dict(e), "registrations_count": reg_count})
        return {"items": items}

    async def cancel_registration(self, event_id: uuid.UUID, member_id: uuid.UUID) -> dict:
        result = await self.db.execute(
            select(EventRegistration).where(EventRegistration.event_id == event_id, EventRegistration.member_id == member_id, EventRegistration.status == "已報名")
        )
        reg = result.scalar_one_or_none()
        if not reg:
            raise HTTPException(status_code=404, detail="未找到報名記錄")
        reg.status = "已取消"
        event = await self.get(event_id)
        if event.registration_status == "已滿":
            event.registration_status = "開放"
        await self.db.flush()
        return {"status": "已取消"}

    def _to_dict(self, e: Event) -> dict:
        status = e.registration_status
        # Automatically mark past events as closed
        if status == "開放" and e.event_date and e.event_date.replace(tzinfo=None) < datetime.utcnow():
            status = "截止"
        return {
            "id": str(e.id),
            "title": e.title,
            "description": e.description,
            "event_date": e.event_date.isoformat() if e.event_date else None,
            "location": e.location,
            "price_normal": e.price_normal,
            "price_advanced": e.price_advanced,
            "max_participants": e.max_participants,
            "registration_status": status,
        }

    async def delete(self, event_id: uuid.UUID) -> dict:
        event = await self.get(event_id)
        # Delete registrations first
        result = await self.db.execute(select(EventRegistration).where(EventRegistration.event_id == event_id))
        for reg in result.scalars().all():
            await self.db.delete(reg)
        await self.db.delete(event)
        await self.db.flush()
        return {"id": str(event_id), "deleted": True}