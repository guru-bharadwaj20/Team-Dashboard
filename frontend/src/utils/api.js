import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Authentication endpoints
export const auth = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  register: (email, password, name) =>
    apiClient.post('/auth/register', { email, password, name }),
  logout: () => localStorage.removeItem('authToken'),
};

// Teams endpoints
export const teams = {
  getAll: () => apiClient.get('/teams'),
  getById: (id) => apiClient.get(`/teams/${id}`),
  create: (data) => apiClient.post('/teams', data),
  update: (id, data) => apiClient.put(`/teams/${id}`, data),
  delete: (id) => apiClient.delete(`/teams/${id}`),
};

// Proposals endpoints
export const proposals = {
  getByTeamId: (teamId) => apiClient.get(`/teams/${teamId}/proposals`),
  getById: (id) => apiClient.get(`/proposals/${id}`),
  create: (teamId, data) => apiClient.post(`/teams/${teamId}/proposals`, data),
  update: (id, data) => apiClient.put(`/proposals/${id}`, data),
  delete: (id) => apiClient.delete(`/proposals/${id}`),
};

// Voting endpoints
export const votes = {
  vote: (proposalId, option) =>
    apiClient.post(`/proposals/${proposalId}/votes`, { option }),
  getResults: (proposalId) =>
    apiClient.get(`/proposals/${proposalId}/results`),
};

// Comments endpoints
export const comments = {
  getByProposal: (proposalId) =>
    apiClient.get(`/proposals/${proposalId}/comments`),
  create: (proposalId, text) =>
    apiClient.post(`/proposals/${proposalId}/comments`, { text }),
  delete: (commentId) => apiClient.delete(`/comments/${commentId}`),
};

// Public board endpoints
export const publicBoard = {
  getByShareId: (shareId) =>
    apiClient.get(`/public/board/${shareId}`),
};

// User profile endpoints
export const user = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.put('/user/profile', data),
  getNotifications: () => apiClient.get('/user/notifications'),
};

export default apiClient;
