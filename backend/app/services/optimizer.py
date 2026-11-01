"""Markowitz mean-variance portfolio optimiser using scipy SLSQP."""

from __future__ import annotations

import numpy as np
from scipy.optimize import minimize

from app.config import settings
from app.models.portfolio import FrontierPoint, OptimizeResponse
from app.models.risk import RiskProfile


# ── Helper functions ──────────────────────────────────────────────────


def _portfolio_return(weights: np.ndarray, mean_returns: np.ndarray) -> float:
    """Annualised expected return of a portfolio."""
    return float(np.dot(weights, mean_returns))


def _portfolio_volatility(weights: np.ndarray, cov_matrix: np.ndarray) -> float:
    """Annualised portfolio standard deviation."""
    return float(np.sqrt(weights @ cov_matrix @ weights))


def _neg_sharpe(
    weights: np.ndarray,
    mean_returns: np.ndarray,
    cov_matrix: np.ndarray,
    rf: float,
) -> float:
    """Negative Sharpe ratio (for minimisation)."""
    ret = _portfolio_return(weights, mean_returns)
    vol = _portfolio_volatility(weights, cov_matrix)
    return -(ret - rf) / vol if vol > 0 else 0.0


def _minimise_volatility(
    mean_returns: np.ndarray,
    cov_matrix: np.ndarray,
    max_weight: float,
    target_return: float | None = None,
) -> np.ndarray:
    """Find the minimum-variance portfolio, optionally at a target return."""
    n = len(mean_returns)
    init = np.ones(n) / n
    bounds = tuple((0.0, max_weight) for _ in range(n))
    constraints: list[dict] = [{"type": "eq", "fun": lambda w: np.sum(w) - 1.0}]
    if target_return is not None:
        constraints.append(
            {"type": "eq", "fun": lambda w, tr=target_return: _portfolio_return(w, mean_returns) - tr}
        )
    result = minimize(
        _portfolio_volatility,
        init,
        args=(cov_matrix,),
        method="SLSQP",
        bounds=bounds,
        constraints=constraints,
        options={"maxiter": 1000, "ftol": 1e-12},
    )
    return result.x


def _make_point(
    weights: np.ndarray,
    mean_returns: np.ndarray,
    cov_matrix: np.ndarray,
    categories: list[str],
    rf: float,
) -> FrontierPoint:
    """Build a FrontierPoint from raw weights."""
    ret = _portfolio_return(weights, mean_returns)
    vol = _portfolio_volatility(weights, cov_matrix)
    sharpe = (ret - rf) / vol if vol > 0 else 0.0
    w_dict = {cat: round(float(w), 6) for cat, w in zip(categories, weights)}
    return FrontierPoint(
        expected_return=round(ret, 6),
        volatility=round(vol, 6),
        sharpe=round(sharpe, 4),
        weights=w_dict,
    )


# ── Risk-profile → target-return mapping ──────────────────────────────


def _target_return_for_profile(
    profile: RiskProfile,
    min_ret: float,
    max_ret: float,
) -> float:
    """Map a risk profile to a target return on the frontier."""
    spread = max_ret - min_ret
    mapping = {
        RiskProfile.CONSERVATIVE: 0.20,
        RiskProfile.MODERATE: 0.50,
        RiskProfile.AGGRESSIVE: 0.80,
    }
    frac = mapping[profile]
    return min_ret + frac * spread


# ── Public API ────────────────────────────────────────────────────────


def optimise(
    mean_returns: np.ndarray,
    cov_matrix: np.ndarray,
    categories: list[str],
    risk_profile: RiskProfile,
    max_weight: float = 0.40,
    rf: float | None = None,
    num_frontier_points: int = 50,
) -> OptimizeResponse:
    """Run the full Markowitz optimisation.

    Returns the min-variance portfolio, max-Sharpe portfolio,
    the efficient frontier, and the portfolio mapped to the user's
    risk profile.
    """
    if rf is None:
        rf = settings.risk_free_rate
    n = len(mean_returns)

    # ── Min-variance portfolio ──
    w_min_var = _minimise_volatility(mean_returns, cov_matrix, max_weight)
    min_var = _make_point(w_min_var, mean_returns, cov_matrix, categories, rf)

    # ── Max-Sharpe portfolio ──
    init = np.ones(n) / n
    bounds = tuple((0.0, max_weight) for _ in range(n))
    constraints = [{"type": "eq", "fun": lambda w: np.sum(w) - 1.0}]
    res_sharpe = minimize(
        _neg_sharpe,
        init,
        args=(mean_returns, cov_matrix, rf),
        method="SLSQP",
        bounds=bounds,
        constraints=constraints,
        options={"maxiter": 1000, "ftol": 1e-12},
    )
    w_max_sharpe = res_sharpe.x
    max_sharpe = _make_point(w_max_sharpe, mean_returns, cov_matrix, categories, rf)

    # ── Efficient frontier ──
    min_ret = _portfolio_return(w_min_var, mean_returns)
    # Find the max achievable return at the weight cap
    max_ret = float(np.max(mean_returns))
    # Clamp max_ret to what is achievable with the weight cap
    w_max_ret = _minimise_volatility(mean_returns, cov_matrix, max_weight, target_return=max_ret)
    achievable_max = _portfolio_return(w_max_ret, mean_returns)
    # If we couldn't hit max_ret exactly, scan downward
    if abs(achievable_max - max_ret) > 0.005:
        achievable_max = max_ret * 0.95

    target_returns = np.linspace(min_ret, achievable_max, num_frontier_points)
    frontier: list[FrontierPoint] = []
    for tr in target_returns:
        try:
            w = _minimise_volatility(mean_returns, cov_matrix, max_weight, target_return=tr)
            pt = _make_point(w, mean_returns, cov_matrix, categories, rf)
            frontier.append(pt)
        except Exception:
            continue

    # ── Chosen portfolio (risk-profile mapped) ──
    chosen_target = _target_return_for_profile(risk_profile, min_ret, achievable_max)
    w_chosen = _minimise_volatility(mean_returns, cov_matrix, max_weight, target_return=chosen_target)
    chosen = _make_point(w_chosen, mean_returns, cov_matrix, categories, rf)

    return OptimizeResponse(
        chosen_portfolio=chosen,
        min_variance_portfolio=min_var,
        max_sharpe_portfolio=max_sharpe,
        frontier=frontier,
        risk_free_rate=rf,
    )
