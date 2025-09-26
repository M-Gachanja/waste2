import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Button,
  Avatar,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUpOutlined,
  RecyclingOutlined,
  NatureOutlined,
  AddCircleOutlineOutlined,
  BarChartOutlined,
  ListAltOutlined,
  SettingsOutlined,
  StarBorderOutlined,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalWaste: 0,
    totalEntries: 0,
    co2Saved: 0,
    weeklyData: [],
  });
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getApi, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([
          fetchDashboardData(),
          fetchRecentEntries()
        ]);
      } catch (err) {
        console.error('Dashboard loading error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
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

  const fetchRecentEntries = async () => {
    try {
      const api = getApi();
      const response = await api.get('/waste-entries/');
      // Get last 5 entries
      setRecentEntries(response.data.slice(-5).reverse());
    } catch (error) {
      console.error('Error fetching recent entries:', error);
      setRecentEntries([]);
    }
  };

  const quickActions = [
    {
      title: 'Log New Waste',
      description: 'Add a new waste entry',
      icon: <AddCircleOutlineOutlined sx={{ fontSize: '2rem' }} />,
      color: '#4CAF50',
      action: () => navigate('/log-waste'),
    },
    {
      title: 'View Analytics',
      description: 'See detailed reports',
      icon: <BarChartOutlined sx={{ fontSize: '2rem' }} />,
      color: '#2196F3',
      action: () => navigate('/analytics'),
    },
    {
      title: 'Waste History',
      description: 'Browse all entries',
      icon: <ListAltOutlined sx={{ fontSize: '2rem' }} />,
      color: '#FF9800',
      action: () => navigate('/waste-list'),
    },
    {
      title: 'Set Goals',
      description: 'Update waste goals',
      icon: <StarBorderOutlined sx={{ fontSize: '2rem' }} />,
      color: '#9C27B0',
      action: () => alert('Goal setting feature coming soon!'),
    },
  ];

  const chartData = stats.weeklyData && stats.weeklyData.length > 0 ? {
    labels: stats.weeklyData.map(item => item.waste_type__name || 'Unknown'),
    datasets: [
      {
        label: 'Waste by Type (kg)',
        data: stats.weeklyData.map(item => item.total || 0),
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1,
      },
    ],
  } : {
    labels: [],
    datasets: []
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getWasteGoalProgress = () => {
    // Mock goal progress - you can connect this to real user goals
    const goal = 20; // kg per week
    const progress = Math.min((stats.totalWaste / goal) * 100, 100);
    return { goal, progress };
  };

  const goalData = getWasteGoalProgress();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Loading dashboard...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Welcome back, {user?.username || 'User'}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Ready to make a positive environmental impact today?
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={4}>
          <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <RecyclingOutlined sx={{ fontSize: '3rem', mb: 1 }} />
              <Typography color="inherit" variant="h6" gutterBottom>
                Total Waste This Week
              </Typography>
              <Typography variant="h3" component="div" fontWeight="bold">
                {stats.totalWaste.toFixed(1)}
              </Typography>
              <Typography variant="h6">kg</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #64B5F6 0%, #2196F3 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <ListAltOutlined sx={{ fontSize: '3rem', mb: 1 }} />
              <Typography color="inherit" variant="h6" gutterBottom>
                Total Entries
              </Typography>
              <Typography variant="h3" component="div" fontWeight="bold">
                {stats.totalEntries}
              </Typography>
              <Typography variant="h6">logged</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <NatureOutlined sx={{ fontSize: '3rem', mb: 1 }} />
              <Typography color="inherit" variant="h6" gutterBottom>
                CO₂ Saved
              </Typography>
              <Typography variant="h3" component="div" fontWeight="bold">
                {stats.co2Saved.toFixed(1)}
              </Typography>
              <Typography variant="h6">kg CO₂</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <TrendingUpOutlined />
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: `2px solid ${action.color}20`,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                        borderColor: action.color,
                      }
                    }}
                    onClick={action.action}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 2.5 }}>
                      <Box sx={{ color: action.color, mb: 1 }}>
                        {action.icon}
                      </Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Chart and Recent Activity */}
        <Grid item xs={12} md={8}>
          {stats.weeklyData.length > 0 ? (
            <Paper elevation={3} sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Weekly Waste Breakdown
              </Typography>
              <Box sx={{ height: '320px' }}>
                <Bar data={chartData} options={chartOptions} />
              </Box>
            </Paper>
          ) : (
            <Paper elevation={3} sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <RecyclingOutlined sx={{ fontSize: '4rem', color: 'gray', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No waste data yet
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Start by logging your first waste entry!
              </Typography>
              <Button variant="contained" onClick={() => navigate('/log-waste')}>
                Log Your First Entry
              </Button>
            </Paper>
          )}
        </Grid>

        {/* Recent Activity & Goal Progress */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            {/* Goal Progress */}
            <Paper elevation={3} sx={{ p: 3, flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Weekly Goal Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {stats.totalWaste.toFixed(1)} kg of {goalData.goal} kg target
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={goalData.progress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: goalData.progress >= 100 ? '#f44336' : '#4CAF50'
                    }
                  }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                  {goalData.progress.toFixed(0)}% of weekly goal
                </Typography>
              </Box>
            </Paper>

            {/* Recent Entries */}
            <Paper elevation={3} sx={{ p: 3, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Entries
                </Typography>
                <Tooltip title="View all entries">
                  <IconButton size="small" onClick={() => navigate('/waste-list')}>
                    <SettingsOutlined />
                  </IconButton>
                </Tooltip>
              </Box>
              {recentEntries.length > 0 ? (
                <Box>
                  {recentEntries.slice(0, 3).map((entry, index) => (
                    <Box key={entry.id}>
                      <Box sx={{ py: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {entry.waste_type_name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(entry.date)}
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {entry.quantity} {entry.unit}
                          </Typography>
                        </Box>
                      </Box>
                      {index < recentEntries.slice(0, 3).length - 1 && <Divider />}
                    </Box>
                  ))}
                  <Button 
                    size="small" 
                    sx={{ mt: 1 }} 
                    onClick={() => navigate('/waste-list')}
                  >
                    View All Entries
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No recent entries found
                </Typography>
              )}
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;