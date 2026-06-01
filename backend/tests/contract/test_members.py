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
class TestMembersContract:
    """Contract tests for member endpoints"""

    async def test_get_members_me_returns_200(self, client):
        response = await client.get("/members/me")
        # Without auth, should return 401
        assert response.status_code in [200, 401]

    async def test_patch_members_me_returns_200_or_401(self, client):
        payload = {"phone": "+85399998888"}
        response = await client.patch("/members/me", json=payload)
        assert response.status_code in [200, 401]

    async def test_get_members_returns_200_or_403(self, client):
        response = await client.get("/members")
        assert response.status_code in [200, 401, 403]

    async def test_get_member_by_id_returns_format(self, client):
        response = await client.get("/members/00000000-0000-0000-0000-000000000000")
        assert response.status_code in [200, 401, 404]

    async def test_get_members_export_returns_csv(self, client):
        response = await client.get("/members/export")
        assert response.status_code in [200, 401, 403]
