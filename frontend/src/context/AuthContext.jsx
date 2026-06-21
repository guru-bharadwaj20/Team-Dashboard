import { createContext, useContext, useState, useCallback } from 'react';
import { getCurrentUser, getAuthToken, saveCurrentUser, saveAuthToken, removeAuthToken, removeCurrentUser } from '../utils/helpers.js';
import { authApi } from '../api/index.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCurrentUser());
  const [token, setToken] = useState(() => getAuthToken());

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    if (res?.token) { setToken(res.token); saveAuthToken(res.token); }
    if (res?.user)  { setUser(res.user);  saveCurrentUser(res.user); }
    return res;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await authApi.register(name, email, password);
    if (res?.token) { setToken(res.token); saveAuthToken(res.token); }
    if (res?.user)  { setUser(res.user);  saveCurrentUser(res.user); }
    return res;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    removeAuthToken();
    removeCurrentUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
