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
import axios from 'axios';

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

  useEffect(() => {
    fetchWasteTypes();
  }, []);

  const fetchWasteTypes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/waste-types/');
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
      date: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...wasteEntry,
        waste_type: parseInt(wasteEntry.waste_type),
        date: wasteEntry.date.toISOString().split('T')[0]
      };

      await axios.post('http://localhost:8000/api/waste-entries/', formattedData);
      
      setMessage({ type: 'success', text: 'Waste entry logged successfully!' });
      setWasteEntry({
        waste_type: '',
        quantity: '',
        unit: 'g',
        description: '',
        date: new Date(),
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error logging waste entry. Please try again.' });
      console.error('Error submitting waste entry:', error);
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
                  renderInput={(params) => <TextField {...params} fullWidth />}
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