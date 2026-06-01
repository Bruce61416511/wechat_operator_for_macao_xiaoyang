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
class TestApplicationsContract:
    """Contract tests for POST /applications and GET /applications/{id}"""

    async def test_post_applications_returns_201_with_valid_body(self, client):
        payload = {
            "username": "zhangsan",
            "id_number": "440101199001011234",
            "applicant_name": "张三",
            "applicant_phone": "+85366668888",
            "applicant_email": "zhang@example.com",
            "applicant_address": "澳门路氹城",
            "career_history": "从事直播行业3年",
            "qualifications": "主播资格证"
        }
        response = await client.post("/applications", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert "application_id" in data
        assert data["status"] in ["待审核", "pending"]

    async def test_post_applications_returns_409_for_duplicate_username(self, client):
        payload = {
            "username": "zhangsan",
            "id_number": "440101199001011234",
            "applicant_name": "张三",
            "applicant_phone": "+85366668888",
            "applicant_email": "zhang@example.com",
            "applicant_address": "澳门路氹城",
            "career_history": "从事直播行业3年",
            "qualifications": "主播资格证"
        }
        await client.post("/applications", json=payload)
        response = await client.post("/applications", json=payload)
        assert response.status_code == 409
        data = response.json()
        assert "error" in data

    async def test_get_application_by_id_returns_200(self, client):
        payload = {
            "username": "lisi",
            "id_number": "440101199002021234",
            "applicant_name": "李四",
            "applicant_phone": "+85366669999",
            "applicant_email": "lisi@example.com",
            "applicant_address": "澳门半岛",
            "career_history": "直播运营2年",
            "qualifications": "运营证书"
        }
        create_resp = await client.post("/applications", json=payload)
        app_id = create_resp.json()["application_id"]

        response = await client.get(f"/applications/{app_id}")
        assert response.status_code == 200
        data = response.json()
        assert "application" in data
        assert data["application"]["username"] == "lisi"
        assert "status_history" in data

    async def test_get_application_returns_404_for_nonexistent(self, client):
        response = await client.get("/applications/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404
