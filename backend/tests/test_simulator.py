"""Tests for the Monte Carlo SIP simulator."""

import numpy as np
import pytest

from app.services.simulator import simulate_sip


@pytest.fixture
def sim_inputs():
    """Standard test inputs for the simulator."""
    mean_monthly = np.array([0.01, 0.012, 0.015, 0.005, 0.007, 0.009])
    vols = np.array([0.04, 0.06, 0.08, 0.01, 0.03, 0.035])
    corr = np.eye(6)
    cov_monthly = np.outer(vols, vols) * corr
    weights = np.array([0.20, 0.15, 0.15, 0.25, 0.10, 0.15])
    return {
        "monthly_sip": 10000,
        "months": 120,  # 10 years
        "weights": weights,
        "mean_monthly": mean_monthly,
        "cov_monthly": cov_monthly,
        "goal_amount": 2_000_000,
        "num_simulations": 500,
    }


class TestSimulator:
    """Tests for simulate_sip."""

    def test_reproducible_with_fixed_seed(self, sim_inputs):
        """Same seed must give identical results."""
        r1 = simulate_sip(**sim_inputs, seed=42)
        r2 = simulate_sip(**sim_inputs, seed=42)
        assert r1["goal_probability"] == r2["goal_probability"]
        assert r1["percentiles"] == r2["percentiles"]

    def test_goal_probability_between_0_and_1(self, sim_inputs):
        """Goal probability must be a valid probability."""
        result = simulate_sip(**sim_inputs, seed=123)
        assert 0.0 <= result["goal_probability"] <= 1.0

    def test_percentiles_are_ordered(self, sim_inputs):
        """Percentile corpus values must be non-decreasing."""
        result = simulate_sip(**sim_inputs, seed=7)
        values = [p["corpus"] for p in result["percentiles"]]
        for i in range(1, len(values)):
            assert values[i] >= values[i - 1]

    def test_fan_chart_has_data(self, sim_inputs):
        """Fan chart should have multiple data points."""
        result = simulate_sip(**sim_inputs, seed=99)
        assert len(result["fan_chart"]) >= 2

    def test_fan_chart_starts_at_zero(self, sim_inputs):
        """First fan chart month should be 0 with corpus near 0."""
        result = simulate_sip(**sim_inputs, seed=99)
        assert result["fan_chart"][0]["month"] == 0

    def test_fixed_return_estimate_positive(self, sim_inputs):
        """Fixed-return estimate should be positive with positive returns."""
        result = simulate_sip(**sim_inputs, seed=42)
        assert result["fixed_return_estimate"] > 0

    def test_different_seeds_give_different_results(self, sim_inputs):
        """Different seeds should (almost certainly) give different results."""
        r1 = simulate_sip(**sim_inputs, seed=1)
        r2 = simulate_sip(**sim_inputs, seed=9999)
        # They could theoretically be the same, but it's astronomically unlikely
        assert r1["goal_probability"] != r2["goal_probability"] or \
               r1["percentiles"] != r2["percentiles"]

    def test_zero_goal_gives_probability_one(self, sim_inputs):
        """If goal is 0, probability should be 1.0 (all paths exceed 0)."""
        sim_inputs["goal_amount"] = 0
        result = simulate_sip(**sim_inputs, seed=42)
        assert result["goal_probability"] == 1.0

    def test_huge_goal_gives_low_probability(self, sim_inputs):
        """An astronomically high goal should have near-zero probability."""
        sim_inputs["goal_amount"] = 1e15
        result = simulate_sip(**sim_inputs, seed=42)
        assert result["goal_probability"] < 0.1
