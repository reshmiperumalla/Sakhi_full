import math
import statistics
from typing import List, Dict, Any, Optional
from datetime import datetime


class IrregularIncomeEngine:
    """
    Core differentiating engine:
    Specifically models fluctuating, seasonal, and irregular cash flows for rural/semi-urban households.
    Prevents lifestyle creep during peak earnings and prevents debt traps during lean months.
    """

    @classmethod
    def analyze_income_volatility(cls, monthly_incomes: List[float]) -> Dict[str, Any]:
        """
        Calculates volatility, baseline safe income, and coefficient of variation (CV).
        """
        if not monthly_incomes:
            return {
                "average_monthly_income": 0.0,
                "safe_baseline_income": 0.0,
                "volatility_score": 0.0,
                "volatility_level": "UNKNOWN",
                "recommended_lean_buffer_months": 3
            }

        count = len(monthly_incomes)
        avg = statistics.mean(monthly_incomes)

        if count == 1:
            return {
                "average_monthly_income": round(avg, 2),
                "safe_baseline_income": round(avg * 0.8, 2),
                "volatility_score": 20.0,
                "volatility_level": "MODERATE",
                "recommended_lean_buffer_months": 4
            }

        stdev = statistics.stdev(monthly_incomes)
        cv = (stdev / avg) * 100 if avg > 0 else 0.0  # Coefficient of Variation

        # Safe baseline income: 25th percentile or minimum safe floor
        sorted_incomes = sorted(monthly_incomes)
        # Conservative percentile: use lower quartile as baseline
        q1_idx = int(0.25 * (count - 1))
        safe_baseline = sorted_incomes[q1_idx]

        # Determine volatility classification & recommended emergency runway
        if cv < 20:
            level = "LOW"
            rec_buffer = 3
        elif cv < 45:
            level = "MODERATE"
            rec_buffer = 4
        else:
            level = "HIGH"  # Highly irregular (e.g. agricultural harvest once or twice a year)
            rec_buffer = 6

        return {
            "average_monthly_income": round(avg, 2),
            "safe_baseline_income": round(safe_baseline, 2),
            "highest_month_income": round(max(monthly_incomes), 2),
            "lowest_month_income": round(min(monthly_incomes), 2),
            "volatility_score": round(cv, 1),
            "volatility_level": level,
            "recommended_lean_buffer_months": rec_buffer
        }

    @classmethod
    def calculate_lean_reserve_allocation(
        cls,
        current_month_income: float,
        safe_baseline_income: float,
        current_buffer_balance: float,
        target_buffer_balance: float
    ) -> Dict[str, Any]:
        """
        When current month income exceeds safe baseline (windfall/harvest/festival season),
        calculates exact amount to channel into lean-month reserve.
        """
        surplus = max(0.0, current_month_income - safe_baseline_income)

        # Allocate 60-70% of surplus to lean-month reserve until target is met
        buffer_deficit = max(0.0, target_buffer_balance - current_buffer_balance)
        if buffer_deficit > 0:
            suggested_allocation = min(surplus * 0.65, buffer_deficit)
        else:
            # Buffer full, user can allocate to goals
            suggested_allocation = surplus * 0.25

        available_for_spending = current_month_income - suggested_allocation

        return {
            "surplus_above_baseline": round(surplus, 2),
            "suggested_buffer_deposit": round(suggested_allocation, 2),
            "safe_spending_limit_for_month": round(available_for_spending, 2),
            "buffer_target_completion_pct": round(min(100.0, (current_buffer_balance + suggested_allocation) / target_buffer_balance * 100), 1) if target_buffer_balance > 0 else 100.0
        }

    @classmethod
    def generate_irregular_tips(
        cls,
        volatility_level: str,
        is_lean_month: bool,
        current_balance: float,
        safe_baseline: float,
        language: str = "en"
    ) -> List[str]:
        """Generate compassionate, practical tips for the user's situation."""
        tips = []
        if language == "te":
            if is_lean_month:
                tips.append("ఇది మీకు తక్కువ ఆదాయం వచ్చే సమయం. కేవలం ముఖ్యమైన నిత్యావసరాలకు మాత్రమే ప్రాధాన్యత ఇవ్వండి.")
                tips.append("అనవసర ఖర్చులను వాయిదా వేయండి; అత్యవసర నిధి మీ అవసరాలకు రక్షణగా ఉంటుంది.")
            else:
                tips.append("ఈ నెలలో వచ్చిన అదనపు ఆదాయాన్ని ఖర్చు చేయకుండా, రాబోయే తక్కువ ఆదాయ నెలల కోసం దాచుకోండి.")
                tips.append("మీ సురక్షిత వ్యయ పరిమితిని దాటకుండా ఉండండి.")
        elif language == "hi":
            if is_lean_month:
                tips.append("यह आपके लिए कम कमाई वाला महीना है। केवल अत्यंत आवश्यक राशन और दवाइयों पर ही खर्च करें।")
                tips.append("गैर-जरूरी खरीदारी को आगे के लिए टालें; आपातकालीन गुल्लक से ही जरूरत पूरी करें।")
            else:
                tips.append("इस महीने की अतिरिक्त कमाई को तुरंत खर्च करने के बजाय कमजोर महीनों के लिए सुरक्षित रखें।")
                tips.append("अपनी सुरक्षित खर्च सीमा (Safe Baseline) से अधिक खर्च न करें।")
        else:
            if is_lean_month:
                tips.append("This is currently a lean month for your household. Focus on essential survival needs first.")
                tips.append("Postpone non-urgent discretionary purchases until the next harvest or high-earnings cycle.")
            else:
                tips.append(f"Your earnings are strong this period! Bank at least 60% of the surplus into your Lean Month Cushion.")
                tips.append("Anchor your lifestyle to your Safe Baseline so lean months never force you into high-interest debt.")

        return tips
