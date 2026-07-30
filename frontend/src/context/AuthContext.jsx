import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getCurrentUser, saveCurrentUser, removeCurrentUser } from '../utils/helpers.js';
import { authApi, SESSION_EXPIRED_EVENT } from '../api/index.js';

const AuthContext = createContext();

/**
 * Auth state.
 *
 * The session token is an httpOnly cookie managed entirely by the server; it is
 * never held in JS. `user` is a cached profile so the UI can render immediately,
 * and is revalidated against GET /auth/me on mount.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCurrentUser());
  // False until the cached profile has been confirmed (or rejected) by the server.
  const [initializing, setInitializing] = useState(() => !!getCurrentUser());

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

  // Confirm the cached profile still corresponds to a live session. Without this
  // an expired cookie left the app looking signed in until a request happened to
  // fail, and the socket would connect only to be rejected.
  useEffect(() => {
    if (!getCurrentUser()) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await authApi.me();
        if (cancelled) return;
        if (res?.user) { setUser(res.user); saveCurrentUser(res.user); }
      } catch {
        // A 401 already cleared storage via the response interceptor.
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Any 401 from anywhere in the app drops us to signed-out state.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
