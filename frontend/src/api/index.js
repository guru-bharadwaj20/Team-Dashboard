import axios from 'axios';
import { getAuthToken, saveAuthToken, saveCurrentUser, removeAuthToken, removeCurrentUser } from '../utils/helpers.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap response.data; surface errors cleanly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg = error.response?.data?.message || error.message || 'Request failed';
    const enhanced = new Error(msg);
    enhanced.status = error.response?.status;
    enhanced.response = error.response;
    return Promise.reject(enhanced);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  registerOnly: (name, email, password) => api.post('/auth/register', { name, email, password }),
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res?.token) { saveAuthToken(res.token); saveCurrentUser(res.user); }
    return res;
  },
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res?.token) { saveAuthToken(res.token); saveCurrentUser(res.user); }
    return res;
  },
  logout: () => { removeAuthToken(); removeCurrentUser(); },
  updateProfile: async (name, email) => {
    const res = await api.put('/auth/profile', { name, email });
    if (res?.user) saveCurrentUser(res.user);
    return res;
  },
  changePassword: (currentPassword, newPassword) => api.put('/auth/password', { currentPassword, newPassword }),
  deleteAccount: async () => {
    const res = await api.delete('/auth/account');
    removeAuthToken(); removeCurrentUser();
    return res;
  },
};

// ─── Teams ────────────────────────────────────────────────────────────────────
export const teamApi = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  join: (id) => api.post(`/teams/${id}`),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
};

// ─── Proposals ────────────────────────────────────────────────────────────────
export const proposalApi = {
  getByTeamId: (teamId) => api.get(`/teams/${teamId}/proposals`),
  getById: (id) => api.get(`/proposals/${id}`),
  create: (teamId, data) => api.post(`/teams/${teamId}/proposals`, data),
  delete: (id) => api.delete(`/proposals/${id}`),
  vote: (id, vote) => api.post(`/proposals/${id}/vote`, { vote }),
  getComments: (proposalId) => api.get(`/proposals/${proposalId}/comments`),
  addComment: (proposalId, text) => api.post(`/proposals/${proposalId}/comments`, { text }),
};

// ─── Public Board ─────────────────────────────────────────────────────────────
export const publicBoardApi = {
  getByShareId: (shareId) => api.get(`/public/board/${shareId}`),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}`),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications'),
};

// ─── Contact ──────────────────────────────────────────────────────────────────
export const contactApi = {
  submitMessage: (name, email, subject, message) => api.post('/contact', { name, email, subject, message }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard: () => api.get('/analytics'),
};

// ─── Activity ─────────────────────────────────────────────────────────────────
export const activityApi = {
  getFeed: (page = 1, limit = 20) => api.get(`/activity?page=${page}&limit=${limit}`),
};

// ─── Export ───────────────────────────────────────────────────────────────────
export const exportApi = {
  // Returns a URL string — caller opens or fetches it
  getUrl: (proposalId, format = 'markdown') =>
    `${API_BASE_URL}/export/proposal/${proposalId}?format=${format}`,

  downloadMarkdown: async (proposalId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/export/proposal/${proposalId}?format=markdown`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Export failed');
    return response.text();
  },

  downloadPdf: async (proposalId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/export/proposal/${proposalId}?format=pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('PDF export failed');
    return response.blob();
  },
};

export default api;
