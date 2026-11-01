"""Simulation endpoint."""

import numpy as np
from fastapi import APIRouter, HTTPException

from app.database import get_db, is_db_available
from app.models.simulation import SimulateRequest, SimulateResponse, PercentileOutcome
from app.services.fund_data import compute_monthly_returns, compute_statistics, get_nav_dataframe
from app.services.optimizer import optimise
from app.services.simulator import simulate_sip

router = APIRouter(tags=["simulate"])


@router.post("/simulate", response_model=SimulateResponse)
async def post_simulate(req: SimulateRequest) -> SimulateResponse:
    """Run Monte Carlo simulation for the user's SIP plan."""
    db = get_db() if is_db_available() else None

    nav_df = await get_nav_dataframe(db)
    returns_df = compute_monthly_returns(nav_df)

    if returns_df.empty or len(returns_df) < 6:
        raise HTTPException(status_code=500, detail="Insufficient NAV data.")

    mean_annual, cov_annual, categories = compute_statistics(returns_df)

    # Get optimal weights for this risk profile
    opt_result = optimise(
        mean_returns=mean_annual,
        cov_matrix=cov_annual,
        categories=categories,
        risk_profile=req.risk_profile,
        max_weight=req.max_weight,
    )

    weights_arr = np.array([opt_result.chosen_portfolio.weights[c] for c in categories])

    # Monthly stats (divide annual back to monthly)
    mean_monthly = mean_annual / 12
    cov_monthly = cov_annual / 12

    sim_result = simulate_sip(
        monthly_sip=req.monthly_sip,
        months=req.years * 12,
        weights=weights_arr,
        mean_monthly=mean_monthly,
        cov_monthly=cov_monthly,
        goal_amount=req.goal_amount,
        num_simulations=req.num_simulations,
    )

    return SimulateResponse(
        goal_probability=sim_result["goal_probability"],
        percentiles=[PercentileOutcome(**p) for p in sim_result["percentiles"]],
        fixed_return_estimate=sim_result["fixed_return_estimate"],
        fan_chart=sim_result["fan_chart"],
        portfolio_expected_return=sim_result["portfolio_expected_return"],
        portfolio_volatility=sim_result["portfolio_volatility"],
        weights=opt_result.chosen_portfolio.weights,
    )
