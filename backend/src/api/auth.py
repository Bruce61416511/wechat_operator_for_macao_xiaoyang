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
    email: str | None = None
    password: str | None = None


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
    return await _login_response(member, db)


async def _login_response(member: Member, db) -> TokenResponse:
    """統一登錄簽發：計算角色、檢查在籍/申請狀態、簽發 token（sub=會員 UUID）"""
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
async def wx_login(req: WxLoginRequest, db = Depends(get_db)):
    # 1. code 換 openid（微信側唯一標識）
    url = "https://api.weixin.qq.com/sns/jscode2session"
    params = {"appid": settings.wechat_appid, "secret": settings.wechat_secret, "js_code": req.code, "grant_type": "authorization_code"}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        data = resp.json()
    if "errcode" in data and data["errcode"] != 0:
        raise HTTPException(status_code=400, detail=f"微信登錄失敗: {data.get('errmsg', 'unknown')}")
    openid = data.get("openid")
    if not openid:
        raise HTTPException(status_code=400, detail="微信登錄失敗: 未獲取到 openid")

    # 2. 按 openid 查已綁定會員 → 直接登錄
    result = await db.execute(select(Member).where(Member.wechat_openid == openid))
    member = result.scalar_one_or_none()
    if member:
        return await _login_response(member, db)

    # 3. 未綁定：必須補郵箱+密碼，匹配並綁定現有會員（不新建，避免雙賬號/字段不全）
    if not req.email or not req.password:
        raise HTTPException(status_code=409, detail="該微信尚未綁定賬號，請提供郵箱與密碼以綁定現有會員")
    username = req.email.strip().lower() if "@" in req.email else req.email.strip()
    result = await db.execute(select(Member).where(Member.username == username))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="未找到該郵箱對應的會員，請先於網頁註冊或使用完整註冊")
    if not verify_password(req.password, member.password_hash):
        raise HTTPException(status_code=401, detail="郵箱或密碼錯誤")
    if member.wechat_openid and member.wechat_openid != openid:
        raise HTTPException(status_code=409, detail="該郵箱已綁定其他微信賬號")
    member.wechat_openid = openid
    await db.commit()
    return await _login_response(member, db)


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


class RegisterRequest(BaseModel):
    email: str
    password: str
    real_name: str
    phone: str
    phone_country_code: str
    id_type: str
    id_number: str
    address: str | None = None
    openid: str | None = None


VALID_ID_TYPES = {"mainland_id", "hkmo_pass", "macao_id", "passport"}


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db = Depends(get_db)):
    """小程序/新用戶直接註冊：註冊即會員，返回 token 即登錄"""
    from datetime import datetime, timezone, timedelta
    from ..core.validation import validate_email_username
    from ..models.application import Application
    from ..services.member_service import TIER_FEE

    # 1. 校驗並規範化郵箱（username）
    username = validate_email_username(req.email.strip().lower())

    # 2. 密碼長度校驗
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="密碼至少 6 位")

    # 3. 證件類型校驗
    if req.id_type not in VALID_ID_TYPES:
        raise HTTPException(status_code=400, detail="證件類型不合法")

    # 3.1 證件號碼必填校驗
    id_number = req.id_number.strip()
    if not id_number:
        raise HTTPException(status_code=400, detail="證件號碼不能為空")

    # 4. 手機號長度校驗（本地號碼，不含國家碼）
    phone = req.phone.strip()
    if not phone or not (5 <= len(phone) <= 15):
        raise HTTPException(status_code=400, detail="手機號格式不正確")

    # 4.1 國家/地區碼必填校驗（須以 + 開頭，如 +853/+852/+86）
    phone_country_code = req.phone_country_code.strip()
    if not phone_country_code or not phone_country_code.startswith("+"):
        raise HTTPException(status_code=400, detail="國家/地區碼不能為空且須以 + 開頭")

    # 5. 唯一性查重：郵箱
    result = await db.execute(select(Member).where(Member.username == username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="該郵箱已被註冊")
    app_result = await db.execute(select(Application).where(Application.username == username))
    if app_result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="該郵箱已提交過申請，請登錄查看進度")

    # 6. 唯一性查重：證件號
    result = await db.execute(select(Member).where(Member.id_number == id_number))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="該證件號碼已被註冊")

    # 7. 直接創建會員（註冊即會員，跳過審批）
    now = datetime.now(timezone.utc)
    member = Member(
        username=username,
        password_hash=hash_password(req.password),
        real_name=req.real_name.strip(),
        phone=phone,
        phone_country_code=phone_country_code,
        id_type=req.id_type,
        id_number=id_number,
        address=req.address,
        wechat_openid=req.openid,
        tier="個人會員",
        member_type="individual",
        annual_fee=0,  # 免年費模式：所有會員年費統一為 0
        is_active=True,
        joined_at=now,
        expires_at=None,  # 永久有效；保留到期機制：日後為某會員填具體日期即重新啟用過期邏輯
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)

    # 8. 簽發 token（註冊即登錄）
    token = create_access_token(data={"sub": str(member.id), "username": member.username, "role": "個人會員"})
    return TokenResponse(access_token=token)