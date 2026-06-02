import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import select

from ..core.config import get_settings
from ..core.database import get_db
from ..core.security import create_access_token, verify_token, verify_password, hash_password
from ..models.member import Member

router = APIRouter(prefix="/v1/auth", tags=["auth"])
settings = get_settings()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


class WxLoginRequest(BaseModel):
    code: str


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db = Depends(get_db)):
    username = req.username.strip().lower() if "@" in req.username else req.username.strip()
    result = await db.execute(select(Member).where(Member.username == username))
    member = result.scalar_one_or_none()
    if not member:
        # Check if user has a rejected application
        from ..models.application import Application
        app_result = await db.execute(
            select(Application).where(Application.username == username)
        )
        app = app_result.scalar_one_or_none()
        if app and app.status in ("初審不通過", "終審不通過"):
            raise HTTPException(status_code=403, detail="申請已被駁回")
        if app and app.status == "待繳費":
            raise HTTPException(status_code=403, detail="請先完成繳費")
        raise HTTPException(status_code=401, detail="用戶名或密碼錯誤")
    if not verify_password(req.password, member.password_hash):
        raise HTTPException(status_code=401, detail="用戶名或密碼錯誤")
    tier_to_role = {"理事": "root"}
    role = tier_to_role.get(member.tier, member.tier)
    if role != "root":
        from ..models.application import Application
        app_result = await db.execute(
            select(Application).where(
                (Application.member_id == member.id) |
                (Application.username == member.username)
            ).order_by(Application.submitted_at.desc()).limit(1)
        )
        latest_app = app_result.scalar_one_or_none()
        if latest_app and latest_app.status != "已入會":
            status_msg = {"待繳費": "請先完成繳費", "終審不通過": "申請已被駁回", "初審不通過": "申請已被駁回"}.get(latest_app.status, "賬號狀態異常")
            raise HTTPException(status_code=403, detail=status_msg)
        if not member.is_active:
            raise HTTPException(status_code=403, detail="該賬號當前不在籍無法登錄")
    token = create_access_token(data={"sub": str(member.id), "username": member.username, "role": role})
    return TokenResponse(access_token=token)



@router.post("/wx-login", response_model=TokenResponse)
async def wx_login(req: WxLoginRequest):
    url = "https://api.weixin.qq.com/sns/jscode2session"
    params = {"appid": settings.wechat_appid, "secret": settings.wechat_secret, "js_code": req.code, "grant_type": "authorization_code"}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        data = resp.json()
    if "errcode" in data and data["errcode"] != 0:
        raise HTTPException(status_code=400, detail=f"微信登錄失敗: {data.get("errmsg", "unknown")}")
    openid = data.get("openid")
    token = create_access_token(data={"sub": openid})
    return TokenResponse(access_token=token)


@router.get("/verify")
async def verify_auth(token: str):
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="無效的令牌")
    return {"valid": True, "openid": payload.get("sub")}


class ResetPasswordRequest(BaseModel):
    id_number: str
    new_password: str


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db = Depends(get_db)):
    result = await db.execute(select(Member).where(Member.id_number == req.id_number))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="未找到該身份證對應的用戶")
    if member.tier == "理事":
        raise HTTPException(status_code=403, detail="管理員賬號不支持此方式重置密碼請聯繫系統管理員")
    if not member.is_active:
        raise HTTPException(status_code=403, detail="該賬號當前不在籍無法重置密碼")
    member.password_hash = hash_password(req.new_password)
    await db.commit()
    return {"message": "密碼重置成功"}