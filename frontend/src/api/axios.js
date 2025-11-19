import axios from 'axios';
import { getAuthToken, removeAuthToken, removeCurrentUser } from '../utils/helpers.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token in request
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Clear the header if there's no token
    delete config.headers.Authorization;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth data
      removeAuthToken();
      removeCurrentUser();
      // Reload to force redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
