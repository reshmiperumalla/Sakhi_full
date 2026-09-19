import pytest
from app.services.parser_service import NaturalLanguageParserService


@pytest.mark.asyncio
async def test_natural_language_parser_calculations():
    text = "This month I got 12,000 from farming and 4,000 from my tailoring work, but I spent around 8,000 on household things."
    result = await NaturalLanguageParserService.parse_text(text, preferred_language="en")

    assert result.total_income == 16000.0
    assert result.total_expenses == 8000.0
    assert result.net_remaining == 8000.0
    assert len(result.extracted_items) >= 2

    # Check categories
    categories = [it.category for it in result.extracted_items]
    assert "farming" in categories or "other" in categories
    assert "household" in categories


@pytest.mark.asyncio
async def test_multilingual_parser_hindi_and_telugu():
    # Hindi
    hi_text = "मुझे खेती से 15000 मिला और राशन में 4000 खर्च हुआ"
    hi_result = await NaturalLanguageParserService.parse_text(hi_text, preferred_language="hi")
    assert hi_result.total_income == 15000.0
    assert hi_result.total_expenses == 4000.0
    assert hi_result.net_remaining == 11000.0
    assert hi_result.detected_language == "hi"

    # Telugu
    te_text = "వ్యవసాయం ద్వారా 10000 వచ్చింది, మందులకు 2000 అయింది"
    te_result = await NaturalLanguageParserService.parse_text(te_text, preferred_language="te")
    assert te_result.total_income == 10000.0
    assert te_result.total_expenses == 2000.0
    assert te_result.net_remaining == 8000.0
    assert te_result.detected_language == "te"
