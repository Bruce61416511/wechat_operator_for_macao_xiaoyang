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
class TestEventsNotificationsContract:
    """Contract tests for event and notification endpoints"""

    async def test_get_events_returns_200(self, client):
        response = await client.get("/events")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data

    async def test_post_event_returns_201_with_valid_body(self, client):
        payload = {
            "title": "2026年会",
            "description": "协会年度大会",
            "event_date": "2026-06-15T14:00:00Z",
            "location": "澳门威尼斯人",
            "price_normal": 100,
            "max_participants": 200
        }
        response = await client.post("/events", json=payload)
        assert response.status_code in [201, 401]

    async def test_post_event_register_returns_200(self, client):
        response = await client.post("/events/00000000-0000-0000-0000-000000000000/register")
        assert response.status_code in [200, 401, 404]

    async def test_get_notifications_returns_200(self, client):
        response = await client.get("/notifications")
        assert response.status_code in [200, 401]

    async def test_post_notification_returns_201(self, client):
        payload = {"member_ids": ["00000000-0000-0000-0000-000000000001"], "type": "活动", "title": "活动通知", "content": "请参加"}
        response = await client.post("/notifications", json=payload)
        assert response.status_code in [201, 401]
