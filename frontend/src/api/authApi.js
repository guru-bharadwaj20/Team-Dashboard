import api from './axios.js';
import { saveAuthToken, saveCurrentUser, removeAuthToken, removeCurrentUser } from '../utils/helpers.js';

export const authApi = {
  registerOnly: async (name, email, password) => {
    // Registration without automatic login - returns success but doesn't save credentials
    const res = await api.post('/auth/register', { name, email, password });
    // Do NOT save token or user - user must manually log in
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

export default authApi;
