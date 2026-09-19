import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.core.security import hash_password
from app.services.scam_service import ScamService
from app.services.game_service import GameService


async def seed():
    print(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.DATABASE_NAME]

    print("Checking / seeding demo user...")
    demo_email = "demo@mitra.org"
    existing_user = await db.users.find_one({"email": demo_email})
    if not existing_user:
        user_doc = {
            "email": demo_email,
            "hashed_password": hash_password("demo123"),
            "name": "Ramesh Kumar",
            "phone": "9876543210",
            "preferred_language": "te",  # Demonstration in Telugu/English/Hindi
            "has_profile_completed": True,
            "profile": {
                "preferred_language": "te",
                "income_pattern": "irregular",
                "income_sources": ["Farming (Cotton)", "Tailoring"],
                "primary_expense_categories": ["Household", "Education", "Agriculture"],
                "financial_literacy_level": "beginner",
                "primary_goal": "Emergency Savings",
                "dependents_count": 3,
                "monthly_target_savings": 2500.0,
                "lean_months": ["May", "June", "November"],
                "peak_months": ["January", "April", "October"],
                "notes": "Small farmer and seasonal tailoring worker"
            },
            "total_xp": 150,
            "streak_days": 4,
            "badges": ["Scam Shield", "Budget Guardian"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        res = await db.users.insert_one(user_doc)
        user_id = str(res.inserted_id)
        print(f"Created demo user: {demo_email} (password: demo123, ID: {user_id})")

        # Seed realistic sample transactions for irregular income demo
        sample_txs = [
            # Incomes
            {"user_id": user_id, "type": "income", "amount": 18000.0, "category": "farming", "source_or_item": "Cotton Harvest", "date": datetime(2026, 7, 15), "is_irregular": True},
            {"user_id": user_id, "type": "income", "amount": 4500.0, "category": "tailoring", "source_or_item": "Festival Stitching", "date": datetime(2026, 7, 28), "is_irregular": True},
            {"user_id": user_id, "type": "income", "amount": 9000.0, "category": "farming", "source_or_item": "Vegetable Sales", "date": datetime(2026, 8, 10), "is_irregular": True},
            {"user_id": user_id, "type": "income", "amount": 12000.0, "category": "farming", "source_or_item": "Paddy Batch", "date": datetime(2026, 9, 2), "is_irregular": True},
            {"user_id": user_id, "type": "income", "amount": 3500.0, "category": "tailoring", "source_or_item": "School Uniform Stitching", "date": datetime(2026, 9, 12), "is_irregular": True},

            # Expenses
            {"user_id": user_id, "type": "expense", "amount": 4000.0, "category": "household", "source_or_item": "Monthly Groceries & Ration", "date": datetime(2026, 9, 3), "is_irregular": False},
            {"user_id": user_id, "type": "expense", "amount": 2500.0, "category": "education", "source_or_item": "School Books & Fees", "date": datetime(2026, 9, 5), "is_irregular": False},
            {"user_id": user_id, "type": "expense", "amount": 1500.0, "category": "healthcare", "source_or_item": "Fever & Clinic Medicines", "date": datetime(2026, 9, 8), "is_irregular": True},
            {"user_id": user_id, "type": "expense", "amount": 2500.0, "category": "agriculture", "source_or_item": "Organic Fertilizer", "date": datetime(2026, 9, 11), "is_irregular": True}
        ]
        for tx in sample_txs:
            tx["created_at"] = tx["date"]
            await db.transactions.insert_one(tx)
        print(f"Seeded {len(sample_txs)} transactions demonstrating irregular cash flows.")

        # Seed sample goal
        await db.goals.insert_one({
            "user_id": user_id,
            "title": "Emergency Lean-Month Fund",
            "target_amount": 25000.0,
            "current_amount": 10000.0,
            "monthly_contribution_planned": 2500.0,
            "category": "emergency",
            "status": "in_progress",
            "notes": "Reserve fund for monsoon and dry season",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        print("Seeded sample emergency savings goal.")
    else:
        print(f"Demo user already exists: {demo_email}")

    print("Database seeding completed successfully.")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
