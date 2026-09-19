from app.services.scam_service import ScamService
from app.services.game_service import GameService


def test_scam_service_scenarios():
    scenarios = ScamService.get_all_scenarios(language="en")
    assert len(scenarios) >= 3

    # Check first scenario (urgent bank call asking for OTP)
    scam_1 = scenarios[0]
    assert scam_1.scenario_id == "scam_001_bank_otp"

    # Test wrong choice (giving OTP)
    eval_bad = ScamService.evaluate_scenario_answer(
        scenario_id="scam_001_bank_otp",
        selected_option_id="A",
        language="en"
    )
    assert not eval_bad.is_correct
    assert eval_bad.verdict == "DANGEROUS"
    assert eval_bad.points_earned == 0

    # Test correct choice (refusing OTP)
    eval_good = ScamService.evaluate_scenario_answer(
        scenario_id="scam_001_bank_otp",
        selected_option_id="C",
        language="te"
    )
    assert eval_good.is_correct
    assert eval_good.verdict == "SAFE"
    assert eval_good.points_earned > 0
    assert eval_good.badge_unlocked == "Scam Shield"


def test_gamified_learning_activities():
    activities = GameService.get_all_activities(language="hi")
    assert len(activities) == 4

    types = [a.activity_type for a in activities]
    assert "budget_challenge" in types
    assert "scam_detective" in types
    assert "savings_challenge" in types
    assert "smart_spending" in types

    # Test Budget challenge answer
    res = GameService.evaluate_game_choice(
        activity_id="game_budget_01",
        user_choices="plan_a",
        language="hi"
    )
    assert res.is_passed
    assert res.score == 100
    assert res.badge_unlocked == "Budget Guardian"
