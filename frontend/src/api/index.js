import axios from 'axios';
import { getAuthToken, saveAuthToken, saveCurrentUser, removeAuthToken, removeCurrentUser } from '../utils/helpers.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap response.data; surface errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API
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
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/password', { currentPassword, newPassword }),
  deleteAccount: async () => {
    const res = await api.delete('/auth/account');
    removeAuthToken(); removeCurrentUser();
    return res;
  },
};

// Team API
export const teamApi = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  join: (id) => api.post(`/teams/${id}`),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
};

// Proposal API
export const proposalApi = {
  getByTeamId: (teamId) => api.get(`/teams/${teamId}/proposals`),
  getById: (id) => api.get(`/proposals/${id}`),
  create: (teamId, data) => api.post(`/teams/${teamId}/proposals`, data),
  delete: (id) => api.delete(`/proposals/${id}`),
  vote: (id, vote) => api.post(`/proposals/${id}/vote`, { vote }),
  getComments: (proposalId) => api.get(`/proposals/${proposalId}/comments`),
  addComment: (proposalId, text) => api.post(`/proposals/${proposalId}/comments`, { text }),
};

// Public board API (no auth required)
export const publicBoardApi = {
  getByShareId: (shareId) => api.get(`/public/board/${shareId}`),
};

// Contact API
export const contactApi = {
  submitMessage: (name, email, subject, message) =>
    api.post('/contact', { name, email, subject, message }),
  getAllMessages: () => api.get('/contact'),
  getMessageById: (id) => api.get(`/contact/${id}`),
  updateMessageStatus: (id, status) => api.put(`/contact/${id}/status`, { status }),
  deleteMessage: (id) => api.delete(`/contact/${id}`),
};

// Notification API
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}`),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications'),
};

export default api;
