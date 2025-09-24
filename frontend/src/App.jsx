import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from '../../frontend-new/src/contexts/AuthContext';
import Header from '../../frontend-new/src/components/layout/Header';
import Login from '../../frontend-new/src/components/auth/Login';
import Register from '../../frontend-new/src/components/auth/Register';
import Dashboard from '../../frontend-new/src/components/dashboard/Dashboard';
import WasteLog from '../../frontend-new/src/components/waste/WasteLog';
import WasteList from '../../frontend-new/src/components/waste/WasteList';
import Analytics from '../../frontend-new/src/components/analytics/Analytics';

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
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/" 
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
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;