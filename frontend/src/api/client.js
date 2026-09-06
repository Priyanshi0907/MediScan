const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, { method = "GET", body, token, params } = {}) {
  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) url += `?${qs}`;
  }
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return data;
}

export const api = {
  signup: (payload) => request("/api/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/api/auth/me", { token }),

  predict: (text, token) => request("/api/predict", { method: "POST", body: { text }, token }),
  extractSymptoms: (text, token) => request("/api/extract-symptoms", { method: "POST", body: { text }, token }),

  changePassword: (payload, token) => request("/api/auth/change-password", { method: "POST", body: payload, token }),
  deleteAccount: (token) => request("/api/auth/account", { method: "DELETE", token }),

  history: (token, params) => request("/api/history", { token, params }),
  historyItem: (id, token) => request(`/api/history/${id}`, { token }),
  deleteHistoryItem: (id, token) => request(`/api/history/${id}`, { method: "DELETE", token }),
  deleteAllHistory: (token) => request("/api/history", { method: "DELETE", token }),

  diseases: (token, params) => request("/api/diseases", { token, params }),
  diseaseDetail: (slug, token) => request(`/api/diseases/${slug}`, { token }),

  reports: (token, params) => request("/api/reports", { token, params }),
  reportDetail: (id, token) => request(`/api/reports/${id}`, { token }),

  stats: (token) => request("/api/stats", { token }),
};


export default api;
