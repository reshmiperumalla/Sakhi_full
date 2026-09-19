import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import connect_to_mongo, close_mongo_connection


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_db():
    await connect_to_mongo()
    yield
    await close_mongo_connection()


@pytest.mark.asyncio
async def test_api_health_and_root():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Root
        res = await client.get("/")
        assert res.status_code == 200
        assert res.json()["status"] == "online"

        # Health
        res_health = await client.get("/api/health")
        assert res_health.status_code == 200
        assert res_health.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_auth_login_and_profile():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login with seeded demo user
        res_login = await client.post("/api/auth/login", json={
            "email": "demo@mitra.org",
            "password": "demo123"
        })
        assert res_login.status_code == 200
        token_data = res_login.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Check me
        res_me = await client.get("/api/auth/me", headers=headers)
        assert res_me.status_code == 200
        assert res_me.json()["email"] == "demo@mitra.org"

        # Check profile
        res_prof = await client.get("/api/profile", headers=headers)
        assert res_prof.status_code == 200
        prof_data = res_prof.json()["profile"]
        assert prof_data["income_pattern"] == "irregular"


@pytest.mark.asyncio
async def test_irregular_income_and_dashboard():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res_login = await client.post("/api/auth/login", json={
            "email": "demo@mitra.org",
            "password": "demo123"
        })
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Irregular analysis
        res_irreg = await client.get("/api/irregular-income/analysis", headers=headers)
        assert res_irreg.status_code == 200
        irreg_data = res_irreg.json()
        assert "volatility_metrics" in irreg_data
        assert "lean_reserve_recommendation" in irreg_data

        # Dashboard summary
        res_dash = await client.get("/api/dashboard/summary", headers=headers)
        assert res_dash.status_code == 200
        dash_data = res_dash.json()
        assert "metrics" in dash_data
        assert "savings_goal" in dash_data
        assert "top_expense" in dash_data


@pytest.mark.asyncio
async def test_scam_education_and_games():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res_login = await client.post("/api/auth/login", json={
            "email": "demo@mitra.org",
            "password": "demo123"
        })
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Scenarios in Telugu
        res_scams = await client.get("/api/scam/scenarios?language=te", headers=headers)
        assert res_scams.status_code == 200
        scams = res_scams.json()
        assert len(scams) >= 3

        # Evaluate scam
        res_eval = await client.post("/api/scam/evaluate", json={
            "scenario_id": "scam_001_bank_otp",
            "selected_option_id": "C",
            "language": "te"
        }, headers=headers)
        assert res_eval.status_code == 200
        assert res_eval.json()["is_correct"] is True
        assert res_eval.json()["points_earned"] > 0

        # Learning activities
        res_games = await client.get("/api/learning/activities?language=hi", headers=headers)
        assert res_games.status_code == 200
        games = res_games.json()
        assert len(games) == 4

        # Submit game
        res_sub = await client.post("/api/learning/submit", json={
            "activity_id": "game_budget_01",
            "activity_type": "budget_challenge",
            "user_choices": "plan_a",
            "language": "hi"
        }, headers=headers)
        assert res_sub.status_code == 200
        assert res_sub.json()["is_passed"] is True


@pytest.mark.asyncio
async def test_what_if_simulator_and_offline_sync():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res_login = await client.post("/api/auth/login", json={
            "email": "demo@mitra.org",
            "password": "demo123"
        })
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # What-if simulator
        res_sim = await client.post("/api/simulator/simulate", json={
            "income_change_percentage": -25.0,
            "expense_change_amount": 1500.0,
            "language": "en"
        }, headers=headers)
        assert res_sim.status_code == 200
        sim_data = res_sim.json()
        assert "baseline" in sim_data
        assert "simulated" in sim_data
        assert "risk_level" in sim_data

        # Offline sync bootstrap
        res_boot = await client.get("/api/sync/bootstrap?language=te", headers=headers)
        assert res_boot.status_code == 200
        boot_data = res_boot.json()
        assert len(boot_data["scam_scenarios"]) >= 3
        assert len(boot_data["offline_tips"]) >= 3

        import uuid
        test_client_id = f"client-offline-uuid-{uuid.uuid4()}"
        # Offline batch sync
        res_sync = await client.post("/api/sync", json={
            "transactions": [
                {
                    "type": "income",
                    "amount": 5000.0,
                    "category": "tailoring",
                    "source_or_item": "Offline Stitching Order",
                    "client_id": test_client_id
                }
            ],
            "game_results": [],
            "scam_attempts": []
        }, headers=headers)
        assert res_sync.status_code == 200
        assert res_sync.json()["success"] is True
        assert res_sync.json()["synced_transactions"] == 1
