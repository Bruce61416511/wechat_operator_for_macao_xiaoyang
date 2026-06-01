import json
from typing import Optional

import redis.asyncio as aioredis

from .config import get_settings

settings = get_settings()

redis_client: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global redis_client
    if redis_client is None:
        redis_client = aioredis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
    return redis_client


async def cache_get(key: str) -> Optional[str]:
    r = await get_redis()
    return await r.get(key)


async def cache_set(key: str, value: str, ttl: int = 3600) -> None:
    r = await get_redis()
    await r.set(key, value, ex=ttl)


async def cache_delete(key: str) -> None:
    r = await get_redis()
    await r.delete(key)


async def close_redis() -> None:
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
