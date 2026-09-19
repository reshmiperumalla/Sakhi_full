import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_ai_assistant_chat_multilingual():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login
        res_login = await client.post("/api/auth/login", json={
            "email": "demo@mitra.org",
            "password": "demo123"
        })
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. English query: "I have ₹5,000 left this month. How should I manage it?"
        res_en = await client.post("/api/assistant/chat", json={
            "message": "I have ₹5,000 left this month. How should I manage it?",
            "language": "en",
            "include_voice_text": True
        }, headers=headers)
        assert res_en.status_code == 200
        data_en = res_en.json()
        assert "response" in data_en
        assert len(data_en["response"]) > 20
        assert data_en["detected_intent"] == "budget_guidance"
        assert len(data_en["suggestions"]) >= 2

        # 2. Telugu query
        res_te = await client.post("/api/assistant/chat", json={
            "message": "ఈ నెల నాకు ₹5,000 మిగిలింది. ఎలా నిర్వహించాలి?",
            "language": "te"
        }, headers=headers)
        assert res_te.status_code == 200
        data_te = res_te.json()
        assert data_te["language"] == "te"
        assert len(data_te["suggestions"]) >= 2
