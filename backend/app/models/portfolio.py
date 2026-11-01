"""Pydantic models for portfolio optimisation."""

from pydantic import BaseModel, Field

from app.models.risk import RiskProfile


class OptimizeRequest(BaseModel):
    """Input for the optimiser endpoint."""
    risk_profile: RiskProfile
    max_weight: float = Field(0.40, gt=0.0, le=1.0, description="Per-asset weight cap")


class FrontierPoint(BaseModel):
    """A single point on the efficient frontier."""
    expected_return: float
    volatility: float
    sharpe: float
    weights: dict[str, float]


class OptimizeResponse(BaseModel):
    """Optimiser results including chosen portfolio and frontier."""
    chosen_portfolio: FrontierPoint
    min_variance_portfolio: FrontierPoint
    max_sharpe_portfolio: FrontierPoint
    frontier: list[FrontierPoint]
    risk_free_rate: float
