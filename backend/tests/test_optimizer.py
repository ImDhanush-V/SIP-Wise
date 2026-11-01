"""Tests for the Markowitz optimiser."""

import numpy as np
import pytest

from app.models.risk import RiskProfile
from app.services.optimizer import optimise


@pytest.fixture
def market_data():
    """Realistic annualised returns and covariance for 6 asset classes."""
    mean_returns = np.array([0.12, 0.15, 0.18, 0.07, 0.09, 0.11])
    # Build a valid positive-definite covariance matrix
    vols = np.array([0.15, 0.20, 0.25, 0.04, 0.12, 0.13])
    corr = np.array([
        [1.00, 0.85, 0.75, 0.10, 0.15, 0.70],
        [0.85, 1.00, 0.80, 0.05, 0.10, 0.65],
        [0.75, 0.80, 1.00, 0.00, 0.05, 0.55],
        [0.10, 0.05, 0.00, 1.00, 0.20, 0.30],
        [0.15, 0.10, 0.05, 0.20, 1.00, 0.25],
        [0.70, 0.65, 0.55, 0.30, 0.25, 1.00],
    ])
    cov = np.outer(vols, vols) * corr
    categories = ["Large Cap", "Mid Cap", "Small Cap", "Debt", "Gold", "Hybrid"]
    return mean_returns, cov, categories


class TestOptimizerWeights:
    """Verify that optimiser output satisfies core constraints."""

    def test_weights_sum_to_one(self, market_data):
        """All portfolio weights must sum to 1."""
        mean_ret, cov, cats = market_data
        result = optimise(mean_ret, cov, cats, RiskProfile.MODERATE)
        w = list(result.chosen_portfolio.weights.values())
        assert abs(sum(w) - 1.0) < 1e-4, f"Weights sum = {sum(w)}"

    def test_no_negative_weights(self, market_data):
        """No short selling — all weights >= 0."""
        mean_ret, cov, cats = market_data
        for profile in RiskProfile:
            result = optimise(mean_ret, cov, cats, profile)
            for cat, w in result.chosen_portfolio.weights.items():
                assert w >= -1e-6, f"{profile}: {cat} weight = {w} is negative"

    def test_max_weight_cap_respected(self, market_data):
        """Each weight must be <= max_weight."""
        mean_ret, cov, cats = market_data
        max_wt = 0.30
        result = optimise(mean_ret, cov, cats, RiskProfile.AGGRESSIVE, max_weight=max_wt)
        for cat, w in result.chosen_portfolio.weights.items():
            assert w <= max_wt + 1e-4, f"{cat} weight {w} exceeds cap {max_wt}"

    def test_frontier_is_monotonic_in_return(self, market_data):
        """Frontier points should have non-decreasing expected returns."""
        mean_ret, cov, cats = market_data
        result = optimise(mean_ret, cov, cats, RiskProfile.MODERATE)
        returns = [pt.expected_return for pt in result.frontier]
        for i in range(1, len(returns)):
            assert returns[i] >= returns[i - 1] - 1e-6

    def test_min_var_has_lower_vol_than_max_sharpe(self, market_data):
        """The min-variance portfolio should not be riskier than max-Sharpe."""
        mean_ret, cov, cats = market_data
        result = optimise(mean_ret, cov, cats, RiskProfile.MODERATE)
        assert result.min_variance_portfolio.volatility <= result.max_sharpe_portfolio.volatility + 1e-4

    def test_aggressive_has_higher_return_than_conservative(self, market_data):
        """Aggressive target return should exceed conservative."""
        mean_ret, cov, cats = market_data
        cons = optimise(mean_ret, cov, cats, RiskProfile.CONSERVATIVE)
        aggr = optimise(mean_ret, cov, cats, RiskProfile.AGGRESSIVE)
        assert aggr.chosen_portfolio.expected_return >= cons.chosen_portfolio.expected_return - 1e-4

    def test_all_frontier_weights_sum_to_one(self, market_data):
        """Every point on the efficient frontier must have weights summing to 1."""
        mean_ret, cov, cats = market_data
        result = optimise(mean_ret, cov, cats, RiskProfile.MODERATE)
        for pt in result.frontier:
            w_sum = sum(pt.weights.values())
            assert abs(w_sum - 1.0) < 1e-4, f"Frontier point weights sum = {w_sum}"
