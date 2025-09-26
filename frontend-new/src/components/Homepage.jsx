import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  RecyclingOutlined,
  TrendingUpOutlined,
  BarChartOutlined,
  EcoOutlined,
  CheckCircleOutlined,
  PublicOutlined,
  LocalFloristOutlined,
  Science,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Homepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/');
    } else {
      navigate('/register');
    }
  };

  const features = [
    {
      icon: <RecyclingOutlined fontSize="large" color="primary" />,
      title: 'Smart Waste Tracking',
      description: 'Log different types of waste with detailed categorization and tracking over time.',
    },
    {
      icon: <BarChartOutlined fontSize="large" color="primary" />,
      title: 'Detailed Analytics',
      description: 'Visualize your waste patterns with comprehensive charts and insights.',
    },
    {
      icon: <TrendingUpOutlined fontSize="large" color="primary" />,
      title: 'Environmental Impact',
      description: 'See your real CO₂ savings and environmental contribution through recycling.',
    },
    {
      icon: <EcoOutlined fontSize="large" color="primary" />,
      title: 'Sustainable Goals',
      description: 'Set and achieve waste reduction goals to minimize your environmental footprint.',
    },
  ];

  const benefits = [
    'Track and reduce household waste by up to 30%',
    'Understand your environmental impact with real-time CO₂ calculations',
    'Identify recycling opportunities to minimize landfill waste',
    'Set personalized waste reduction goals',
    'Monitor progress with detailed analytics and reports',
    'Contribute to a cleaner, greener planet',
  ];

  const stats = [
    { number: '2.1B', label: 'Tons of waste generated globally each year', icon: <PublicOutlined /> },
    { number: '30%', label: 'Waste reduction possible with proper tracking', icon: <TrendingUpOutlined /> },
    { number: '75%', label: 'Of waste is recyclable but not recycled', icon: <RecyclingOutlined /> },
    { number: '1.6B', label: 'Tons of CO₂ emissions from waste annually', icon: <Science /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
          color: 'white',
          py: 12,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ mb: 3 }}>
                <Chip
                  label="🌱 Environmental Impact Tracker"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    mb: 2,
                    fontWeight: 'bold',
                  }}
                />
              </Box>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                }}
              >
                Transform Your Waste into
                <Box component="span" sx={{ color: '#FFC107', display: 'block' }}>
                  Environmental Action
                </Box>
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 300,
                  lineHeight: 1.4,
                }}
              >
                Track, analyze, and reduce your household waste while making a real difference
                for our planet. Join the movement toward sustainable living.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    bgcolor: '#FFC107',
                    color: '#000',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: '#FFB300',
                    },
                  }}
                >
                  {user ? 'Go to Dashboard' : 'Start Tracking Today'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/analytics')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  View Demo
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: { xs: 200, md: 400 },
                }}
              >
                <Box
                  sx={{
                    fontSize: { xs: '8rem', md: '12rem' },
                    animation: 'float 3s ease-in-out infinite',
                    '@keyframes float': {
                      '0%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-20px)' },
                      '100%': { transform: 'translateY(0px)' },
                    },
                  }}
                >
                  ♻️
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Global Impact Statistics */}
      <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 6 }}
          >
            The Global Waste Challenge
          </Typography>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    },
                  }}
                >
                  <Box sx={{ mb: 2, color: 'primary.main' }}>{stat.icon}</Box>
                  <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
                    {stat.number}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            How WasteWise Helps You Make a Difference
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="textSecondary"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Our comprehensive platform empowers you to take control of your environmental
            impact through intelligent waste management.
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                      <Box sx={{ mt: 1 }}>{feature.icon}</Box>
                      <Box>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ py: 10, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Your Journey to
                <Box component="span" sx={{ color: 'primary.main', display: 'block' }}>
                  Zero Waste Living
                </Box>
              </Typography>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
                Every small action counts. With WasteWise, you'll see exactly how your
                daily choices impact the environment and discover opportunities to make
                a bigger difference.
              </Typography>
              <List>
                {benefits.map((benefit, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon>
                      <CheckCircleOutlined color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={benefit}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: 500,
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 300,
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 2,
                    maxWidth: 300,
                  }}
                >
                  <Box sx={{ textAlign: 'center', fontSize: '4rem' }}>🌍</Box>
                  <Box sx={{ textAlign: 'center', fontSize: '4rem' }}>📊</Box>
                  <Box sx={{ textAlign: 'center', fontSize: '4rem' }}>🎯</Box>
                  <Box sx={{ textAlign: 'center', fontSize: '4rem' }}>🌱</Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <LocalFloristOutlined sx={{ fontSize: '4rem', mb: 2 }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Ready to Make an Impact?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of environmentally conscious individuals who are already
            tracking their waste and making a difference.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{
              bgcolor: '#FFC107',
              color: '#000',
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#FFB300',
              },
            }}
          >
            {user ? 'Continue Your Journey' : 'Start Your Environmental Journey'}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Homepage;