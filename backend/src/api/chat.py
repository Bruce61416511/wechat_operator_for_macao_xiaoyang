import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from ..core.database import get_db
from ..models.faq import FAQ
from ..services.chat_service import ChatService

router = APIRouter(prefix="/v1", tags=["chat"])


class ChatMessage(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class FAQCreate(BaseModel):
    question: str
    answer: str
    category: str = "一般"


# In-memory chat history (per session, simplified)
_chat_history: List[dict] = []


@router.post("/chat/message")
async def chat_message(body: ChatMessage, db: AsyncSession = Depends(get_db)):
    svc = ChatService(db)
    async def generate():
        async for chunk in svc.chat_stream_response(body.message):
            yield chunk
    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/chat/history", response_model=dict)
async def chat_history(limit: int = Query(20, ge=1, le=100)):
    return {"messages": _chat_history[-limit:]}


@router.get("/faq", response_model=dict)
async def list_faq(
    category: str | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(FAQ).where(FAQ.is_active.is_(True))
    if category:
        query = query.where(FAQ.category == category)
    if search:
        query = query.where(FAQ.question.ilike(f"%{search}%") | FAQ.answer.ilike(f"%{search}%"))
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    faqs = result.scalars().all()
    return {
        "items": [{"id": str(f.id), "question": f.question, "answer": f.answer, "category": f.category} for f in faqs],
        "total": len(faqs),
        "page": page
    }


@router.post("/faq", status_code=201, response_model=dict)
async def create_faq(body: FAQCreate, db: AsyncSession = Depends(get_db)):
    faq = FAQ(question=body.question, answer=body.answer, category=body.category)
    db.add(faq)
    await db.flush()
    return {"id": str(faq.id), "question": faq.question}


@router.post("/chat/human-handoff", response_model=dict)
async def human_handoff(body: ChatMessage, db: AsyncSession = Depends(get_db)):
    """轉人工客服"""
    svc = ChatService(db)
    if svc._filter_sensitive(body.message):
        raise HTTPException(status_code=400, detail="該內容無法處理")
    return {"status": "transferred", "message": "已轉接人工客服，請稍候。"}

