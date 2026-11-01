import React from 'react';
import {
  TrendingUp,
  Percent,
  Shield,
  HelpCircle,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  BookmarkPlus,
  Check,
} from 'lucide-react';

const formatINR = (val) => {
  if (val === undefined || val === null) return '—';
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
};

export const KeyNumbers = ({
  portfolioExpectedReturn,
  portfolioVolatility,
  sharpeRatio,
  monthlySip,
  years,
  goalAmount,
  fixedReturnEstimate,
  percentiles = [],
  riskProfile,
  onSavePlan,
  isSaving,
  savedPlanId,
}) => {
  const totalInvested = monthlySip * years * 12;

  const p10 = percentiles.find((p) => p.percentile === 10)?.corpus;
  const p50 = percentiles.find((p) => p.percentile === 50)?.corpus;
  const p90 = percentiles.find((p) => p.percentile === 90)?.corpus;

  const returnPct = (portfolioExpectedReturn * 100).toFixed(2);
  const volPct = (portfolioVolatility * 100).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 4 Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Total Invested</span>
            <Sparkles size={16} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
            {formatINR(totalInvested)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            ₹{monthlySip.toLocaleString('en-IN')}/mo × {years * 12} installments
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Expected Annual Return</span>
            <TrendingUp size={16} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
            {returnPct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Markowitz E(R) annualised
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Annualized Volatility (σ)</span>
            <Shield size={16} color="#fb7185" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fb7185' }}>
            {volPct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Portfolio standard deviation
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Sharpe Ratio</span>
            <Percent size={16} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
            {sharpeRatio !== undefined ? Number(sharpeRatio).toFixed(2) : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Rf = 6.50% (Risk-free benchmark)
          </div>
        </div>
      </div>

      {/* Comparison: Monte Carlo vs Single-Point Estimate */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-purple)',
            }}>
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Single-Point vs Monte Carlo Range</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Traditional calculators assume a fixed return, ignoring volatility drag and sequence of returns risk
              </p>
            </div>
          </div>

          {/* Save plan button */}
          <div>
            {savedPlanId ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}>
                <Check size={16} />
                <span>Plan Saved to MongoDB ({savedPlanId.slice(-6)})</span>
              </div>
            ) : (
              <button
                onClick={onSavePlan}
                disabled={isSaving}
                className="btn-primary"
                style={{ fontSize: '0.85rem', padding: '9px 18px' }}
              >
                <BookmarkPlus size={16} />
                <span>{isSaving ? 'Saving Plan...' : 'Save Plan to Database'}</span>
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem',
            textAlign: 'left',
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <th style={{ padding: '12px 16px' }}>Estimation Method</th>
                <th style={{ padding: '12px 16px' }}>Corpus Outcome</th>
                <th style={{ padding: '12px 16px' }}>Net Wealth Gain</th>
                <th style={{ padding: '12px 16px' }}>Market Scenario</th>
              </tr>
            </thead>
            <tbody>
              {/* Single-point estimate */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255, 255, 255, 0.01)' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Fixed Return (Traditional SIP)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assumes steady {returnPct}% every single year</div>
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                  {formatINR(fixedReturnEstimate)}
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  +{formatINR(fixedReturnEstimate - totalInvested)}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Linear compound assumption (ignores downturns)
                </td>
              </tr>

              {/* 90th percentile */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#10b981' }}>Monte Carlo 90th Percentile</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top 10% of 1,000 simulations</div>
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#10b981' }}>
                  {formatINR(p90)}
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                  +{formatINR(p90 - totalInvested)}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Prolonged bull market & strong Indian GDP run
                </td>
              </tr>

              {/* 50th percentile (Median) */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(245, 158, 11, 0.05)' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Monte Carlo 50th Percentile (Median)</span>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>MOST REALISTIC</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accounts for covariance & monthly random walks</div>
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#f59e0b', fontSize: '1.05rem' }}>
                  {formatINR(p50)}
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', color: '#f59e0b', fontWeight: 600 }}>
                  +{formatINR(p50 - totalInvested)}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Normal business cycles, rate shifts & interim corrections
                </td>
              </tr>

              {/* 10th percentile */}
              <tr>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#f43f5e' }}>Monte Carlo 10th Percentile</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bottom 10% of simulated outcomes</div>
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f43f5e' }}>
                  {formatINR(p10)}
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', color: '#f43f5e' }}>
                  +{formatINR(p10 - totalInvested)}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Stagflation, extended bear phase or adverse timing
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
