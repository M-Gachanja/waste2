import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const WasteList = () => {
  const [wasteEntries, setWasteEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getApi } = useAuth();

  useEffect(() => {
    fetchWasteEntries();
  }, []);

  const fetchWasteEntries = async () => {
    try {
      const api = getApi();
      const response = await api.get('/waste-entries/');
      setWasteEntries(response.data);
    } catch (error) {
      console.error('Error fetching waste entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const api = getApi();
      await api.delete(`/waste-entries/${id}/`);
      setWasteEntries(wasteEntries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error deleting waste entry:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          My Waste Entries
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Waste Type</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wasteEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={entry.waste_type_name} 
                      color={entry.waste_type_name === 'Plastic' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {entry.quantity} {entry.unit}
                  </TableCell>
                  <TableCell>
                    {entry.description || '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(entry.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {wasteEntries.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary">
              No waste entries yet. Start by logging your first waste entry!
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

// Add default export
export default WasteList;