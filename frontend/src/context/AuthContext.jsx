import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, getAuthToken, saveCurrentUser, saveAuthToken, removeAuthToken, removeCurrentUser } from '../utils/helpers.js';
import { authApi } from '../api/authApi.js';
import api from '../api/axios.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCurrentUser());
  const [token, setToken] = useState(() => getAuthToken());

  useEffect(() => {
    // keep localStorage in sync if user/token change
    if (user && token) {
      saveCurrentUser(user);
      saveAuthToken(token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [user, token]);

  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      const data = res?.data ?? res;
      if (data?.token) {
        setToken(data.token);
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      }
      if (data?.user) setUser(data.user);
      return data;
    } catch (error) {
      // Clear any stale auth data
      removeAuthToken();
      removeCurrentUser();
      delete api.defaults.headers.common.Authorization;
      throw error;
    }
  };

  const register = async (name, email, password) => {
    const res = await authApi.register(name, email, password);
    const data = res?.data ?? res;
    if (data?.token) {
      setToken(data.token);
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
    }
    if (data?.user) setUser(data.user);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeAuthToken();
    removeCurrentUser();
    delete api.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
