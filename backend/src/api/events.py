import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..core.database import get_db
from ..core.security import get_current_user, require_role
from ..services.event_service import EventService

router = APIRouter(prefix="/v1/events", tags=["events"])


class EventCreate(BaseModel):
    title: str
    description: str | None = None
    event_date: str
    location: str
    price_normal: int = 0
    price_advanced: int | None = None
    max_participants: int | None = None


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    event_date: str | None = None
    location: str | None = None
    price_normal: int | None = None
    price_advanced: int | None = None
    max_participants: int | None = None
    registration_status: str | None = None


@router.post("", status_code=201, response_model=dict)
async def create_event(body: EventCreate, user: dict = Depends(require_role("staff", "root")), db: AsyncSession = Depends(get_db)):
    svc = EventService(db)
    from datetime import datetime
    data = body.model_dump()
    data["event_date"] = datetime.fromisoformat(data["event_date"].replace("Z", "+00:00"))
    event = await svc.create(data, created_by=uuid.UUID(user["sub"]))
    return {"id": str(event.id)}


@router.get("/my", response_model=dict)
async def my_events(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401)
    svc = EventService(db)
    return await svc.my_registrations(uuid.UUID(user["sub"]))


@router.get("", response_model=dict)
async def list_events(status: str | None = None, page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=50), db: AsyncSession = Depends(get_db)):
    svc = EventService(db)
    return await svc.list_events(status=status, page=page, page_size=page_size)


@router.get("/{event_id}", response_model=dict)
async def get_event(event_id: str, db: AsyncSession = Depends(get_db)):
    svc = EventService(db)
    event = await svc.get(uuid.UUID(event_id))
    count_result = await db.execute(
        __import__('sqlalchemy').select(__import__('sqlalchemy').func.count()).select_from(__import__('src.models.event', fromlist=['EventRegistration']).EventRegistration).where(
            __import__('src.models.event', fromlist=['EventRegistration']).EventRegistration.event_id == event.id,
            __import__('src.models.event', fromlist=['EventRegistration']).EventRegistration.status == "已報名"
        )
    )
    reg_count = count_result.scalar() or 0
    return {"event": svc._to_dict(event), "registrations_count": reg_count}


@router.patch("/{event_id}", response_model=dict)
async def update_event(event_id: str, body: EventUpdate, user: dict = Depends(require_role("staff", "root")), db: AsyncSession = Depends(get_db)):
    svc = EventService(db)
    event = await svc.update(uuid.UUID(event_id), body.model_dump(exclude_none=True))
    return {"id": str(event.id)}


@router.post("/{event_id}/register", response_model=dict)
async def register_event(event_id: str, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401)
    svc = EventService(db)
    return await svc.register(uuid.UUID(event_id), uuid.UUID(user["sub"]))


@router.delete("/{event_id}/register", response_model=dict)
async def cancel_registration(event_id: str, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401)
    svc = EventService(db)
    return await svc.cancel_registration(uuid.UUID(event_id), uuid.UUID(user["sub"]))

@router.delete("/{event_id}", response_model=dict)
async def delete_event(event_id: str, user: dict = Depends(require_role("staff", "root")), db: AsyncSession = Depends(get_db)):
    svc = EventService(db)
    return await svc.delete(uuid.UUID(event_id))