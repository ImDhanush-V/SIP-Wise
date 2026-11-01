"""Pydantic models for Monte Carlo simulation."""

from pydantic import BaseModel, Field

from app.models.risk import RiskProfile


class SimulateRequest(BaseModel):
    """Input for the simulation endpoint."""
    monthly_sip: float = Field(..., gt=0, description="Monthly SIP amount in INR")
    years: int = Field(..., gt=0, le=40, description="Investment horizon in years")
    goal_amount: float = Field(..., gt=0, description="Target corpus in INR")
    risk_profile: RiskProfile
    max_weight: float = Field(0.40, gt=0.0, le=1.0)
    num_simulations: int | None = Field(None, ge=100, le=100000)


class PercentileOutcome(BaseModel):
    """Final corpus at a percentile."""
    percentile: int
    corpus: float


class SimulateResponse(BaseModel):
    """Monte Carlo simulation results."""
    goal_probability: float = Field(..., ge=0.0, le=1.0)
    percentiles: list[PercentileOutcome]
    fixed_return_estimate: float
    fan_chart: list[dict]  # [{month, p10, p25, p50, p75, p90}, ...]
    portfolio_expected_return: float
    portfolio_volatility: float
    weights: dict[str, float]
