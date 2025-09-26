import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import ConnectionStatus from './components/layout/ConnectionStatus';
import Homepage from './components/Homepage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import WasteLog from './components/waste/WasteLog';
import WasteList from './components/waste/WasteList';
import Analytics from './components/analytics/Analytics';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FF9800',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function ProtectedRoute({ children }) {
  const { user, backendStatus } = useAuth();
  
  if (backendStatus === 'disconnected') {
    return children; // Allow access even if backend is down
  }
  
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  
  // If user is logged in and tries to access public routes, redirect to dashboard
  if (user && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <ConnectionStatus />
            <Header />
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={<Homepage />} 
              />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/log-waste" 
                element={
                  <ProtectedRoute>
                    <WasteLog />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/waste-list" 
                element={
                  <ProtectedRoute>
                    <WasteList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect old dashboard route */}
              <Route path="/old-dashboard" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;