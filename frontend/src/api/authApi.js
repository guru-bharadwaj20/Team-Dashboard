import api from './axios.js';

export const authApi = {
  register: async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      // Handle both response.data and direct response
      const data = res?.data || res;
      // Don't save to localStorage here - let AuthContext handle it
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
      // Don't save to localStorage here - let AuthContext handle it
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
};

export default authApi;
