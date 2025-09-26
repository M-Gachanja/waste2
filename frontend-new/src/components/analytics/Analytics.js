import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [period, setPeriod] = useState('week');
  const { getApi } = useAuth();

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      const api = getApi();
      const response = await api.get(`/analytics/?period=${period}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  if (!analyticsData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading analytics...</Typography>
      </Container>
    );
  }

  const wasteByTypeData = analyticsData.waste_by_type.map(item => ({
    name: item.waste_type__name,
    value: item.total,
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom color="primary">
        Waste Analytics
      </Typography>

      {/* Period Selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Time Period</InputLabel>
          <Select value={period} onChange={handlePeriodChange} label="Time Period">
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Waste
              </Typography>
              <Typography variant="h4" component="div">
                {analyticsData.total_waste_kg.toFixed(2)} kg
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Entries
              </Typography>
              <Typography variant="h4" component="div">
                {analyticsData.total_entries}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                CO₂ Saved
              </Typography>
              <Typography variant="h4" component="div">
                {analyticsData.co2_saved_kg.toFixed(2)} kg
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Waste by Type (Bar Chart)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.waste_by_type}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="waste_type__name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="Quantity" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Waste Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wasteByTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {wasteByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Add default export
export default Analytics;