"""Optimisation endpoint."""

from fastapi import APIRouter, HTTPException

from app.database import get_db, is_db_available
from app.models.portfolio import OptimizeRequest, OptimizeResponse
from app.services.fund_data import compute_monthly_returns, compute_statistics, get_nav_dataframe
from app.services.optimizer import optimise

router = APIRouter(tags=["optimize"])


@router.post("/optimize", response_model=OptimizeResponse)
async def post_optimize(req: OptimizeRequest) -> OptimizeResponse:
    """Compute the optimal portfolio allocation for the given risk profile."""
    db = get_db() if is_db_available() else None

    nav_df = await get_nav_dataframe(db)
    returns_df = compute_monthly_returns(nav_df)

    if returns_df.empty or len(returns_df) < 6:
        raise HTTPException(status_code=500, detail="Insufficient NAV data to compute statistics.")

    mean_annual, cov_annual, categories = compute_statistics(returns_df)

    result = optimise(
        mean_returns=mean_annual,
        cov_matrix=cov_annual,
        categories=categories,
        risk_profile=req.risk_profile,
        max_weight=req.max_weight,
    )
    return result
