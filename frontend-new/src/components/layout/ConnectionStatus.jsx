import React from 'react';
import { Alert, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ConnectionStatus = () => {
  const { backendStatus } = useAuth();

  if (backendStatus === 'disconnected') {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Backend server is not running! Please start the Django backend:
          <br />
          <code>cd backend && python manage.py runserver</code>
        </Alert>
      </Box>
    );
  }

  return null;
};

export default ConnectionStatus;