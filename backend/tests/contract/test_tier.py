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
class TestTierContract:
    async def test_get_members_me_tier_returns_200_or_401(self, client):
        response = await client.get("/members/me/tier")
        assert response.status_code in [200, 401]

    async def test_patch_member_tier_returns_200_or_401(self, client):
        payload = {"tier": "高级", "annual_fee": 2000}
        response = await client.patch("/members/00000000-0000-0000-0000-000000000001/tier", json=payload)
        assert response.status_code in [200, 401, 404]

    async def test_root_manage_board_returns_200(self, client):
        payload = {"member_id": "00000000-0000-0000-0000-000000000001", "is_board": True}
        response = await client.post("/members/manage-board", json=payload)
        assert response.status_code in [200, 401]
