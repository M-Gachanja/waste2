import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Add token to all requests
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }

    // Add response interceptor to handle token refresh
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                refresh: refreshToken
              });
              
              const newAccessToken = response.data.access;
              localStorage.setItem('accessToken', newAccessToken);
              api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
              
              // Retry the original request
              error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return api.request(error.config);
            } catch (refreshError) {
              // Refresh failed, logout user
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              delete api.defaults.headers.common['Authorization'];
              setUser(null);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    initializeApp();
  }, []);

  const testBackendConnection = async () => {
    try {
      await api.get('/waste-types/');
      setBackendStatus('connected');
      return true;
    } catch (error) {
      setBackendStatus('disconnected');
      return false;
    }
  };

  const initializeApp = async () => {
    const isBackendConnected = await testBackendConnection();
    
    if (isBackendConnected) {
      await checkAuthStatus();
    } else {
      console.error('Backend server is not running.');
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/current/');
      if (response.data && response.data.id) {
        setUser(response.data);
      }
    } catch (error) {
      console.log('User not authenticated or token invalid');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    if (!await testBackendConnection()) {
      return { 
        success: false, 
        error: 'Backend server is not running.' 
      };
    }

    try {
      // Use axios directly for login (not the api instance)
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
        username,
        password,
      });

      if (response.data.tokens) {
        const { access, refresh } = response.data.tokens;
        
        // Store tokens
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        
        // Update api instance headers
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        return { 
          success: false, 
          error: 'Cannot connect to server.' 
        };
      }
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed.' 
      };
    }

    return { success: false, error: 'Login failed' };
  };

  const register = async (userData) => {
    if (!await testBackendConnection()) {
      return { 
        success: false, 
        error: 'Backend server is not running.' 
      };
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register/`, {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
      });
      
      if (response.data.tokens) {
        const { access, refresh } = response.data.tokens;
        
        // Store tokens
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        
        // Update api instance headers
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        setUser(response.data.user);
        return { success: true, data: response.data };
      }
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        return { 
          success: false, 
          error: 'Cannot connect to server.' 
        };
      }
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed.' 
      };
    }

    return { success: false, error: 'Registration failed' };
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const getApi = () => api;

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    backendStatus,
    getApi,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};