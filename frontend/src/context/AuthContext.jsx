import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, getAuthToken, saveCurrentUser, saveAuthToken, removeAuthToken, removeCurrentUser } from '../utils/helpers.js';
import { authApi } from '../api/authApi.js';
import api from '../api/axios.js';
import { initializeSocket, disconnectSocket } from '../utils/socket.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getAuthToken();
        const storedUser = getCurrentUser();

        // Only use stored auth if both exist
        if (storedToken && storedUser) {
          // Set state immediately from storage (for quick recovery)
          setToken(storedToken);
          setUser(storedUser);
          
          // Set authorization header immediately
          api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
          
          // Verify token is still valid by checking a protected endpoint
          try {
            // Try to access a protected endpoint to validate token
            await api.get('/user/profile');
            // Token is valid, no further action needed
          } catch (error) {
            // Token is invalid or expired, clear storage
            console.warn('Token validation failed:', error.message);
            removeAuthToken();
            removeCurrentUser();
            delete api.defaults.headers.common.Authorization;
            setToken(null);
            setUser(null);
          }
        } else {
          // No stored auth, clear any partial data
          if (storedToken) removeAuthToken();
          if (storedUser) removeCurrentUser();
          delete api.defaults.headers.common.Authorization;
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    // keep localStorage in sync if user/token change
    if (user && token) {
      saveCurrentUser(user);
      saveAuthToken(token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      removeAuthToken();
      removeCurrentUser();
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
        // Initialize WebSocket after successful login
        setTimeout(() => initializeSocket(), 100);
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
    // Don't auto-login after registration
    const res = await authApi.register(name, email, password);
    // Just return the data without setting state (user needs to manually login)
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeAuthToken();
    removeCurrentUser();
    delete api.defaults.headers.common.Authorization;
    // Disconnect WebSocket on logout
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
