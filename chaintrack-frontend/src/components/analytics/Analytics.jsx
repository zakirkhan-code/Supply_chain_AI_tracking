import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Package, Truck, Users, CheckCircle } from 'lucide-react';
import { analyticsAPI } from '@services/api';
import Loading from '@components/common/Loading';
import { toast } from 'react-toastify';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [dashboard, trends] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getTrends(days),
      ]);

      setDashboardData(dashboard.data);

      // Format trend data
      const formattedTrends = trends.data.products.map((p, index) => ({
        date: p._id,
        products: p.count,
        shipments: trends.data.shipments[index]?.count || 0,
      }));
      setTrendData(formattedTrends);
    } catch (error) {
      console.error('Fetch analytics error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading analytics..." />;
  }

  const stats = [
    {
      title: 'Total Products',
      value: dashboardData?.overview?.totalProducts || 0,
      icon: <Package size={32} />,
      color: '#0ea5e9',
    },
    {
      title: 'Total Shipments',
      value: dashboardData?.overview?.totalShipments || 0,
      icon: <Truck size={32} />,
      color: '#10b981',
    },
    {
      title: 'Total Users',
      value: dashboardData?.overview?.totalUsers || 0,
      icon: <Users size={32} />,
      color: '#f59e0b',
    },
    {
      title: 'On-Time Delivery',
      value: `${dashboardData?.performance?.onTimeDeliveryRate || 0}%`,
      icon: <CheckCircle size={32} />,
      color: '#8b5cf6',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Analytics Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive insights and statistics
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Trends Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Products & Shipments Trends
              </Typography>
              <TextField
                select
                size="small"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                sx={{ width: 150 }}
              >
                <MenuItem value={7}>Last 7 days</MenuItem>
                <MenuItem value={30}>Last 30 days</MenuItem>
                <MenuItem value={90}>Last 90 days</MenuItem>
              </TextField>
            </Box>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="products"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  name="Products"
                />
                <Line
                  type="monotone"
                  dataKey="shipments"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Shipments"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Category Distribution
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData?.categoryDistribution || []}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {(dashboardData?.categoryDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Shipment Status Distribution
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData?.statusDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0ea5e9" name="Shipments" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;