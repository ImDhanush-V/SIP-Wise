import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const Disclaimer = ({ compact = false }) => {
  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 16px',
        background: 'rgba(245, 158, 11, 0.05)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        borderRadius: 'var(--radius-md)',
        color: '#fbbf24',
        fontSize: '0.8rem',
        textAlign: 'center',
        margin: '24px 0',
      }}>
        <AlertTriangle size={16} flexShrink={0} />
        <span>
          <strong>Disclaimer:</strong> Educational tool. Not financial advice. Past returns do not guarantee future results. Mutual fund investments are subject to market risks.
        </span>
      </div>
    );
  }

  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      padding: '32px 24px',
      marginTop: '64px',
      background: 'rgba(9, 13, 22, 0.6)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '9999px',
          color: '#f59e0b',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}>
          <AlertTriangle size={15} />
          <span>Statutory Disclaimer</span>
        </div>
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          maxWidth: '820px',
          lineHeight: '1.6',
        }}>
          <strong>Educational tool. Not financial advice. Past returns do not guarantee future results.</strong><br />
          This simulator uses historical mutual fund Net Asset Values (NAVs) via MFAPI.in and modern portfolio theory (Markowitz SLSQP optimization) alongside Monte Carlo multivariate simulations. It does not constitute investment advice, solicitation, or recommendation. Consult a SEBI-registered Investment Adviser before making any investment decisions.
        </p>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '6px',
        }}>
          <span>Built for Indian Mutual Fund SIP Investors</span>
          <span>•</span>
          <span>Powered by FastAPI & React (Vite)</span>
          <span>•</span>
          <span>Markowitz & Monte Carlo Core</span>
        </div>
      </div>
    </footer>
  );
};
