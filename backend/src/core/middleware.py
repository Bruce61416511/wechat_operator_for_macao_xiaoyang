import time
from collections import defaultdict
from typing import Dict, Tuple

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimiter:
    """簡單的內存限流器：每日200次，併發50"""

    def __init__(self, daily_limit: int = 200, concurrent_limit: int = 50):
        self.daily_limit = daily_limit
        self.concurrent_limit = concurrent_limit
        self._daily: Dict[str, list] = defaultdict(list)
        self._concurrent: Dict[str, int] = defaultdict(int)

    async def check(self, request: Request) -> None:
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        # 清理過期記錄
        self._daily[client_ip] = [t for t in self._daily[client_ip] if now - t < 86400]

        # 日限額檢查
        if len(self._daily[client_ip]) >= self.daily_limit:
            raise HTTPException(status_code=429, detail="請求頻率超限，請明天再試")

        # 併發檢查
        if self._concurrent[client_ip] >= self.concurrent_limit:
            raise HTTPException(status_code=429, detail="併發請求過多，請稍後再試")

        self._daily[client_ip].append(now)
        self._concurrent[client_ip] += 1

    def release(self, client_ip: str):
        if self._concurrent.get(client_ip, 0) > 0:
            self._concurrent[client_ip] -= 1


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, daily_limit: int = 200, concurrent_limit: int = 50):
        super().__init__(app)
        self.limiter = RateLimiter(daily_limit, concurrent_limit)

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if path in ("/health", "/docs", "/openapi.json"):
            return await call_next(request)
        client_ip = request.client.host if request.client else "unknown"
        try:
            await self.limiter.check(request)
        except HTTPException as e:
            raise e
        try:
            response = await call_next(request)
        finally:
            self.limiter.release(client_ip)
        return response
