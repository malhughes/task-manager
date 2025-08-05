import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const sessionCheckInterval = useRef(null);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Set up periodic session checks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      startSessionCheck();
    } else {
      stopSessionCheck();
    }

    return () => {
      stopSessionCheck();
    };
  }, [isAuthenticated]);

  const startSessionCheck = () => {
    // Check session every 5 minutes
    sessionCheckInterval.current = setInterval(async () => {
      try {
        const userData = await authService.checkAuth();
        if (!userData) {
          // Session expired, logout user
          handleSessionExpired();
        }
      } catch (error) {
        console.error('Session check failed:', error);
        // If auth check fails, assume session expired
        handleSessionExpired();
      }
    }, 5 * 60 * 1000); // 5 minutes
  };

  const stopSessionCheck = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
    }
  };

  const handleSessionExpired = () => {
    console.log('Session expired, logging out user');
    setUser(null);
    setIsAuthenticated(false);
    stopSessionCheck();
    // Note: Navigation to login page will be handled by ProtectedRoute
  };

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const userData = await authService.checkAuth();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response && response._id) {
        // Backend returns user data directly, not wrapped in a user property
        setUser(response);
        setIsAuthenticated(true);
        return response;
      }
      throw new Error('Invalid login response');
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      stopSessionCheck();
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response && response._id) {
        // Backend returns user data directly, not wrapped in a user property
        setUser(response);
        setIsAuthenticated(true);
        return response;
      }
      throw new Error('Invalid registration response');
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};