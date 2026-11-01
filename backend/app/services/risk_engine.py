"""Risk profiling engine — scores 7 questions into a risk bucket."""

from app.models.risk import (
    RiskAnswer,
    RiskProfile,
    RiskProfileRequest,
    RiskProfileResponse,
)

# ── Questionnaire definition ──────────────────────────────────────────

QUESTIONS: list[dict] = [
    {
        "id": 1,
        "text": "What is your age?",
        "options": ["Above 55", "46-55", "36-45", "26-35", "18-25"],
    },
    {
        "id": 2,
        "text": "What is your investment horizon?",
        "options": [
            "Less than 1 year",
            "1-3 years",
            "3-5 years",
            "5-10 years",
            "More than 10 years",
        ],
    },
    {
        "id": 3,
        "text": "How stable is your primary source of income?",
        "options": [
            "Very unstable / no income",
            "Somewhat unstable",
            "Average stability",
            "Stable salary",
            "Very stable with multiple sources",
        ],
    },
    {
        "id": 4,
        "text": "If your portfolio dropped 20 %% in one month, what would you do?",
        "options": [
            "Sell everything immediately",
            "Sell some holdings",
            "Do nothing and wait",
            "Buy a little more",
            "Invest significantly more",
        ],
    },
    {
        "id": 5,
        "text": "What portion of your monthly income can you invest?",
        "options": [
            "Less than 10 %%",
            "10-20 %%",
            "20-30 %%",
            "30-50 %%",
            "More than 50 %%",
        ],
    },
    {
        "id": 6,
        "text": "What is your primary investment goal?",
        "options": [
            "Capital preservation",
            "Regular income",
            "Balanced growth and income",
            "Long-term wealth creation",
            "Aggressive capital growth",
        ],
    },
    {
        "id": 7,
        "text": "How much investment experience do you have?",
        "options": [
            "None",
            "Basic (FDs / savings)",
            "Moderate (mutual funds)",
            "Good (stocks + MFs)",
            "Advanced (derivatives / global)",
        ],
    },
]


# ── Scoring ───────────────────────────────────────────────────────────


def _score_answers(answers: list[RiskAnswer]) -> int:
    """Each answer's option index (0-4) is its point value. Total: 0-28."""
    return sum(a.answer for a in answers)


def _classify(score: int) -> tuple[RiskProfile, str]:
    """Map a 0-28 score to a risk bucket."""
    if score <= 10:
        return (
            RiskProfile.CONSERVATIVE,
            "You prefer safety over high returns. A portfolio tilted toward "
            "debt and hybrid funds suits you best.",
        )
    if score <= 20:
        return (
            RiskProfile.MODERATE,
            "You seek a balance between growth and stability. A diversified "
            "mix across equity and debt is ideal.",
        )
    return (
        RiskProfile.AGGRESSIVE,
        "You are comfortable with volatility for higher long-term returns. "
        "Equity-heavy allocations align with your profile.",
    )


def compute_risk_profile(req: RiskProfileRequest) -> RiskProfileResponse:
    """Score the questionnaire and return the risk profile."""
    score = _score_answers(req.answers)
    profile, description = _classify(score)
    return RiskProfileResponse(score=score, profile=profile, description=description)
