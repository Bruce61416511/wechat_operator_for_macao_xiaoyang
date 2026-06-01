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
class TestApplicationFlow:
    """Integration test: full application flow submit -> screen -> review -> pay -> confirm"""

    async def test_full_application_flow(self, client):
        # Step 1: Submit application
        payload = {
            "username": "wangwu",
            "id_number": "440101199003031234",
            "applicant_name": "王五",
            "applicant_phone": "+85366661111",
            "applicant_email": "wangwu@example.com",
            "applicant_address": "澳门氹仔",
            "career_history": "直播行业5年经验",
            "qualifications": "高级主播证书"
        }
        resp = await client.post("/applications", json=payload)
        assert resp.status_code == 201
        app_id = resp.json()["application_id"]
        assert resp.json()["status"] in ["待审核", "pending"]

        # Step 2: AI screening (pass)
        resp = await client.post(f"/applications/{app_id}/screening", json={"result": "pass", "reason": "符合入会条件"})
        assert resp.status_code == 200
        assert resp.json()["status"] in ["初審通过", "screening_passed"]

        # Step 3: Final review by root (pass)
        resp = await client.post(f"/applications/{app_id}/final-review", json={"result": "pass", "comment": "同意入会"})
        assert resp.status_code == 200
        assert resp.json()["status"] in ["终審通过", "final_review_passed"]

        # Step 4: Upload payment proof
        resp = await client.post(f"/applications/{app_id}/payment-proof", files={"file": ("receipt.jpg", b"fake-image-data", "image/jpeg")})
        assert resp.status_code == 200
        assert "payment_proof_url" in resp.json()

        # Step 5: Verify payment by root -> creates Member
        resp = await client.post(f"/applications/{app_id}/verify-payment")
        assert resp.status_code == 200
        assert resp.json()["status"] in ["已入会", "member_created"]

    async def test_screening_rejects_ineligible_applicant(self, client):
        payload = {
            "username": "zhaoliu",
            "id_number": "440101199004041234",
            "applicant_name": "赵六",
            "applicant_phone": "+85366662222",
            "applicant_email": "zhaoliu@example.com",
            "applicant_address": "澳门路环",
            "career_history": "",
            "qualifications": ""
        }
        resp = await client.post("/applications", json=payload)
        app_id = resp.json()["application_id"]

        resp = await client.post(f"/applications/{app_id}/screening", json={"result": "fail", "reason": "缺少从业经历和资质"})
        assert resp.status_code == 200
        assert resp.json()["status"] in ["初審不通过", "screening_failed"]

    async def test_final_review_can_reject(self, client):
        payload = {
            "username": "sunqi",
            "id_number": "440101199005051234",
            "applicant_name": "孙七",
            "applicant_phone": "+85366663333",
            "applicant_email": "sunqi@example.com",
            "applicant_address": "澳门新口岸",
            "career_history": "直播行业2年",
            "qualifications": "基础证书"
        }
        resp = await client.post("/applications", json=payload)
        app_id = resp.json()["application_id"]

        await client.post(f"/applications/{app_id}/screening", json={"result": "pass", "reason": "符合条件"})

        resp = await client.post(f"/applications/{app_id}/final-review", json={"result": "fail", "comment": "资质不足，建议积累经验后再申请"})
        assert resp.status_code == 200
        assert resp.json()["status"] in ["终審不通过", "final_review_failed"]
