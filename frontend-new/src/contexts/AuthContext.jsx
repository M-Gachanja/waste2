import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// API base URL - make it easy to change
const API_BASE_URL = 'http://localhost:8000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Configure axios
  axios.defaults.withCredentials = true;
  axios.defaults.xsrfCookieName = 'csrftoken';
  axios.defaults.xsrfHeaderName = 'X-CSRFToken';

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      await axios.get(`${API_BASE_URL}/waste-types/`);
      setBackendStatus('connected');
      return true;
    } catch (error) {
      setBackendStatus('disconnected');
      return false;
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    const isBackendConnected = await testBackendConnection();
    
    if (isBackendConnected) {
      await checkAuthStatus();
    } else {
      console.error('Backend server is not running. Please start the Django server.');
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/current/`);
      if (response.data && response.data.id) {
        setUser(response.data);
      }
    } catch (error) {
      console.log('User not authenticated or connection error');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    // Check backend connection first
    if (!await testBackendConnection()) {
      return { 
        success: false, 
        error: 'Backend server is not running. Please start the Django server on port 8000.' 
      };
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
        username,
        password,
      });

      if (response.data.user) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please make sure the Django backend is running on http://localhost:8000' 
        };
      }
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const register = async (userData) => {
    // Check backend connection first
    if (!await testBackendConnection()) {
      return { 
        success: false, 
        error: 'Backend server is not running. Please start the Django server on port 8000.' 
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
      
      return { success: true, data: response.data };
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please make sure the Django backend is running.' 
        };
      }
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.username?.[0] || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    if (await testBackendConnection()) {
      try {
        await axios.post(`${API_BASE_URL}/auth/logout/`);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    backendStatus,
    testBackendConnection,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};