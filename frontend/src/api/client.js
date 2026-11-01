import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

export const api = {
  checkHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  getRiskQuestions: async () => {
    const res = await apiClient.get('/risk-profile/questions');
    return res.data;
  },

  evaluateRiskProfile: async (answers) => {
    // answers format: [{ question_id: 1, answer: 2 }, ...]
    const res = await apiClient.post('/risk-profile', { answers });
    return res.data;
  },

  getFundCategories: async () => {
    const res = await apiClient.get('/funds/categories');
    return res.data;
  },

  getOptimization: async (riskProfile, maxWeight = 0.40) => {
    const res = await apiClient.post('/optimize', {
      risk_profile: riskProfile,
      max_weight: maxWeight,
    });
    return res.data;
  },

  runSimulation: async (payload) => {
    // payload: { monthly_sip, years, goal_amount, risk_profile, max_weight, num_simulations }
    const res = await apiClient.post('/simulate', payload);
    return res.data;
  },

  savePlan: async (planData) => {
    const res = await apiClient.post('/plans', planData);
    return res.data;
  },

  getPlan: async (planId) => {
    const res = await apiClient.get(`/plans/${planId}`);
    return res.data;
  },
};
