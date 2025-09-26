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

  // Configure axios with better CSRF handling
  const configureAxios = () => {
    axios.defaults.withCredentials = true;
    axios.defaults.xsrfCookieName = 'csrftoken';
    axios.defaults.xsrfHeaderName = 'X-CSRFToken';
    
    // Add request interceptor for better error logging
    axios.interceptors.request.use(
      (config) => {
        console.log('Making request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for better error handling
    axios.interceptors.response.use(
      (response) => {
        console.log('Response received:', response.status, response.config.url);
        return response;
      },
      (error) => {
        console.error('Response error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method
        });
        return Promise.reject(error);
      }
    );
  };

  useEffect(() => {
    configureAxios();
    initializeApp();
  }, []);

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/waste-types/`);
      console.log('Backend connection test successful:', response.status);
      setBackendStatus('connected');
      return true;
    } catch (error) {
      console.error('Backend connection test failed:', error.message);
      setBackendStatus('disconnected');
      return false;
    }
  };

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
        console.log('User authenticated:', response.data.username);
        setUser(response.data);
      }
    } catch (error) {
      console.log('User not authenticated:', error.response?.status);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Get CSRF token
  const getCSRFToken = async () => {
    try {
      // Make a GET request to get CSRF token
      await axios.get(`${API_BASE_URL}/waste-types/`);
      
      // Get token from cookie
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
      
      console.log('CSRF token obtained:', cookieValue ? 'Yes' : 'No');
      return cookieValue;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      return null;
    }
  };

  const login = async (username, password) => {
    console.log('Attempting login for user:', username);
    
    // Check backend connection first
    if (!await testBackendConnection()) {
      return { 
        success: false, 
        error: 'Backend server is not running. Please start the Django server on port 8000.' 
      };
    }

    try {
      // Get CSRF token first
      const csrfToken = await getCSRFToken();
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add CSRF token to headers if available
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      console.log('Making login request to:', `${API_BASE_URL}/auth/login/`);
      console.log('Request headers:', headers);
      console.log('Request data:', { username, password: '***' });

      const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
        username,
        password,
      }, {
        headers
      });

      console.log('Login response:', response.data);

      if (response.data.user) {
        setUser(response.data.user);
        console.log('Login successful for user:', response.data.user.username);
        return { success: true };
      } else {
        console.error('Login failed: No user data in response');
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });

      if (error.code === 'ERR_NETWORK') {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please make sure the Django backend is running on http://localhost:8000' 
        };
      }

      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'Access forbidden. There might be a CSRF token issue.'
        };
      }

      if (error.response?.status === 405) {
        return {
          success: false,
          error: 'Method not allowed. The login endpoint might be misconfigured.'
        };
      }

      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const register = async (userData) => {
    console.log('Attempting registration for user:', userData.username);
    
    // Check backend connection first
    if (!await testBackendConnection()) {
      return { 
        success: false, 
        error: 'Backend server is not running. Please start the Django server on port 8000.' 
      };
    }

    try {
      // Get CSRF token first
      const csrfToken = await getCSRFToken();
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add CSRF token to headers if available
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await axios.post(`${API_BASE_URL}/auth/register/`, {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
      }, {
        headers
      });
      
      console.log('Registration successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      
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
        console.log('Logout successful');
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