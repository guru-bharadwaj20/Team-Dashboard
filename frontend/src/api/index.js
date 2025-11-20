import axios from 'axios';
import { getAuthToken, saveAuthToken, saveCurrentUser, removeAuthToken, removeCurrentUser } from '../utils/helpers.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  registerOnly: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res;
  },
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res?.token) {
      saveAuthToken(res.token);
      saveCurrentUser(res.user);
    }
    return res;
  },
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res?.token) {
      saveAuthToken(res.token);
      saveCurrentUser(res.user);
    }
    return res;
  },
  logout: () => {
    removeAuthToken();
    removeCurrentUser();
  },
  updateProfile: async (name, email) => {
    const res = await api.put('/auth/profile', { name, email });
    if (res?.user) {
      saveCurrentUser(res.user);
    }
    return res;
  },
  changePassword: async (currentPassword, newPassword) => {
    const res = await api.put('/auth/password', { currentPassword, newPassword });
    return res;
  },
  deleteAccount: async () => {
    const res = await api.delete('/auth/account');
    removeAuthToken();
    removeCurrentUser();
    return res;
  },
};

// Team API
export const teamApi = {
  getAll: async () => api.get('/teams'),
  getById: async (id) => api.get(`/teams/${id}`),
  create: async (data) => api.post('/teams', data),
  join: async (id) => api.post(`/teams/${id}`),
  update: async (id, data) => api.put(`/teams/${id}`, data),
  delete: async (id) => api.delete(`/teams/${id}`),
};

// Proposal API
export const proposalApi = {
  getByTeamId: async (teamId) => api.get(`/teams/${teamId}/proposals`),
  getById: async (id) => api.get(`/proposals/${id}`),
  create: async (teamId, data) => api.post(`/teams/${teamId}/proposals`, data),
  delete: async (id) => api.delete(`/proposals/${id}`),
  getComments: async (proposalId) => api.get(`/proposals/${proposalId}/comments`),
  addComment: async (proposalId, text) => api.post(`/proposals/${proposalId}/comments`, { text }),
};

// Contact API
export const contactApi = {
  submitMessage: async (name, email, subject, message) => {
    const res = await api.post('/contact', { name, email, subject, message });
    return res;
  },
  getAllMessages: async () => api.get('/contact'),
  getMessageById: async (id) => api.get(`/contact/${id}`),
  updateMessageStatus: async (id, status) => api.put(`/contact/${id}/status`, { status }),
  deleteMessage: async (id) => api.delete(`/contact/${id}`),
};

// Notification API
export const notificationApi = {
  getAll: async () => api.get('/notifications'),
  markAsRead: async (id) => api.patch(`/notifications/${id}`),
  delete: async (id) => api.delete(`/notifications/${id}`),
  clearAll: async () => api.delete('/notifications'),
};

export default api;
