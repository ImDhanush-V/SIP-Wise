import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
} from 'recharts';
import { Activity } from 'lucide-react';

// Format Indian rupees in Lakhs / Crores
const formatINR = (val) => {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
};

const CustomTooltip = ({ active, payload, label, goalAmount }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const year = (data.month / 12).toFixed(1);

    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '14px 18px',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        fontSize: '0.85rem',
        minWidth: '220px',
      }}>
        <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
          Month {data.month} ({year} Years)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
            <span>90th Percentile (Optimistic):</span>
            <strong>{formatINR(data.p90)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
            <span>75th Percentile:</span>
            <strong>{formatINR(data.p75)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', fontWeight: 700 }}>
            <span>50th Percentile (Median):</span>
            <strong>{formatINR(data.p50)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a78bfa' }}>
            <span>25th Percentile:</span>
            <strong>{formatINR(data.p25)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f43f5e' }}>
            <span>10th Percentile (Conservative):</span>
            <strong>{formatINR(data.p10)}</strong>
          </div>
          {goalAmount && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--border-subtle)' }}>
              <span>Target Goal:</span>
              <strong>{formatINR(goalAmount)}</strong>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const FanChart = ({ fanChartData, goalAmount, years }) => {
  if (!fanChartData || fanChartData.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)',
          }}>
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Monte Carlo SIP Fan Chart</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Simulated corpus trajectories showing 10th, 25th, 50th, 75th & 90th percentiles over time
            </p>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '4px', background: 'rgba(16, 185, 129, 0.3)' }} />
            <span style={{ color: 'var(--text-muted)' }}>10-90th Range</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '4px', background: 'rgba(16, 185, 129, 0.6)' }} />
            <span style={{ color: 'var(--text-muted)' }}>25-75th Range</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', background: '#f59e0b' }} />
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>Median (50th)</span>
          </div>
          {goalAmount && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2px', background: '#ef4444', borderTop: '1px dashed #ef4444' }} />
              <span style={{ color: '#ef4444', fontWeight: 600 }}>Target Goal</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ height: '320px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={fanChartData} margin={{ top: 10, right: 20, bottom: 20, left: 15 }}>
            <defs>
              <linearGradient id="colorP90" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorP75" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
            <XAxis
              dataKey="month"
              stroke="var(--text-muted)"
              fontSize={11}
              tickFormatter={(m) => `Yr ${(m / 12).toFixed(0)}`}
              label={{
                value: 'Investment Timeline',
                position: 'insideBottom',
                offset: -10,
                fill: 'var(--text-muted)',
                fontSize: 11,
              }}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              tickFormatter={formatINR}
              width={70}
            />
            <Tooltip content={<CustomTooltip goalAmount={goalAmount} />} />

            {/* Target Goal line */}
            {goalAmount && (
              <ReferenceLine
                y={goalAmount}
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Goal: ${formatINR(goalAmount)}`,
                  fill: '#ef4444',
                  fontSize: 11,
                  position: 'top',
                }}
              />
            )}

            {/* Outer envelope: p90 down to p10 */}
            <Area
              type="monotone"
              dataKey="p90"
              stroke="rgba(16, 185, 129, 0.4)"
              strokeWidth={1}
              fill="url(#colorP90)"
              name="90th Percentile"
            />
            <Area
              type="monotone"
              dataKey="p75"
              stroke="rgba(6, 182, 212, 0.5)"
              strokeWidth={1}
              fill="url(#colorP75)"
              name="75th Percentile"
            />
            
            {/* Median line */}
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={false}
              name="50th Percentile (Median)"
            />

            {/* Lower bound lines */}
            <Area
              type="monotone"
              dataKey="p25"
              stroke="rgba(139, 92, 246, 0.5)"
              strokeWidth={1}
              fill="transparent"
              name="25th Percentile"
            />
            <Area
              type="monotone"
              dataKey="p10"
              stroke="rgba(244, 63, 94, 0.5)"
              strokeWidth={1}
              fill="transparent"
              name="10th Percentile"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
