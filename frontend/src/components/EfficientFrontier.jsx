import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
} from 'recharts';
import { Crosshair } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const pt = payload[0].payload;
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '12px 16px',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        fontSize: '0.85rem',
      }}>
        <div style={{ fontWeight: 700, color: pt.color || '#f8fafc', marginBottom: '4px' }}>
          {pt.label || 'Frontier Portfolio'}
        </div>
        <div style={{ color: '#94a3b8' }}>
          Expected Return (Ann.): <strong style={{ color: '#f8fafc' }}>{pt.y.toFixed(2)}%</strong>
        </div>
        <div style={{ color: '#94a3b8' }}>
          Volatility / Risk (Ann.): <strong style={{ color: '#f8fafc' }}>{pt.x.toFixed(2)}%</strong>
        </div>
        <div style={{ color: '#94a3b8' }}>
          Sharpe Ratio: <strong style={{ color: 'var(--accent-emerald)' }}>{pt.sharpe.toFixed(2)}</strong>
        </div>
      </div>
    );
  }
  return null;
};

export const EfficientFrontier = ({
  frontier = [],
  chosenPortfolio,
  minVariancePortfolio,
  maxSharpePortfolio,
}) => {
  if (!frontier || frontier.length === 0) return null;

  // Format frontier points: x = vol%, y = return%
  const frontierData = frontier.map((pt, i) => ({
    x: Math.round(pt.volatility * 10000) / 100,
    y: Math.round(pt.expected_return * 10000) / 100,
    sharpe: pt.sharpe,
    label: `Frontier Port #${i + 1}`,
  }));

  const specialPoints = [];

  if (minVariancePortfolio) {
    specialPoints.push({
      x: Math.round(minVariancePortfolio.volatility * 10000) / 100,
      y: Math.round(minVariancePortfolio.expected_return * 10000) / 100,
      sharpe: minVariancePortfolio.sharpe,
      label: 'Minimum Variance Portfolio (Lowest Risk)',
      color: '#06b6d4',
      type: 'min_var',
    });
  }

  if (maxSharpePortfolio) {
    specialPoints.push({
      x: Math.round(maxSharpePortfolio.volatility * 10000) / 100,
      y: Math.round(maxSharpePortfolio.expected_return * 10000) / 100,
      sharpe: maxSharpePortfolio.sharpe,
      label: 'Maximum Sharpe Ratio Portfolio (Optimal Risk-Adjusted)',
      color: '#10b981',
      type: 'max_sharpe',
    });
  }

  if (chosenPortfolio) {
    specialPoints.push({
      x: Math.round(chosenPortfolio.volatility * 10000) / 100,
      y: Math.round(chosenPortfolio.expected_return * 10000) / 100,
      sharpe: chosenPortfolio.sharpe,
      label: 'Your Chosen Portfolio (Mapped to Risk Profile)',
      color: '#f59e0b',
      type: 'chosen',
    });
  }

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
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
            <Crosshair size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Markowitz Efficient Frontier</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Risk vs Return curve calculated via SLSQP quadratic programming
            </p>
          </div>
        </div>

        {/* Legend pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }} />
            <span style={{ color: 'var(--text-muted)' }}>Frontier</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#06b6d4' }} />
            <span style={{ color: '#06b6d4', fontWeight: 600 }}>Min Variance</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ color: '#10b981', fontWeight: 600 }}>Max Sharpe</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>Chosen Portfolio</span>
          </div>
        </div>
      </div>

      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
            <XAxis
              type="number"
              dataKey="x"
              name="Volatility"
              unit="%"
              stroke="var(--text-muted)"
              fontSize={11}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(v) => `${v}%`}
              label={{
                value: 'Annualized Volatility (Risk σ)',
                position: 'insideBottom',
                offset: -10,
                fill: 'var(--text-muted)',
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Expected Return"
              unit="%"
              stroke="var(--text-muted)"
              fontSize={11}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(v) => `${v}%`}
              label={{
                value: 'Annualized Expected Return E(R)',
                angle: -90,
                position: 'insideLeft',
                fill: 'var(--text-muted)',
                fontSize: 11,
                offset: 5,
              }}
            />
            <ZAxis range={[25, 160]} />
            <Tooltip content={<CustomTooltip />} />
            
            {/* The frontier curve dots */}
            <Scatter
              name="Efficient Frontier"
              data={frontierData}
              fill="#64748b"
              line={{ stroke: '#64748b', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              shape="circle"
            />

            {/* Special points */}
            {specialPoints.map((pt) => (
              <Scatter
                key={pt.label}
                name={pt.label}
                data={[pt]}
                fill={pt.color}
                shape="circle"
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
