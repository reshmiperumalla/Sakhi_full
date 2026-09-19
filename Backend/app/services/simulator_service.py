from typing import Dict, Any, List
from app.schemas.simulator_schemas import SimulationRequest, SimulationResult, SimulationMetric


class SimulatorService:
    """
    Runs hypothetical financial stress tests:
    - Income drop (e.g. crop failure, off-season, illness)
    - Expense surge (e.g. medical bill, emergency home repair)
    - New recurring EMI / debt installment
    Calculates runway, safety buffer deficit, and actionable mitigation advice in En/Hi/Te.
    """

    @classmethod
    def simulate_scenario(
        cls,
        request: SimulationRequest,
        baseline_income: float,
        baseline_expenses: float,
        emergency_fund_balance: float = 10000.0,
        language: str = "en"
    ) -> SimulationResult:
        lang = language or request.language or "en"

        # Baseline calculations
        b_income = max(0.0, baseline_income if baseline_income > 0 else 15000.0)
        b_expenses = max(0.0, baseline_expenses if baseline_expenses > 0 else 10000.0)
        b_remaining = b_income - b_expenses
        b_runway = round(emergency_fund_balance / b_expenses, 1) if b_expenses > 0 else 12.0
        b_savings_cap = max(0.0, b_remaining)

        baseline_metric = SimulationMetric(
            monthly_income=round(b_income, 2),
            monthly_expenses=round(b_expenses, 2),
            net_remaining=round(b_remaining, 2),
            runway_months=b_runway,
            savings_capacity=round(b_savings_cap, 2)
        )

        # Simulated adjustments
        pct_change = request.income_change_percentage or 0.0
        s_income = max(0.0, b_income * (1.0 + (pct_change / 100.0)))

        exp_change = request.expense_change_amount or 0.0
        emi_change = request.new_monthly_loan_emi or 0.0
        s_expenses = max(0.0, b_expenses + exp_change + emi_change)

        s_remaining = s_income - s_expenses
        s_runway = round(emergency_fund_balance / s_expenses, 1) if s_expenses > 0 else 12.0
        s_savings_cap = max(0.0, s_remaining)

        simulated_metric = SimulationMetric(
            monthly_income=round(s_income, 2),
            monthly_expenses=round(s_expenses, 2),
            net_remaining=round(s_remaining, 2),
            runway_months=s_runway,
            savings_capacity=round(s_savings_cap, 2)
        )

        net_diff = s_remaining - b_remaining
        runway_diff = s_runway - b_runway

        # Risk Classification
        if s_remaining < 0:
            risk_level = "HIGH_RISK"
        elif s_remaining < (s_income * 0.15):
            risk_level = "MODERATE_CAUTION"
        else:
            risk_level = "SAFE"

        # Formulate Explanation & Actionable Tips
        explanation, recommendations = cls._generate_simulation_text(
            baseline_metric, simulated_metric, net_diff, risk_level, lang
        )

        return SimulationResult(
            baseline=baseline_metric,
            simulated=simulated_metric,
            net_difference=round(net_diff, 2),
            runway_difference_months=round(runway_diff, 1),
            risk_level=risk_level,
            explanation=explanation,
            actionable_recommendations=recommendations
        )

    @classmethod
    def _generate_simulation_text(
        cls,
        base: SimulationMetric,
        sim: SimulationMetric,
        net_diff: float,
        risk_level: str,
        lang: str
    ) -> tuple[str, List[str]]:
        if lang == "te":
            if risk_level == "HIGH_RISK":
                exp = (
                    f"హెచ్చరిక: ఈ మార్పుల వల్ల మీ నెలవారీ ఖర్చులు ఆదాయం కంటే ఎక్కువగా మారతాయి. "
                    f"ప్రతి నెలా ₹{abs(int(sim.net_remaining)):,} లోటు ఏర్పడుతుంది. మీ అత్యవసర నిధి కేవలం {sim.runway_months} నెలలు మాత్రమే సరిపోతుంది."
                )
                recs = [
                    "కొత్త అప్పులు లేదా నెలవారీ ఈఎంఐలను వాయిదా వేయండి.",
                    "కేవలం బియ్యం, నిత్యావసరాలు మరియు మందులకు మాత్రమే పరిమితం అవ్వండి.",
                    "కుటుంబంలో తాత్కాలిక చిన్నపాటి పనుల ద్వారా అదనపు ఆదాయం పొందడానికి ప్రయత్నించండి."
                ]
            else:
                exp = (
                    f"ఈ మార్పుల తర్వాత కూడా మీ వద్ద ప్రతి నెలా సుమారు ₹{int(sim.net_remaining):,} మిగులు ఉంటుంది. "
                    f"(ప్రస్తుతం కంటే ₹{abs(int(net_diff)):,} {'తక్కువ' if net_diff < 0 else 'ఎక్కువ'})."
                )
                recs = [
                    "మీ బడ్జెట్‌ను తాజా పరిస్థితికి అనుగుణంగా సర్దుబాటు చేసుకోండి.",
                    "రాబోయే తక్కువ ఆదాయ నెలల కోసం పొదుపు చేయడం కొనసాగించండి."
                ]
        elif lang == "hi":
            if risk_level == "HIGH_RISK":
                exp = (
                    f"सावधानी: इस स्थिति में आपका मासिक खर्च आपकी आय से अधिक हो जाएगा। "
                    f"हर महीने ₹{abs(int(sim.net_remaining)):,} का घाटा होगा। आपका आपातकालीन फंड केवल {sim.runway_months} महीने ही चल पाएगा।"
                )
                recs = [
                    "नया लोन या ईएमआई लेने से तुरंत बचें।",
                    "गैर-जरूरी सभी खर्चों को कुछ महीनों के लिए बंद करें।",
                    "मंदी के महीनों के लिए अपनी सुरक्षा गुल्लक का सावधानीपूर्वक उपयोग करें।"
                ]
            else:
                exp = (
                    f"इन बदलावों के बाद भी आपके पास हर महीने लगभग ₹{int(sim.net_remaining):,} बचेंगे। "
                    f"(वर्तमान स्थिति से ₹{abs(int(net_diff)):,} {'कम' if net_diff < 0 else 'ज्यादा'})।"
                )
                recs = [
                    "अपने बजट को नई आय के हिसाब से संतुलित रखें।",
                    "सुरक्षा गुल्लक में थोड़ा-थोड़ा जमा करते रहें।"
                ]
        else:
            if risk_level == "HIGH_RISK":
                exp = (
                    f"Caution: Under these simulated conditions, your monthly expenses exceed your earnings by ₹{abs(int(sim.net_remaining)):,}/month. "
                    f"Your emergency cushion runway drops to {sim.runway_months} months."
                )
                recs = [
                    "Avoid committing to new loan EMIs or large credit purchases.",
                    "Freeze non-essential lifestyle spending until regular income rebounds.",
                    "Dip into the designated lean-month reserve conservatively."
                ]
            else:
                exp = (
                    f"Under this simulation, your finances remain viable with ₹{int(sim.net_remaining):,} leftover each month "
                    f"(₹{abs(int(net_diff)):,} {'lower' if net_diff < 0 else 'higher'} than your baseline)."
                )
                recs = [
                    "Adjust your monthly spending limit to reflect this new reality.",
                    "Keep funding your emergency reserve to maintain your buffer."
                ]

        return exp, recs
