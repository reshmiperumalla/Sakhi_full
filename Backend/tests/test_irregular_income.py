import pytest
from app.services.irregular_income import IrregularIncomeEngine


def test_irregular_income_volatility():
    # User with fluctuating monthly income: June 10,000, July 15,000, August 8,000
    incomes = [10000.0, 15000.0, 8000.0]
    metrics = IrregularIncomeEngine.analyze_income_volatility(incomes)

    assert metrics["average_monthly_income"] == 11000.0
    assert metrics["safe_baseline_income"] == 8000.0
    assert metrics["highest_month_income"] == 15000.0
    assert metrics["lowest_month_income"] == 8000.0
    assert metrics["volatility_score"] > 20.0
    assert metrics["volatility_level"] in ["MODERATE", "HIGH"]


def test_lean_reserve_allocation():
    current_month_income = 16000.0
    safe_baseline = 10000.0
    current_buffer = 5000.0
    target_buffer = 30000.0

    allocation = IrregularIncomeEngine.calculate_lean_reserve_allocation(
        current_month_income=current_month_income,
        safe_baseline_income=safe_baseline,
        current_buffer_balance=current_buffer,
        target_buffer_balance=target_buffer
    )

    assert allocation["surplus_above_baseline"] == 6000.0
    assert allocation["suggested_buffer_deposit"] > 0
    assert allocation["safe_spending_limit_for_month"] < current_month_income
