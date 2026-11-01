import React, { useState } from 'react';
import { IndianRupee, Calendar, Target, Sliders, ArrowRight, ArrowLeft, Shield, Sparkles } from 'lucide-react';

export const PlanInput = ({ riskProfileData, onBack, onSubmit, loading }) => {
  const [monthlySip, setMonthlySip] = useState(15000);
  const [years, setYears] = useState(10);
  const [goalAmount, setGoalAmount] = useState(5000000); // 50 Lakhs
  const [maxWeight, setMaxWeight] = useState(0.40);
  const [activeProfile, setActiveProfile] = useState(riskProfileData?.profile || 'Moderate');

  const sipPresets = [5000, 10000, 20000, 50000, 100000];
  const goalPresets = [
    { label: '₹25 Lakhs', val: 2500000 },
    { label: '₹50 Lakhs', val: 5000000 },
    { label: '₹1 Crore', val: 10000000 },
    { label: '₹2 Crores', val: 20000000 },
  ];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      monthly_sip: Number(monthlySip),
      years: Number(years),
      goal_amount: Number(goalAmount),
      risk_profile: activeProfile,
      max_weight: Number(maxWeight),
      num_simulations: 1000,
    });
  };

  const totalInvested = monthlySip * years * 12;

  return (
    <div style={{ maxWidth: '780px', margin: '40px auto', padding: '0 16px' }}>
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '9999px',
          color: 'var(--accent-emerald)',
          fontSize: '0.75rem',
          fontWeight: 600,
          marginBottom: '12px',
        }}>
          <Target size={14} />
          <span>Step 2: Financial Parameters</span>
        </div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Define Your SIP Target & Horizon
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px' }}>
          We will combine your financial inputs with MF historical covariance to compute your optimal portfolio.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="glass-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Risk profile bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={18} color="var(--accent-emerald)" />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Selected Risk Profile:</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['Conservative', 'Moderate', 'Aggressive'].map((p) => {
              const active = activeProfile === p;
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => setActiveProfile(p)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: active ? 700 : 500,
                    background: active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${active ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                    color: active ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Monthly SIP Input */}
        <div className="form-group">
          <label className="form-label">
            <span>Monthly SIP Amount (₹)</span>
            <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
              ₹{Number(monthlySip).toLocaleString('en-IN')} / month
            </span>
          </label>
          <div className="form-input-wrap">
            <span className="form-input-prefix">₹</span>
            <input
              type="number"
              min="500"
              step="500"
              value={monthlySip}
              onChange={(e) => setMonthlySip(e.target.value)}
              className="form-input form-input-with-prefix"
              required
            />
          </div>
          {/* Quick presets */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            {sipPresets.map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setMonthlySip(amt)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                ₹{(amt / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        {/* Investment Horizon Slider & Input */}
        <div className="form-group">
          <label className="form-label">
            <span>Investment Horizon (Years)</span>
            <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {years} Years ({years * 12} Monthly SIPs)
            </span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              style={{
                flex: 1,
                accentColor: 'var(--accent-cyan)',
                height: '6px',
                cursor: 'pointer',
              }}
            />
            <div style={{
              width: '60px',
              padding: '8px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
            }}>
              {years} yr
            </div>
          </div>
        </div>

        {/* Target Goal Amount */}
        <div className="form-group">
          <label className="form-label">
            <span>Target Goal Corpus (₹)</span>
            <span style={{ color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
              ₹{(goalAmount >= 10000000 ? `${(goalAmount / 10000000).toFixed(2)} Cr` : `${(goalAmount / 100000).toFixed(2)} Lakhs`)}
            </span>
          </label>
          <div className="form-input-wrap">
            <span className="form-input-prefix">₹</span>
            <input
              type="number"
              min="50000"
              step="50000"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="form-input form-input-with-prefix"
              required
            />
          </div>
          {/* Goal presets */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            {goalPresets.map((g) => (
              <button
                type="button"
                key={g.label}
                onClick={() => setGoalAmount(g.val)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Max Weight Cap */}
        <div className="form-group">
          <label className="form-label">
            <span>Asset Category Weight Cap</span>
            <span style={{ color: 'var(--text-muted)' }}>
              {(maxWeight * 100).toFixed(0)}% per category
            </span>
          </label>
          <select
            value={maxWeight}
            onChange={(e) => setMaxWeight(parseFloat(e.target.value))}
            className="form-input"
            style={{ cursor: 'pointer' }}
          >
            <option value={0.30} style={{ background: '#0f172a' }}>30% Max Cap (Highly Diversified)</option>
            <option value={0.40} style={{ background: '#0f172a' }}>40% Max Cap (Recommended Default)</option>
            <option value={0.60} style={{ background: '#0f172a' }}>60% Max Cap (Flexible Concentration)</option>
            <option value={1.00} style={{ background: '#0f172a' }}>100% Unconstrained (No Cap)</option>
          </select>
        </div>

        {/* Summary snippet */}
        <div style={{
          padding: '14px 18px',
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>Total Planned Outlay over {years} Years:</span>
          <span style={{ fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
            ₹{totalInvested.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary"
          >
            <ArrowLeft size={16} />
            <span>Retake Questionnaire</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            <span>{loading ? 'Optimizing & Simulating...' : 'Run Markowitz & Monte Carlo'}</span>
            <Sparkles size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
