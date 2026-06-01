import hashlib
import hmac
import json
import time
from typing import Optional

from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .config import get_settings

settings = get_settings()
security_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    salt = settings.jwt_secret_key[:16].encode()
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000).hex()


def verify_password(plain: str, hashed: str) -> bool:
    return hash_password(plain) == hashed


def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = int(time.time()) + settings.jwt_expire_minutes * 60
    payload_b64 = _b64_encode(json.dumps(payload, separators=(",", ":")))
    sig = hmac.new(settings.jwt_secret_key.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"


def verify_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload_b64, sig = parts
        expected = hmac.new(settings.jwt_secret_key.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(_b64_decode(payload_b64))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> Optional[dict]:
    if credentials is None:
        return None
    payload = verify_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=401, detail="無效的令牌")
    return payload


def require_role(*roles: str):
    async def role_checker(user: Optional[dict] = Depends(get_current_user)) -> dict:
        if user is None:
            raise HTTPException(status_code=401, detail="請先登錄")
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="權限不足")
        return user
    return role_checker


def _b64_encode(s: str) -> str:
    import base64
    return base64.urlsafe_b64encode(s.encode()).decode().rstrip("=")


def _b64_decode(s: str) -> str:
    import base64
    padding = 4 - len(s) % 4
    if padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s).decode()
