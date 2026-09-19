import math
from typing import Dict, Any, Optional
from datetime import datetime
from app.schemas.goal_schemas import GoalResponse, GoalSimulateResponse


class GoalService:
    @classmethod
    def calculate_goal_progress(cls, goal_data: Dict[str, Any]) -> GoalResponse:
        target = float(goal_data.get("target_amount", 0.0))
        current = float(goal_data.get("current_amount", 0.0))
        monthly = float(goal_data.get("monthly_contribution_planned", 1000.0))

        remaining = max(0.0, target - current)
        progress = round(min(100.0, (current / target * 100) if target > 0 else 100.0), 1)

        estimated_months = math.ceil(remaining / monthly) if monthly > 0 and remaining > 0 else 0

        created_at = goal_data.get("created_at")
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at)
            except Exception:
                created_at = datetime.utcnow()
        elif not created_at:
            created_at = datetime.utcnow()

        return GoalResponse(
            id=str(goal_data.get("_id") or goal_data.get("id")),
            user_id=str(goal_data.get("user_id")),
            title=goal_data.get("title", "Savings Goal"),
            target_amount=round(target, 2),
            current_amount=round(current, 2),
            remaining_amount=round(remaining, 2),
            progress_percentage=progress,
            monthly_contribution_planned=round(monthly, 2),
            estimated_months_left=estimated_months,
            category=goal_data.get("category", "emergency"),
            status=goal_data.get("status", "in_progress"),
            target_date=goal_data.get("target_date"),
            notes=goal_data.get("notes"),
            created_at=created_at
        )

    @classmethod
    def simulate_contribution_change(
        cls,
        goal_data: Dict[str, Any],
        new_monthly_savings: float,
        language: str = "en"
    ) -> GoalSimulateResponse:
        target = float(goal_data.get("target_amount", 0.0))
        current = float(goal_data.get("current_amount", 0.0))
        planned = float(goal_data.get("monthly_contribution_planned", 1000.0))
        remaining = max(0.0, target - current)

        cur_months = math.ceil(remaining / planned) if planned > 0 else 999
        new_months = math.ceil(remaining / new_monthly_savings) if new_monthly_savings > 0 else 999
        months_saved = max(0, cur_months - new_months)

        title = goal_data.get("title", "Goal")

        if language == "te":
            explanation = (
                f"మీరు ప్రతి నెలా ₹{int(new_monthly_savings):,} పొదుపు చేస్తే, మీ '{title}' లక్ష్యం "
                f"{new_months} నెలల్లో పూర్తవుతుంది. మీరు ప్రస్తుత ప్రణాళిక కంటే {months_saved} నెలలు ముందుగానే సాధిస్తారు!"
            )
        elif language == "hi":
            explanation = (
                f"यदि आप हर महीने ₹{int(new_monthly_savings):,} बचाते हैं, तो आपका '{title}' लक्ष्य "
                f"{new_months} महीनों में पूरा हो जाएगा। आप पहले की तुलना में {months_saved} महीने पहले इसे हासिल कर लेंगे!"
            )
        else:
            explanation = (
                f"By saving ₹{int(new_monthly_savings):,} each month instead of ₹{int(planned):,}, "
                f"you will reach your '{title}' goal in {new_months} months—saving you {months_saved} whole months of waiting!"
            )

        return GoalSimulateResponse(
            goal_id=str(goal_data.get("_id") or goal_data.get("id")),
            title=title,
            current_months_to_complete=cur_months,
            new_months_to_complete=new_months,
            months_saved=months_saved,
            explanation=explanation
        )
