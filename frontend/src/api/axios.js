import axios from 'axios';
import { getAuthToken } from '../utils/helpers.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Return the data directly
    return response.data;
  },
  (error) => {
    // Log error for debugging
    console.error('API Error:', error.response?.data || error.message);
    
    // Return a rejected promise with the error
    return Promise.reject(error);
  }
);

export default api;
