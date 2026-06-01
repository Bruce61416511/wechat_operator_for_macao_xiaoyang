"""種子數據：首次部署創建 root 理事"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from sqlalchemy import select
from src.core.database import async_session_factory
from src.models.member import Member
from ..core.security import hash_password


async def seed_root():
    async with async_session_factory() as db:
        result = await db.execute(select(Member).where(Member.username == "root"))
        if result.scalar_one_or_none():
            print("root 理事已存在")
            return
        root = Member(
            username="root",
            id_number="000000000000000000",
            real_name="root",
            phone="+85300000000",
            tier="理事",
            annual_fee=0,
            is_active=True,
            password_hash=hash_password("root"),
        )
        db.add(root)
        await db.commit()
        print("已創建 root 理事")


if __name__ == "__main__":
    asyncio.run(seed_root())
