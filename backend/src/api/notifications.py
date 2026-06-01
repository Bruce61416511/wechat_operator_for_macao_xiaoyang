from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..core.database import get_db
from ..core.security import get_current_user, require_role
from ..services.notification_service import NotificationService

router = APIRouter(prefix="/v1/notifications", tags=["notifications"])


class NotificationSend(BaseModel):
    member_ids: list[str]
    type: str = "????"
    title: str
    content: str


@router.get("", response_model=dict)
async def list_notifications(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401)
    from ..models.notification import Notification
    from sqlalchemy import select
    import uuid
    result = await db.execute(
        select(Notification)
        .where(Notification.member_id == uuid.UUID(user.get("sub")))
        .order_by(Notification.created_at.desc())
        .limit(20)
    )
    notifications = result.scalars().all()
    items = [{"id": str(n.id), "title": n.title, "content": n.content, "type": n.type, "is_read": n.is_read, "created_at": n.created_at.isoformat() if n.created_at else None} for n in notifications]
    unread_result = await db.execute(select(Notification).where(Notification.member_id == uuid.UUID(user.get("sub")), Notification.is_read.is_(False)))
    unread_count = len(unread_result.scalars().all())
    return {"items": items, "unread_count": unread_count}


@router.post("", status_code=201, response_model=dict)
async def send_notification(body: NotificationSend, user: dict = Depends(require_role("staff", "root")), db: AsyncSession = Depends(get_db)):
    svc = NotificationService(db)
    return await svc.send_to_members(body.member_ids, body.title, body.content, body.type)

@router.post("/read-all", response_model=dict)
async def mark_all_read(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401)
    from ..models.notification import Notification
    from sqlalchemy import update
    import uuid
    await db.execute(
        update(Notification)
        .where(Notification.member_id == uuid.UUID(user.get("sub")), Notification.is_read.is_(False))
        .values(is_read=True)
    )
    await db.flush()
    return {"status": "ok"}



@router.get("/recipients", response_model=dict)
async def list_recipients(user: dict = Depends(require_role("root")), db: AsyncSession = Depends(get_db)):
    from ..models.member import Member
    from sqlalchemy import select
    result = await db.execute(select(Member).where(Member.is_active == True).order_by(Member.username))
    members = result.scalars().all()
    items = [{"id": str(m.id), "username": m.username, "real_name": m.real_name, "tier": m.tier} for m in members]
    return {"items": items}