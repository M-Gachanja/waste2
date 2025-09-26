import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../contexts/AuthContext';

const WasteLog = () => {
  const [wasteEntry, setWasteEntry] = useState({
    waste_type: '',
    quantity: '',
    unit: 'g',
    description: '',
    date: new Date(),
  });
  
  const [wasteTypes, setWasteTypes] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { getApi } = useAuth();

  useEffect(() => {
    fetchWasteTypes();
  }, []);

  const fetchWasteTypes = async () => {
    try {
      const api = getApi();
      const response = await api.get('/waste-types/');
      setWasteTypes(response.data);
    } catch (error) {
      console.error('Error fetching waste types:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWasteEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setWasteEntry(prev => ({
      ...prev,
      date: date || new Date()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage({ type: '', text: '' });
    
    // Validate form data
    if (!wasteEntry.waste_type) {
      setMessage({ type: 'error', text: 'Please select a waste type.' });
      return;
    }
    
    if (!wasteEntry.quantity || parseFloat(wasteEntry.quantity) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid quantity.' });
      return;
    }
    
    try {
      const api = getApi();
      const formattedData = {
        waste_type: parseInt(wasteEntry.waste_type),
        quantity: parseFloat(wasteEntry.quantity),
        unit: wasteEntry.unit,
        description: wasteEntry.description,
        date: wasteEntry.date.toISOString().split('T')[0]
      };

      console.log('Submitting waste entry:', formattedData);

      const response = await api.post('/waste-entries/', formattedData);
      console.log('Waste entry created:', response.data);
      
      setMessage({ type: 'success', text: 'Waste entry logged successfully!' });
      
      // Reset form
      setWasteEntry({
        waste_type: '',
        quantity: '',
        unit: 'g',
        description: '',
        date: new Date(),
      });
    } catch (error) {
      console.error('Error submitting waste entry:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 403) {
        setMessage({ type: 'error', text: 'Permission denied. Please make sure you are logged in.' });
      } else if (error.response?.status === 401) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
      } else if (error.response?.status === 400) {
        // Handle validation errors
        const errorData = error.response.data;
        let errorMessage = 'Validation error: ';
        
        if (typeof errorData === 'object') {
          const errorMessages = [];
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${messages}`);
            }
          }
          errorMessage += errorMessages.join('; ');
        } else {
          errorMessage += errorData;
        }
        
        setMessage({ type: 'error', text: errorMessage });
      } else {
        setMessage({ type: 'error', text: 'Error logging waste entry. Please try again.' });
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Log Waste
        </Typography>
        
        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Waste Type</InputLabel>
                <Select
                  name="waste_type"
                  value={wasteEntry.waste_type}
                  onChange={handleChange}
                  label="Waste Type"
                >
                  {wasteTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name} {type.recyclable && '♻️'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={wasteEntry.quantity}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  name="unit"
                  value={wasteEntry.unit}
                  onChange={handleChange}
                  label="Unit"
                >
                  <MenuItem value="g">Grams (g)</MenuItem>
                  <MenuItem value="kg">Kilograms (kg)</MenuItem>
                  <MenuItem value="items">Items</MenuItem>
                  <MenuItem value="l">Liters (l)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={wasteEntry.date}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                multiline
                rows={3}
                value={wasteEntry.description}
                onChange={handleChange}
                placeholder="Additional details about this waste entry..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 2 }}
              >
                Log Waste Entry
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default WasteLog;