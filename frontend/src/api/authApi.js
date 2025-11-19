import api from './axios.js';
import { saveAuthToken, saveCurrentUser, removeAuthToken, removeCurrentUser } from '../utils/helpers.js';

export const authApi = {
  register: async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      // Handle both response.data and direct response
      const data = res?.data || res;
      if (data?.token) {
        saveAuthToken(data.token);
        saveCurrentUser(data.user);
      }
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      // Handle both response.data and direct response
      const data = res?.data || res;
      if (data?.token) {
        saveAuthToken(data.token);
        saveCurrentUser(data.user);
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  logout: () => {
    removeAuthToken();
    removeCurrentUser();
  },
};

export default authApi;
