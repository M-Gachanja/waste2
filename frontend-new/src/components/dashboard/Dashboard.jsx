import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalWaste: 0,
    totalEntries: 0,
    co2Saved: 0,
    weeklyData: [],
  });
  const { getApi } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const api = getApi();
      const analyticsResponse = await api.get('/analytics/?period=week');
      const entriesResponse = await api.get('/waste-entries/');
      
      setStats({
        totalWaste: analyticsResponse.data.total_waste_kg || 0,
        totalEntries: entriesResponse.data.length,
        co2Saved: analyticsResponse.data.co2_saved_kg || 0,
        weeklyData: analyticsResponse.data.waste_by_type || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalWaste: 0,
        totalEntries: 0,
        co2Saved: 0,
        weeklyData: [],
      });
    }
  };

  const chartData = {
    labels: stats.weeklyData.map(item => item.waste_type__name),
    datasets: [
      {
        label: 'Waste by Type (kg)',
        data: stats.weeklyData.map(item => item.total),
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Waste Distribution',
      },
    },
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom color="primary">
        WasteWise Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Waste This Week
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalWaste.toFixed(2)} kg
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
                {stats.totalEntries}
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
                {stats.co2Saved.toFixed(2)} kg
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart */}
        {stats.weeklyData.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Bar data={chartData} options={chartOptions} />
            </Paper>
          </Grid>
        )}

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h5" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                <Typography variant="h6">📝</Typography>
                <Typography>Log New Waste</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                <Typography variant="h6">📊</Typography>
                <Typography>View Analytics</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                <Typography variant="h6">🎯</Typography>
                <Typography>Set Goals</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Add default export
export default Dashboard;