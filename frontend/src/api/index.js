import axios from 'axios';
import { saveCurrentUser, removeCurrentUser } from '../utils/helpers.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// The session lives in an httpOnly cookie the browser attaches automatically.
// Nothing here reads or forwards a token, so an XSS bug cannot steal the session.
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

/**
 * Broadcast when the server rejects our session. AuthContext listens and clears
 * local state, so an expired cookie logs the user out instead of leaving the app
 * apparently signed in with every request silently failing.
 */
export const SESSION_EXPIRED_EVENT = 'auth:session-expired';

// Endpoints where a 401 is an expected answer rather than an expired session.
const SESSION_AGNOSTIC = ['/auth/login', '/auth/register', '/auth/logout'];

// Unwrap response.data; surface errors cleanly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if (status === 401 && !SESSION_AGNOSTIC.some((path) => url.includes(path))) {
      removeCurrentUser();
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }

    const msg = error.response?.data?.message || error.message || 'Request failed';
    const enhanced = new Error(msg);
    enhanced.status = status;
    enhanced.response = error.response;
    return Promise.reject(enhanced);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  registerOnly: (name, email, password) => api.post('/auth/register', { name, email, password }),
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res?.user) saveCurrentUser(res.user);
    return res;
  },
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res?.user) saveCurrentUser(res.user);
    return res;
  },
  // Server-side: clears the httpOnly cookie the client cannot touch itself.
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      removeCurrentUser();
    }
  },
  me: () => api.get('/auth/me'),
  updateProfile: async (name, email) => {
    const res = await api.put('/auth/profile', { name, email });
    if (res?.user) saveCurrentUser(res.user);
    return res;
  },
  changePassword: (currentPassword, newPassword) => api.put('/auth/password', { currentPassword, newPassword }),
  deleteAccount: async () => {
    const res = await api.delete('/auth/account');
    removeCurrentUser();
    return res;
  },
};

// ─── Teams ────────────────────────────────────────────────────────────────────
export const teamApi = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  // Joining requires the team's share code — team ids are not join tokens.
  join: (shareId) => api.post('/teams/join', { shareId }),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
};

// ─── Proposals ────────────────────────────────────────────────────────────────
export const proposalApi = {
  getByTeamId: (teamId, page = 1, limit = 50) =>
    api.get(`/teams/${teamId}/proposals?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/proposals/${id}`),
  create: (teamId, data) => api.post(`/teams/${teamId}/proposals`, data),
  delete: (id) => api.delete(`/proposals/${id}`),
  vote: (id, vote) => api.post(`/proposals/${id}/vote`, { vote }),
  // Returns { comments, pagination } — comments moved to their own collection.
  getComments: (proposalId, page = 1, limit = 50) =>
    api.get(`/proposals/${proposalId}/comments?page=${page}&limit=${limit}`),
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
    const response = await fetch(`${API_BASE_URL}/export/proposal/${proposalId}?format=markdown`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Export failed');
    return response.text();
  },

  downloadPdf: async (proposalId) => {
    const response = await fetch(`${API_BASE_URL}/export/proposal/${proposalId}?format=pdf`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('PDF export failed');
    return response.blob();
  },
};

export default api;
