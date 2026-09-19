from app.services.simulator_service import SimulatorService
from app.schemas.simulator_schemas import SimulationRequest


def test_what_if_simulator_income_drop():
    req = SimulationRequest(
        income_change_percentage=-30.0,
        expense_change_amount=1000.0,
        new_monthly_loan_emi=500.0,
        language="en"
    )

    result = SimulatorService.simulate_scenario(
        request=req,
        baseline_income=15000.0,
        baseline_expenses=10000.0,
        emergency_fund_balance=10000.0,
        language="en"
    )

    assert result.baseline.monthly_income == 15000.0
    assert result.baseline.monthly_expenses == 10000.0
    assert result.baseline.net_remaining == 5000.0

    # Under -30% income drop (10,500) and +1,500 expenses (11,500), net is negative (-1,000)
    assert result.simulated.monthly_income == 10500.0
    assert result.simulated.monthly_expenses == 11500.0
    assert result.simulated.net_remaining == -1000.0
    assert result.risk_level == "HIGH_RISK"
    assert len(result.actionable_recommendations) >= 2
