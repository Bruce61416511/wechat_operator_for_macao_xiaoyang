import logging
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class NotificationService:
    """通知服務：站內信 + 微信模板消息"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def send_to_member(self, member_id: str, title: str, content: str, ntype: str = "系統更新") -> dict:
        """發送站內通知給單個會員"""
        from ..models.notification import Notification
        import uuid
        import re
        clean_id = re.sub(r'[^0-9a-fA-F]', '', str(member_id))
        if len(clean_id) == 32:
            mid = uuid.UUID(clean_id)
        else:
            # Try to resolve as username
            from ..models.member import Member
            from sqlalchemy import select
            result = await self.db.execute(select(Member).where(Member.username == str(member_id)))
            member = result.scalar_one_or_none()
            if member:
                mid = member.id
            else:
                logger.error(f"[NOTIFY] Invalid member_id: {member_id}")
                return {"status": "error", "member_id": str(member_id), "error": "User not found"}
        notification = Notification(
            member_id=mid,
            type=ntype,
            title=title,
            content=content,
            send_status="已發送"
        )
        self.db.add(notification)
        await self.db.flush()
        logger.info(f"[NOTIFY] To member={member_id} | {ntype} | {title}")
        return {"status": "sent", "member_id": member_id, "type": ntype, "id": str(notification.id)}

    async def send_to_members(self, member_ids: List[str], title: str, content: str, ntype: str = "系統更新") -> dict:
        """批量發送通知"""
        for mid in member_ids:
            await self.send_to_member(mid, title, content, ntype)
        return {"notification_count": len(member_ids)}

    async def send_miniprogram_subscribe(self, openid: str, template_id: str, data: dict) -> dict:
        """微信小程序訂閱消息"""
        logger.info(f"[WX-SUBSCRIBE] To openid={openid} template={template_id} data={data}")
        return {"status": "queued", "openid": openid}

    async def send_web_notification(self, member_id: str, title: str, content: str) -> dict:
        """Web H5 站內通知"""
        logger.info(f"[WEB-NOTIFY] To member={member_id} | {title}")
        return {"status": "sent", "member_id": member_id}

    async def dispatch_application_notification(self, application_id: str, event: str, member_id: str | None = None) -> dict:
        """入會申請相關通知分發：審批結果、繳費提醒、入會確認"""
        templates = {
            "screening_passed": {"title": "初審通過", "content": "您的入會申請已通過初審，等待理事終審。"},
            "screening_failed": {"title": "初審不通過", "content": "您的入會申請未通過初審，請查看駁回理由。"},
            "final_passed": {"title": "終審通過", "content": "恭喜！您的入會申請已通過終審，請在7天內繳納會費。"},
            "payment_reminder": {"title": "繳費提醒", "content": "您的會費尚未繳納，請及時完成繳費以免申請過期。"},
            "member_created": {"title": "入會成功", "content": "歡迎加入澳門直播協會！您已成爲正式會員。"},
        }
        tpl = templates.get(event, {"title": "系統通知", "content": f"申請 {application_id} 狀態更新"})
        if member_id:
            await self.send_web_notification(member_id, tpl["title"], tpl["content"])
        logger.info(f"[APP-NOTIFY] App={application_id} event={event}")
        return {"status": "dispatched", "event": event}
