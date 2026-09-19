import { localDb } from './indexedDb';

const BASE_URL = '/api';

export function getSessionId() {
  let sid = localStorage.getItem('mitra_session_id');
  if (!sid) {
    sid = 'saheli_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem('mitra_session_id', sid);
  }
  return sid;
}

export function resetSessionId() {
  const newSid = 'saheli_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  localStorage.setItem('mitra_session_id', newSid);
  localStorage.removeItem('mitra_token');
  return newSid;
}

function getAuthHeader() {
  const token = localStorage.getItem('mitra_token');
  const sid = getSessionId();
  const headers = {
    'X-Session-Id': sid
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorData.detail || 'API request failed');
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call to ${endpoint} encountered:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.access_token) {
      localStorage.setItem('mitra_token', data.access_token);
    }
    return data;
  },

  async register(userData) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.access_token) {
      localStorage.setItem('mitra_token', data.access_token);
    }
    return data;
  },

  async getMe() {
    return request('/auth/me');
  },

  logout() {
    localStorage.removeItem('mitra_token');
  },

  // Profile
  async getProfile() {
    return request('/profile');
  },

  async updateProfile(profileData) {
    return request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Dashboard
  async getDashboardSummary() {
    return request('/dashboard/summary');
  },

  // Transactions
  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/transactions${query ? `?${query}` : ''}`);
  },

  async createTransaction(txData) {
    // If offline, save to local IndexedDB
    if (!navigator.onLine) {
      return await localDb.saveTransaction(txData);
    }
    return await request('/transactions', {
      method: 'POST',
      body: JSON.stringify(txData)
    });
  },

  async updateTransaction(txId, txData) {
    return request(`/transactions/${txId}`, {
      method: 'PUT',
      body: JSON.stringify(txData)
    });
  },

  async deleteTransaction(txId) {
    return request(`/transactions/${txId}`, { method: 'DELETE' });
  },

  async parseNaturalTransaction(text, language, autoSave = false) {
    return request('/transactions/parse-natural', {
      method: 'POST',
      body: JSON.stringify({ text, language, auto_save: autoSave })
    });
  },

  // Irregular Income
  async getIrregularIncomeAnalysis() {
    return request('/irregular-income/analysis');
  },

  // Budget
  async getCurrentBudget() {
    return request('/budget/current');
  },

  async generateBudget(budgetReq) {
    return request('/budget/generate', {
      method: 'POST',
      body: JSON.stringify(budgetReq)
    });
  },

  // Goals
  async getGoals() {
    return request('/goals');
  },

  async createGoal(goalData) {
    return request('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData)
    });
  },

  async updateGoal(goalId, updates) {
    return request(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async simulateGoal(goalId, hypotheticalMonthlySavings) {
    return request(`/goals/${goalId}/simulate`, {
      method: 'POST',
      body: JSON.stringify({ goal_id: goalId, hypothetical_monthly_savings: hypotheticalMonthlySavings })
    });
  },

  // Assistant
  async sendChatMessage(message, language, conversationHistory = [], confirmedAction = null) {
    return request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        language,
        conversation_history: conversationHistory,
        confirmed_action: confirmedAction,
        include_voice_text: true
      })
    });
  },

  // Event dispatcher for financial data synchronization
  dispatchFinancialMutation() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mitra_financial_mutation'));
    }
  },

  // Voice Transcribe upload
  async transcribeAudio(fileBlob, language) {
    const formData = new FormData();
    formData.append('audio', fileBlob, 'voice.webm');
    if (language) formData.append('language', language);

    const token = localStorage.getItem('mitra_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${BASE_URL}/voice/transcribe`, {
      method: 'POST',
      headers,
      body: formData
    });
    return res.json();
  },

  // Scam Education
  async getScamScenarios(language) {
    return request(`/scam/scenarios?language=${language || 'en'}`);
  },

  async evaluateScam(scenarioId, selectedOptionId, language) {
    return request('/scam/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        scenario_id: scenarioId,
        selected_option_id: selectedOptionId,
        language
      })
    });
  },

  async getScamStats() {
    return request('/scam/my-stats');
  },

  // Gamification
  async getLearningActivities(language) {
    return request(`/learning/activities?language=${language || 'en'}`);
  },

  async submitGameAnswer(activityId, activityType, userChoices, language) {
    return request('/learning/submit', {
      method: 'POST',
      body: JSON.stringify({
        activity_id: activityId,
        activity_type: activityType,
        user_choices: userChoices,
        language
      })
    });
  },

  async getGameStats() {
    return request('/learning/stats');
  },

  // Simulator
  async runSimulation(simRequest) {
    return request('/simulator/simulate', {
      method: 'POST',
      body: JSON.stringify(simRequest)
    });
  },

  // Offline Sync
  async getBootstrapCache(language) {
    return request(`/sync/bootstrap?language=${language || 'en'}`);
  },

  async syncOfflineData(payload) {
    return request('/sync', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
