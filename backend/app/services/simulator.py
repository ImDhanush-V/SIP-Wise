"""Monte Carlo SIP simulator using NumPy."""

from __future__ import annotations

import numpy as np

from app.config import settings


def simulate_sip(
    monthly_sip: float,
    months: int,
    weights: np.ndarray,
    mean_monthly: np.ndarray,
    cov_monthly: np.ndarray,
    goal_amount: float,
    num_simulations: int | None = None,
    seed: int | None = None,
) -> dict:
    """Run Monte Carlo simulation of SIP contributions.

    Parameters
    ----------
    monthly_sip : float
        Monthly investment amount in INR.
    months : int
        Total investment horizon in months.
    weights : np.ndarray
        Portfolio weights (sum to 1).
    mean_monthly : np.ndarray
        Expected monthly returns per asset.
    cov_monthly : np.ndarray
        Monthly covariance matrix of returns.
    goal_amount : float
        Target corpus the user wants to reach.
    num_simulations : int, optional
        Number of simulation paths (defaults to config value).
    seed : int, optional
        Random seed for reproducibility.

    Returns
    -------
    dict with keys:
        goal_probability, percentiles, fan_chart, fixed_return_estimate,
        portfolio_expected_return (monthly), portfolio_volatility (monthly).
    """
    if num_simulations is None:
        num_simulations = settings.monte_carlo_simulations

    rng = np.random.default_rng(seed)

    # Portfolio-level monthly stats
    port_mean_monthly = float(np.dot(weights, mean_monthly))
    port_vol_monthly = float(np.sqrt(weights @ cov_monthly @ weights))

    # Generate correlated monthly returns for all assets
    # Shape: (num_simulations, months, n_assets)
    all_returns = rng.multivariate_normal(mean_monthly, cov_monthly, size=(num_simulations, months))

    # Portfolio returns: weighted sum across assets → (num_simulations, months)
    port_returns = np.tensordot(all_returns, weights, axes=(2, 0))

    # Build corpus paths month by month (SIP at start of each month)
    # corpus[sim, month] = accumulated value after that month
    corpus = np.zeros((num_simulations, months + 1))
    for m in range(months):
        corpus[:, m + 1] = (corpus[:, m] + monthly_sip) * (1 + port_returns[:, m])

    final_corpus = corpus[:, -1]

    # Goal probability
    goal_prob = float(np.mean(final_corpus >= goal_amount))

    # Percentiles of final corpus
    pcts = [10, 25, 50, 75, 90]
    percentile_values = np.percentile(final_corpus, pcts)
    percentiles = [
        {"percentile": p, "corpus": round(float(v), 2)}
        for p, v in zip(pcts, percentile_values)
    ]

    # Fan chart data (percentiles at each month)
    fan_chart: list[dict] = []
    for m in range(0, months + 1, max(1, months // 60)):
        month_vals = corpus[:, m]
        fan_chart.append({
            "month": int(m),
            "p10": round(float(np.percentile(month_vals, 10)), 2),
            "p25": round(float(np.percentile(month_vals, 25)), 2),
            "p50": round(float(np.percentile(month_vals, 50)), 2),
            "p75": round(float(np.percentile(month_vals, 75)), 2),
            "p90": round(float(np.percentile(month_vals, 90)), 2),
        })
    # Ensure the last month is included
    if fan_chart[-1]["month"] != months:
        month_vals = corpus[:, months]
        fan_chart.append({
            "month": int(months),
            "p10": round(float(np.percentile(month_vals, 10)), 2),
            "p25": round(float(np.percentile(month_vals, 25)), 2),
            "p50": round(float(np.percentile(month_vals, 50)), 2),
            "p75": round(float(np.percentile(month_vals, 75)), 2),
            "p90": round(float(np.percentile(month_vals, 90)), 2),
        })

    # Fixed-return (single-point) estimate for comparison
    # Uses the portfolio's annualised expected return
    port_mean_annual = port_mean_monthly * 12
    monthly_rate = port_mean_annual / 12
    if abs(monthly_rate) < 1e-12:
        fixed_estimate = monthly_sip * months
    else:
        # Future value of annuity: SIP * [((1+r)^n - 1) / r] * (1+r)
        fixed_estimate = monthly_sip * (((1 + monthly_rate) ** months - 1) / monthly_rate) * (1 + monthly_rate)

    return {
        "goal_probability": round(goal_prob, 4),
        "percentiles": percentiles,
        "fan_chart": fan_chart,
        "fixed_return_estimate": round(float(fixed_estimate), 2),
        "portfolio_expected_return": round(port_mean_monthly * 12, 6),
        "portfolio_volatility": round(port_vol_monthly * np.sqrt(12), 6),
    }
