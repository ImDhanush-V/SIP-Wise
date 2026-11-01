import React from 'react';
import { Target, Award, AlertCircle } from 'lucide-react';

export const GoalGauge = ({ probability = 0, goalAmount, years, monthlySip }) => {
  const pct = Math.round(probability * 100);
  
  // Color determination
  let color = '#10b981'; // Green
  let status = 'High Likelihood';
  let statusBadge = 'badge-moderate';
  let message = 'Your SIP plan has a strong probability of meeting or exceeding your target corpus under realistic market conditions.';

  if (pct < 45) {
    color = '#f43f5e'; // Red
    status = 'Challenging Target';
    statusBadge = 'badge-aggressive';
    message = 'Market volatility may prevent achieving this target. Consider increasing your monthly SIP or extending your investment horizon.';
  } else if (pct < 70) {
    color = '#f59e0b'; // Amber
    status = 'Moderate Probability';
    statusBadge = 'badge-conservative';
    message = 'You have a fair chance of reaching the goal. A modest 10-15% increase in your monthly SIP would significantly boost certainty.';
  }

  // SVG Gauge calculations
  const radius = 70;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Semi-circle gauge (180 deg)
  const strokeDashoffset = circumference - (pct / 100) * (circumference / 2);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-emerald)',
          }}>
            <Target size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Goal Achievement Probability</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Out of 1,000+ stochastic return simulations
            </p>
          </div>
        </div>
        <span className={`badge ${statusBadge}`}>
          {status}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px 0', position: 'relative' }}>
        <svg height="170" width="220" viewBox="0 0 200 130">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          {/* Background track arc */}
          <path
            d="M 25 110 A 75 75 0 0 1 175 110"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 25 110 A 75 75 0 0 1 175 110"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={235.6}
            strokeDashoffset={235.6 * (1 - pct / 100)}
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
              filter: `drop-shadow(0 0 6px ${color}66)`,
            }}
          />
        </svg>

        <div style={{
          position: 'absolute',
          bottom: '15px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: color,
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}>
            {pct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
            Success Rate
          </div>
        </div>
      </div>

      <div style={{
        padding: '12px 14px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
      }}>
        {message}
      </div>
    </div>
  );
};
