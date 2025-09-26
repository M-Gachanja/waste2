import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = () => {
    // Navigate to homepage if not logged in, dashboard if logged in
    navigate(user ? '/dashboard' : '/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={handleLogoClick}
          >
            ♻️ WasteWise
          </Typography>
          
          {user ? (
            // Authenticated user navigation
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                color="inherit" 
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  fontWeight: isActive('/dashboard') ? 'bold' : 'normal',
                  textDecoration: isActive('/dashboard') ? 'underline' : 'none'
                }}
              >
                Dashboard
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/log-waste')}
                sx={{ 
                  fontWeight: isActive('/log-waste') ? 'bold' : 'normal',
                  textDecoration: isActive('/log-waste') ? 'underline' : 'none'
                }}
              >
                Log Waste
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/waste-list')}
                sx={{ 
                  fontWeight: isActive('/waste-list') ? 'bold' : 'normal',
                  textDecoration: isActive('/waste-list') ? 'underline' : 'none'
                }}
              >
                My Waste
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/analytics')}
                sx={{ 
                  fontWeight: isActive('/analytics') ? 'bold' : 'normal',
                  textDecoration: isActive('/analytics') ? 'underline' : 'none'
                }}
              >
                Analytics
              </Button>
              <Button 
                color="inherit" 
                onClick={handleLogout}
                sx={{ 
                  ml: 2, 
                  border: '1px solid rgba(255,255,255,0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Logout ({user.username})
              </Button>
            </Box>
          ) : (
            // Public/guest navigation
            <Box sx={{ display: 'flex', gap: 1 }}>
              {location.pathname !== '/' && (
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/')}
                  sx={{ 
                    fontWeight: isActive('/') ? 'bold' : 'normal'
                  }}
                >
                  Home
                </Button>
              )}
              <Button 
                color="inherit" 
                onClick={() => navigate('/login')}
                sx={{ 
                  fontWeight: isActive('/login') ? 'bold' : 'normal'
                }}
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/register')}
                variant={isActive('/register') ? 'outlined' : 'text'}
                sx={{ 
                  fontWeight: isActive('/register') ? 'bold' : 'normal',
                  borderColor: isActive('/register') ? 'white' : 'transparent'
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;