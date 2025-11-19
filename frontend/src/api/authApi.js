import api from './axios.js';
import { saveAuthToken, saveCurrentUser, removeAuthToken, removeCurrentUser } from '../utils/helpers.js';

export const authApi = {
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
};

export default authApi;
