import { createContext, useContext, useState, useCallback } from 'react';
import { getCurrentUser, saveCurrentUser, removeCurrentUser } from '../utils/helpers.js';
import { authApi } from '../api/index.js';

const AuthContext = createContext();

/**
 * Auth state.
 *
 * The session token is an httpOnly cookie managed entirely by the server; it is
 * never held in JS. `user` is a cached profile used to render immediately on load.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCurrentUser());

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    if (res?.user) { setUser(res.user); saveCurrentUser(res.user); }
    return res;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await authApi.register(name, email, password);
    if (res?.user) { setUser(res.user); saveCurrentUser(res.user); }
    return res;
  }, []);

  const logout = useCallback(async () => {
    // Only the server can clear an httpOnly cookie.
    await authApi.logout();
    setUser(null);
    removeCurrentUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
