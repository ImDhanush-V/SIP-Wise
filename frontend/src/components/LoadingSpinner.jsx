import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Optimizing portfolio & running Monte Carlo paths...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '20px',
      padding: '40px',
      textAlign: 'center',
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: '3px solid rgba(16, 185, 129, 0.15)',
          borderTopColor: 'var(--accent-emerald)',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{
          position: 'absolute',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '2px solid rgba(6, 182, 212, 0.2)',
          borderBottomColor: 'var(--accent-cyan)',
          animation: 'spin 1.5s linear infinite reverse',
        }} />
      </div>
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {message}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
          Simulating 1,000+ stochastic return paths from historical covariance matrix...
        </p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
