import json
from typing import AsyncGenerator, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.faq import FAQ
from ..ai.rag_pipeline import RAGPipeline
from ..ai.deepseek_client import chat_stream
from ..core.cache import cache_get, cache_set

SENSITIVE_KEYWORDS = ["政治", "政府", "抗議", "示威"]


class ChatService:
    """AI客服服務：FAQ→RAG→DeepSeek 三級管道"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.rag = RAGPipeline()

    def _filter_sensitive(self, message: str) -> bool:
        for kw in SENSITIVE_KEYWORDS:
            if kw in message:
                return True
        return False

    async def answer(self, message: str, history: List[dict] | None = None) -> AsyncGenerator[str, None]:
        # Stage 0: 政敏過濾
        if self._filter_sensitive(message):
            yield json.dumps({"type": "error", "content": "抱歉，該問題不在我的服務範圍內，請諮詢人工客服。"}, ensure_ascii=False)
            return

        # Stage 1: 精確FAQ匹配
        cache_key = f"faq:{message.strip()}"
        cached = await cache_get(cache_key)
        if cached:
            yield json.dumps({"type": "chunk", "content": cached}, ensure_ascii=False)
            yield json.dumps({"type": "done", "source": "faq_cache"}, ensure_ascii=False)
            return

        result = await self.db.execute(select(FAQ).where(FAQ.question.ilike(f"%{message.strip()}%"), FAQ.is_active.is_(True)))
        faq = result.scalar_one_or_none()
        if faq:
            await cache_set(cache_key, faq.answer, ttl=86400)
            yield json.dumps({"type": "chunk", "content": faq.answer}, ensure_ascii=False)
            yield json.dumps({"type": "done", "source": "faq"}, ensure_ascii=False)
            return

        # Stage 2: RAG + DeepSeek
        rag_result = await self.rag.answer(message)
        if rag_result.get("confidence", 0) >= 0.5:
            yield json.dumps({"type": "chunk", "content": rag_result["answer"]}, ensure_ascii=False)
            yield json.dumps({"type": "done", "source": "rag"}, ensure_ascii=False)
            return

        # Stage 3: Fallback
        yield json.dumps({"type": "chunk", "content": "抱歉，我暫時無法回答這個問題。請輸入「人工」轉接人工客服。"}, ensure_ascii=False)
        yield json.dumps({"type": "done", "source": "fallback"}, ensure_ascii=False)

    async def chat_stream_response(self, message: str) -> AsyncGenerator[str, None]:
        """SSE流式調用DeepSeek"""
        if self._filter_sensitive(message):
            yield f"data: {json.dumps({'type': 'error', 'content': '抱歉，該問題不在我的服務範圍內。'}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"
            return

        messages = [
            {"role": "system", "content": "你是小揚同學，澳門直播協會的AI助手。請用簡體中文回答，語氣友好專業。"},
            {"role": "user", "content": message}
        ]
        try:
            async for chunk in chat_stream(messages):
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk}, ensure_ascii=False)}\n\n"
        except Exception:
            yield f"data: {json.dumps({'type': 'error', 'content': 'AI服務暫時不可用'}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"
