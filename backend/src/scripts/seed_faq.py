"""FAQ種子數據：澳門直播協會常見問答"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from sqlalchemy import select
from src.core.database import async_session_factory
from src.models.faq import FAQ

SEED_FAQS = [
    {"question": "入會需要什麼條件？", "answer": "澳門直播協會入會條件：1）年滿18週歲；2）從事直播或相關行業；3）填寫入會申請表並通過審核。具體請查看《會員章程》。", "category": "入會條件"},
    {"question": "入會流程是怎樣的？", "answer": "入會流程：1）在線提交申請；2）AI初審；3）理事終審；4）終審通過後繳納年費；5）繳費確認後正式成爲會員。全程約3-7個工作日。", "category": "流程"},
    {"question": "會費多少錢？", "answer": "會費標準：普通會員每年500澳門元，高級會員每年2000澳門元，理事免年費。高級會員享有活動8折優惠。", "category": "費用"},
    {"question": "會員有哪些權益？", "answer": "會員權益包括：1）參加協會活動享受折扣；2）獲取行業資訊和資源；3）參與協會內部交流；4）高級會員享有更多專屬福利和優先報名權。", "category": "權益"},
    {"question": "如何參加活動？", "answer": "在活動頁面瀏覽即將舉辦的活動，選擇感興趣的活動點擊報名即可。普通會員按原價，高級會員8折。部分活動有人數上限，先到先得。", "category": "活動"},
    {"question": "如何修改個人資料？", "answer": "登錄後在個人中心頁面可以修改手機號、郵箱、地址等信息。用戶名和身份證號碼不可修改，如需更改請聯繫行政同事。", "category": "資料"},
    {"question": "會費到期了怎麼辦？", "answer": "會費到期後會員狀態將自動變爲"過期"。您可以在到期前收到系統提醒，及時續費即可恢復在籍狀態。", "category": "費用"},
    {"question": "申請被駁回了怎麼辦？", "answer": "申請被駁回後會顯示駁回理由。您可以根據理由修改申請資料後重新提交。初審駁回可立即重申請，終審駁回需等待30天后重新提交。", "category": "流程"},
]


async def seed():
    async with async_session_factory() as db:
        result = await db.execute(select(FAQ).limit(1))
        if result.scalar_one_or_none():
            print("FAQ數據已存在，跳過種子數據加載")
            return
        for item in SEED_FAQS:
            faq = FAQ(**item)
            db.add(faq)
        await db.commit()
        print(f"已加載 {len(SEED_FAQS)} 條FAQ種子數據")


if __name__ == "__main__":
    asyncio.run(seed())
