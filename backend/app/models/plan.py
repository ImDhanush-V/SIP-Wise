"""Pydantic models for saved plans."""

from datetime import datetime
from pydantic import BaseModel, Field

from app.models.risk import RiskProfile


class PlanCreate(BaseModel):
    """Payload to save a plan."""
    risk_profile: RiskProfile
    monthly_sip: float = Field(..., gt=0)
    years: int = Field(..., gt=0, le=40)
    goal_amount: float = Field(..., gt=0)
    weights: dict[str, float]
    expected_return: float
    volatility: float
    sharpe: float
    goal_probability: float
    percentiles: list[dict]


class PlanResponse(BaseModel):
    """Saved plan returned to the client."""
    id: str
    created_at: datetime
    risk_profile: RiskProfile
    monthly_sip: float
    years: int
    goal_amount: float
    weights: dict[str, float]
    expected_return: float
    volatility: float
    sharpe: float
    goal_probability: float
    percentiles: list[dict]
