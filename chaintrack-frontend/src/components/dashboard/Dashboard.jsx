import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { Plus, Package, Truck, CheckCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { analyticsAPI } from '@services/api';
import { ROLES } from '@config/config';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import Loading from '@components/common/Loading';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  const statsCards = [
    {
      title: 'Total Products',
      value: stats?.overview?.totalProducts || 0,
      icon: <Package size={32} />,
      color: 'primary',
      change: `+${stats?.overview?.productsToday || 0} today`,
    },
    {
      title: 'Active Shipments',
      value: stats?.overview?.shipmentsInTransit || 0,
      icon: <Truck size={32} />,
      color: 'warning',
      change: 'In Transit',
    },
    {
      title: 'Delivered Today',
      value: stats?.overview?.deliveredToday || 0,
      icon: <CheckCircle size={32} />,
      color: 'success',
      change: `${stats?.performance?.onTimeDeliveryRate || 0}% on-time`,
    },
    {
      title: 'Total Users',
      value: stats?.overview?.totalUsers || 0,
      icon: <TrendingUp size={32} />,
      color: 'info',
      change: 'Network Growth',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your supply chain today
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {user?.role === ROLES.MANUFACTURER && (
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => navigate('/products/create')}
          >
            Create Product
          </Button>
        )}
        {[ROLES.MANUFACTURER, ROLES.DISTRIBUTOR, ROLES.RETAILER].includes(user?.role) && (
          <Button
            variant="outlined"
            startIcon={<Plus />}
            onClick={() => navigate('/shipments/create')}
          >
            Create Shipment
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={() => navigate('/scan')}
        >
          Scan QR Code
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Charts & Activity */}
      <Grid container spacing={3}>
        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Products by Category
            </Typography>
            <Box sx={{ mt: 2 }}>
              {stats?.categoryDistribution?.map((cat, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    borderBottom: index < stats.categoryDistribution.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2">{cat._id}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 100,
                        height: 8,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${(cat.count / stats.overview.totalProducts) * 100}%`,
                          height: '100%',
                          bgcolor: 'primary.main',
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {cat.count}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Shipment Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Shipment Status
            </Typography>
            <Box sx={{ mt: 2 }}>
              {stats?.statusDistribution?.map((status, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    borderBottom: index < stats.statusDistribution.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2">{status._id}</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {status.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <RecentActivity />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;