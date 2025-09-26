import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios to include credentials for session authentication
  axios.defaults.withCredentials = true;
  axios.defaults.xsrfCookieName = 'csrftoken';
  axios.defaults.xsrfHeaderName = 'X-CSRFToken';

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/auth/current/');
      if (response.data && response.data.id) {
        setUser(response.data);
      }
    } catch (error) {
      console.log('User not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
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
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register/', {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.username?.[0] || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:8000/api/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};