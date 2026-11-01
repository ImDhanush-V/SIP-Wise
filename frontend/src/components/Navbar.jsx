import React from 'react';
import { TrendingUp, ShieldCheck, Activity } from 'lucide-react';

export const Navbar = ({ currentStep, onReset, serverHealthy }) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(9, 13, 22, 0.8)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '16px 24px',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div 
          onClick={onReset}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          }}>
            <TrendingUp size={22} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                SIP<span style={{ color: 'var(--accent-emerald)' }}>-Wise</span>
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}>
                INDIA MF
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Markowitz Portfolio Optimizer & Monte Carlo SIP Engine
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '6px 12px',
          borderRadius: '9999px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
        }}>
          <span style={{
            color: currentStep === 'risk' ? 'var(--accent-emerald)' : 'var(--text-muted)',
            fontWeight: currentStep === 'risk' ? 700 : 500,
          }}>
            1. Risk Profile
          </span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{
            color: currentStep === 'input' ? 'var(--accent-emerald)' : 'var(--text-muted)',
            fontWeight: currentStep === 'input' ? 700 : 500,
          }}>
            2. Goals & SIP
          </span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{
            color: currentStep === 'results' ? 'var(--accent-emerald)' : 'var(--text-muted)',
            fontWeight: currentStep === 'results' ? 700 : 500,
          }}>
            3. Results Dashboard
          </span>
        </div>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: serverHealthy ? 'var(--accent-emerald)' : 'var(--accent-amber)',
            background: serverHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            padding: '4px 10px',
            borderRadius: '9999px',
            border: `1px solid ${serverHealthy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
          }}>
            <Activity size={12} />
            <span>{serverHealthy ? 'API Connected' : 'Checking API...'}</span>
          </div>
          {currentStep !== 'risk' && (
            <button 
              onClick={onReset}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            >
              New Plan
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
