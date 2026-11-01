import React, { useState, useEffect } from 'react';
import { api } from './api/client';
import { Navbar } from './components/Navbar';
import { Disclaimer } from './components/Disclaimer';
import { LoadingSpinner } from './components/LoadingSpinner';
import { RiskQuestionnaire } from './pages/RiskQuestionnaire';
import { PlanInput } from './pages/PlanInput';
import { ResultsDashboard } from './pages/ResultsDashboard';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const [step, setStep] = useState('risk'); // 'risk' | 'input' | 'results'
  const [riskData, setRiskData] = useState(null);
  const [planInputs, setPlanInputs] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [optimizerData, setOptimizerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverHealthy, setServerHealthy] = useState(false);

  // Initial health check
  useEffect(() => {
    const ping = async () => {
      try {
        await api.checkHealth();
        setServerHealthy(true);
      } catch (e) {
        setServerHealthy(false);
      }
    };
    ping();
    const timer = setInterval(ping, 20000);
    return () => clearInterval(timer);
  }, []);

  const handleRiskCompleted = (riskResult) => {
    setRiskData(riskResult);
    setStep('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlanSubmitted = async (inputs) => {
    setLoading(true);
    setError(null);
    setPlanInputs(inputs);

    try {
      // Parallel fetch: optimization frontier + Monte Carlo simulation
      const [optRes, simRes] = await Promise.all([
        api.getOptimization(inputs.risk_profile, inputs.max_weight),
        api.runSimulation(inputs),
      ]);

      setOptimizerData(optRes);
      setSimulationData(simRes);
      setStep('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          'Failed to run optimization & simulation. Please ensure the backend is running at http://localhost:8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('risk');
    setRiskData(null);
    setPlanInputs(null);
    setSimulationData(null);
    setOptimizerData(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentStep={step}
        onReset={handleReset}
        serverHealthy={serverHealthy}
      />

      <main style={{ flex: 1 }}>
        {error && (
          <div style={{
            maxWidth: '900px',
            margin: '24px auto 0',
            padding: '16px 20px',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fb7185',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} flexShrink={0} />
              <span style={{ fontSize: '0.9rem' }}>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Solving Markowitz SLSQP optimization & running 1,000 Monte Carlo paths..." />
        ) : (
          <>
            {step === 'risk' && (
              <RiskQuestionnaire onComplete={handleRiskCompleted} />
            )}

            {step === 'input' && (
              <PlanInput
                riskProfileData={riskData}
                onBack={() => setStep('risk')}
                onSubmit={handlePlanSubmitted}
                loading={loading}
              />
            )}

            {step === 'results' && (
              <ResultsDashboard
                simulationData={simulationData}
                optimizerData={optimizerData}
                planInputs={planInputs}
                onModifyPlan={() => setStep('input')}
              />
            )}
          </>
        )}
      </main>

      <Disclaimer />
    </div>
  );
}

export default App;
