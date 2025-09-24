import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ♻️ WasteWise
          </Typography>
          
          {user ? (
            <>
              <Button color="inherit" onClick={() => navigate('/')}>
                Dashboard
              </Button>
              <Button color="inherit" onClick={() => navigate('/log-waste')}>
                Log Waste
              </Button>
              <Button color="inherit" onClick={() => navigate('/analytics')}>
                Analytics
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout ({user.username})
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;