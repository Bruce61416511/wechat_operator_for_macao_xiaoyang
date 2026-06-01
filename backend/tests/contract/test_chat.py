import pytest
from httpx import AsyncClient, ASGITransport

from src.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.anyio
class TestChatContract:
    """Contract tests for POST /chat/message and GET /chat/history"""

    async def test_post_chat_message_returns_200_with_valid_body(self, client):
        payload = {"message": "入会需要什么条件？"}
        response = await client.post("/chat/message", json=payload)
        assert response.status_code == 200
        # SSE response format: data: {...}\n\n
        assert "text/event-stream" in response.headers.get("content-type", "")

    async def test_post_chat_message_rejects_empty_message(self, client):
        payload = {"message": ""}
        response = await client.post("/chat/message", json=payload)
        assert response.status_code == 422

    async def test_get_chat_history_returns_200(self, client):
        response = await client.get("/chat/history")
        assert response.status_code == 200
        data = response.json()
        assert "messages" in data

    async def test_get_faq_returns_200(self, client):
        response = await client.get("/faq")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data

    async def test_post_human_handoff_returns_200(self, client):
        payload = {"message": "我想转人工客服"}
        response = await client.post("/chat/human-handoff", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
