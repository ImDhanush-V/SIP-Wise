"""Risk-profile endpoint."""

from fastapi import APIRouter

from app.models.risk import RiskProfileRequest, RiskProfileResponse
from app.services.risk_engine import QUESTIONS, compute_risk_profile

router = APIRouter(tags=["risk"])


@router.get("/risk-profile/questions")
async def get_questions() -> list[dict]:
    """Return the questionnaire questions and options."""
    return QUESTIONS


@router.post("/risk-profile", response_model=RiskProfileResponse)
async def post_risk_profile(req: RiskProfileRequest) -> RiskProfileResponse:
    """Score the user's answers and return their risk profile."""
    return compute_risk_profile(req)
