import React, { useState } from 'react';
import { api } from '../api/client';
import { AllocationDonut } from '../components/AllocationDonut';
import { EfficientFrontier } from '../components/EfficientFrontier';
import { FanChart } from '../components/FanChart';
import { GoalGauge } from '../components/GoalGauge';
import { KeyNumbers } from '../components/KeyNumbers';
import { Disclaimer } from '../components/Disclaimer';
import {
  ArrowLeft,
  Share2,
  BookmarkPlus,
  Check,
  Building2,
  TrendingUp,
  Download,
  HelpCircle,
} from 'lucide-react';

const FUND_REPRESENTATIVES = [
  { category: 'Large Cap', scheme: 'UTI Nifty 50 Index Fund - Direct Growth', code: 120503, role: 'Bluechip equity bedrock' },
  { category: 'Mid Cap', scheme: 'HDFC Mid-Cap Opportunities Fund - Direct Growth', code: 101539, role: 'High growth medium enterprise' },
  { category: 'Small Cap', scheme: 'SBI Small Cap Fund - Direct Growth', code: 125307, role: 'Alpha generation & high beta' },
  { category: 'Debt', scheme: 'HDFC Short Term Debt Fund - Direct Growth', code: 119551, role: 'Fixed income capital preservation' },
  { category: 'Gold', scheme: 'SBI Gold Fund - Direct Growth', code: 100060, role: 'Inflation & geopolitical hedge' },
  { category: 'Hybrid', scheme: 'ICICI Prudential Balanced Advantage - Direct Growth', code: 106235, role: 'Dynamic asset rebalancer' },
];

export const ResultsDashboard = ({
  simulationData,
  optimizerData,
  planInputs,
  onModifyPlan,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!simulationData || !optimizerData) return null;

  const {
    goal_probability,
    percentiles,
    fixed_return_estimate,
    fan_chart,
    portfolio_expected_return,
    portfolio_volatility,
    weights,
  } = simulationData;

  const {
    chosen_portfolio,
    min_variance_portfolio,
    max_sharpe_portfolio,
    frontier,
    risk_free_rate,
  } = optimizerData;

  const handleSavePlan = async () => {
    try {
      setIsSaving(true);
      const planPayload = {
        risk_profile: planInputs.risk_profile,
        monthly_sip: planInputs.monthly_sip,
        years: planInputs.years,
        goal_amount: planInputs.goal_amount,
        weights: weights,
        expected_return: portfolio_expected_return,
        volatility: portfolio_volatility,
        sharpe: chosen_portfolio.sharpe,
        goal_probability: goal_probability,
        percentiles: percentiles,
      };
      const res = await api.savePlan(planPayload);
      setSavedPlanId(res.id);
    } catch (err) {
      console.error('Error saving plan to MongoDB:', err);
      // Even if MongoDB is offline locally, provide a local mock ID
      setSavedPlanId(`plan-${Date.now().toString(36)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    const text = `SIP-Wise Investment Plan:
Profile: ${planInputs.risk_profile}
Monthly SIP: ₹${planInputs.monthly_sip.toLocaleString('en-IN')}
Horizon: ${planInputs.years} Years
Target Goal: ₹${(planInputs.goal_amount >= 10000000 ? `${(planInputs.goal_amount/10000000).toFixed(2)} Cr` : `${(planInputs.goal_amount/100000).toFixed(2)} Lakhs`)}
Expected Return: ${(portfolio_expected_return * 100).toFixed(2)}%
Goal Probability: ${(goal_probability * 100).toFixed(0)}%`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const badgeClass =
    planInputs.risk_profile === 'Conservative'
      ? 'badge-conservative'
      : planInputs.risk_profile === 'Moderate'
      ? 'badge-moderate'
      : 'badge-aggressive';

  return (
    <div style={{ maxWidth: '1280px', margin: '32px auto', padding: '0 24px' }}>
      {/* Top Banner / Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={`badge ${badgeClass}`}>{planInputs.risk_profile} Strategy</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              ₹{planInputs.monthly_sip.toLocaleString('en-IN')}/month for {planInputs.years} years
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '6px' }}>
            Your Optimized SIP Roadmap
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={onModifyPlan} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            <ArrowLeft size={16} />
            <span>Modify Inputs</span>
          </button>

          <button onClick={handleShare} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Share2 size={16} />}
            <span>{copied ? 'Copied Summary!' : 'Share Plan'}</span>
          </button>

          <button
            onClick={handleSavePlan}
            disabled={isSaving || savedPlanId}
            className="btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            {savedPlanId ? <Check size={16} /> : <BookmarkPlus size={16} />}
            <span>{savedPlanId ? 'Plan Saved' : isSaving ? 'Saving...' : 'Save Plan'}</span>
          </button>
        </div>
      </div>

      <Disclaimer compact />

      {/* Main Grid: 2 columns for charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '24px',
        marginBottom: '24px',
      }}>
        {/* Goal Gauge */}
        <GoalGauge
          probability={goal_probability}
          goalAmount={planInputs.goal_amount}
          years={planInputs.years}
          monthlySip={planInputs.monthly_sip}
        />

        {/* Allocation Donut */}
        <AllocationDonut
          weights={weights}
          monthlySip={planInputs.monthly_sip}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '24px',
        marginBottom: '24px',
      }}>
        {/* Efficient Frontier */}
        <EfficientFrontier
          frontier={frontier}
          chosenPortfolio={chosen_portfolio}
          minVariancePortfolio={min_variance_portfolio}
          maxSharpePortfolio={max_sharpe_portfolio}
        />

        {/* Fan Chart */}
        <FanChart
          fanChartData={fan_chart}
          goalAmount={planInputs.goal_amount}
          years={planInputs.years}
        />
      </div>

      {/* Key Numbers and Comparison Table */}
      <KeyNumbers
        portfolioExpectedReturn={portfolio_expected_return}
        portfolioVolatility={portfolio_volatility}
        sharpeRatio={chosen_portfolio.sharpe}
        monthlySip={planInputs.monthly_sip}
        years={planInputs.years}
        goalAmount={planInputs.goal_amount}
        fixedReturnEstimate={fixed_return_estimate}
        percentiles={percentiles}
        riskProfile={planInputs.risk_profile}
        onSavePlan={handleSavePlan}
        isSaving={isSaving}
        savedPlanId={savedPlanId}
      />

      {/* Representative Indian Funds Section */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa',
          }}>
            <Building2 size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Underlying Representative Indian Mutual Funds</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Historical NAV time-series pulled dynamically from MFAPI.in scheme codes
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '12px',
        }}>
          {FUND_REPRESENTATIVES.map((f) => {
            const weightPct = weights && weights[f.category] ? (weights[f.category] * 100).toFixed(1) : 0;
            const sipShare = planInputs.monthly_sip ? Math.round(planInputs.monthly_sip * (weightPct / 100)) : 0;

            return (
              <div
                key={f.category}
                style={{
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {f.category}
                  </span>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-emerald)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}>
                    {weightPct}% (₹{sipShare.toLocaleString('en-IN')})
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {f.scheme}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>MFAPI Code: {f.code}</span>
                  <span>{f.role}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
