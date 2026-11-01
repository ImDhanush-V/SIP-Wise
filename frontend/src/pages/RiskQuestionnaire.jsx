import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Shield, ArrowRight, ArrowLeft, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const RiskQuestionnaire = ({ onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const data = await api.getRiskQuestions();
        setQuestions(data);
      } catch (err) {
        // Fallback default questions if API is temporarily unreachable during startup
        setQuestions([
          { id: 1, text: "What is your age?", options: ["Above 55", "46-55", "36-45", "26-35", "18-25"] },
          { id: 2, text: "What is your investment horizon?", options: ["Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "More than 10 years"] },
          { id: 3, text: "How stable is your primary source of income?", options: ["Very unstable / no income", "Somewhat unstable", "Average stability", "Stable salary", "Very stable with multiple sources"] },
          { id: 4, text: "If your portfolio dropped 20% in one month, what would you do?", options: ["Sell everything immediately", "Sell some holdings", "Do nothing and wait", "Buy a little more", "Invest significantly more"] },
          { id: 5, text: "What portion of your monthly income can you invest?", options: ["Less than 10%", "10-20%", "20-30%", "30-50%", "More than 50%"] },
          { id: 6, text: "What is your primary investment goal?", options: ["Capital preservation", "Regular income", "Balanced growth and income", "Long-term wealth creation", "Aggressive capital growth"] },
          { id: 7, text: "How much investment experience do you have?", options: ["None", "Basic (FDs / savings)", "Moderate (mutual funds)", "Good (stocks + MFs)", "Advanced (derivatives / global)"] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const handleSelectOption = (questionId, optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const formatted = Object.entries(answers).map(([qid, ans]) => ({
      question_id: parseInt(qid, 10),
      answer: ans,
    }));

    if (formatted.length < questions.length) {
      setError('Please answer all questions to evaluate your risk profile.');
      return;
    }

    try {
      setEvaluating(true);
      setError(null);
      const res = await api.evaluateRiskProfile(formatted);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError('Failed to evaluate risk profile. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading risk questionnaire..." />;
  }

  const currentQ = questions[currentIdx];
  const isSelected = (optIdx) => answers[currentQ?.id] === optIdx;
  const isAllAnswered = questions.every((q) => answers[q.id] !== undefined);
  const progressPercent = Math.round(((currentIdx + 1) / questions.length) * 100);

  // If already evaluated, show the scored summary card
  if (result) {
    const badgeClass =
      result.profile === 'Conservative'
        ? 'badge-conservative'
        : result.profile === 'Moderate'
        ? 'badge-moderate'
        : 'badge-aggressive';

    return (
      <div style={{ maxWidth: '680px', margin: '40px auto', padding: '0 16px' }}>
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--accent-emerald)',
          }}>
            <Award size={36} />
          </div>

          <span className={`badge ${badgeClass}`} style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
            {result.profile} Investor
          </span>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '16px', letterSpacing: '-0.02em' }}>
            Risk Profile Score: {result.score} / 28
          </h2>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginTop: '12px',
            maxWidth: '520px',
            margin: '12px auto 28px',
          }}>
            {result.description}
          </p>

          <div style={{
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            textAlign: 'center',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Equity Tilt</div>
              <div style={{ fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                {result.profile === 'Conservative' ? '20-30%' : result.profile === 'Moderate' ? '50-65%' : '75-90%'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Debt & Gold</div>
              <div style={{ fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                {result.profile === 'Conservative' ? '70-80%' : result.profile === 'Moderate' ? '35-50%' : '10-25%'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Horizon Fit</div>
              <div style={{ fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                {result.profile === 'Conservative' ? '1-3 Yrs' : result.profile === 'Moderate' ? '3-7 Yrs' : '7+ Yrs'}
              </div>
            </div>
          </div>

          <button
            onClick={() => onComplete(result)}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
          >
            <span>Proceed to SIP & Target Corpus</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '40px auto', padding: '0 16px' }}>
      {/* Questionnaire Header */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '9999px',
          color: '#60a5fa',
          fontSize: '0.75rem',
          fontWeight: 600,
          marginBottom: '12px',
        }}>
          <Shield size={14} />
          <span>Step 1: Investor Psychometrics</span>
        </div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
          Discover Your Investment Risk Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px' }}>
          Answer 7 quick questions to calibrate your risk tolerance and map your portfolio onto the Markowitz efficient frontier.
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{progressPercent}% Completed</span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #10b981, #06b6d4)',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', lineHeight: 1.4 }}>
            {currentQ.id}. {currentQ.text}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQ.options.map((opt, optIdx) => {
              const selected = isSelected(optIdx);
              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: selected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1.5px solid ${selected ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    boxShadow: selected ? '0 0 16px rgba(16, 185, 129, 0.2)' : 'none',
                  }}
                >
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: selected ? 600 : 400,
                    color: selected ? '#f8fafc' : 'var(--text-secondary)',
                  }}>
                    {opt}
                  </span>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: `2px solid ${selected ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: selected ? 'var(--accent-emerald)' : 'transparent',
                  }}>
                    {selected && <CheckCircle2 size={14} color="#090d16" strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div style={{
              color: '#f43f5e',
              fontSize: '0.85rem',
              marginTop: '16px',
              padding: '10px 14px',
              background: 'rgba(244, 63, 94, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(244, 63, 94, 0.2)',
            }}>
              {error}
            </div>
          )}

          {/* Nav buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="btn-secondary"
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={answers[currentQ.id] === undefined}
                className="btn-primary"
              >
                <span>Next Question</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isAllAnswered || evaluating}
                className="btn-primary"
              >
                <span>{evaluating ? 'Analyzing...' : 'Calculate Risk Profile'}</span>
                <Sparkles size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
