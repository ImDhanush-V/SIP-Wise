import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const CATEGORY_COLORS = {
  'Large Cap': '#3b82f6',
  'Mid Cap': '#8b5cf6',
  'Small Cap': '#ec4899',
  'Debt': '#10b981',
  'Gold': '#f59e0b',
  'Hybrid': '#06b6d4',
};

const CustomTooltip = ({ active, payload, monthlySip }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const sipAllocation = monthlySip ? (monthlySip * (data.value / 100)) : null;

    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '12px 16px',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: data.fill }} />
          <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>{data.name}</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Weight: <strong style={{ color: '#f8fafc' }}>{data.value.toFixed(1)}%</strong>
        </div>
        {sipAllocation !== null && (
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
            Monthly SIP: <strong style={{ color: 'var(--accent-emerald)' }}>₹{Math.round(sipAllocation).toLocaleString('en-IN')}</strong>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const AllocationDonut = ({ weights, monthlySip }) => {
  if (!weights) return null;

  const data = Object.entries(weights)
    .map(([cat, weight]) => ({
      name: cat,
      value: Math.round(weight * 1000) / 10, // percentage e.g. 25.5
      fill: CATEGORY_COLORS[cat] || '#64748b',
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <PieIcon size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Optimal Asset Allocation</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Markowitz mean-variance weighted across Indian fund categories
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
        <div style={{ height: '240px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip monthlySip={monthlySip} />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Categories
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {data.length}
            </div>
          </div>
        </div>

        {/* Legend table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.map((item) => (
            <div
              key={item.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.fill }} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {monthlySip && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    ₹{Math.round(monthlySip * (item.value / 100)).toLocaleString('en-IN')}
                  </span>
                )}
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', minWidth: '45px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  {item.value.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
