import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
} from '@mui/material';
import { Package, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { productAPI, shipmentAPI } from '@services/api';
import { formatDate } from '@utils/helpers';
import { useNavigate } from 'react-router-dom';

const RecentActivity = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      const [productsRes, shipmentsRes] = await Promise.all([
        productAPI.getProducts({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        shipmentAPI.getShipments({ page: 1, limit: 5 }),
      ]);

      const activities = [
        ...productsRes.data.products.map((p) => ({
          type: 'product',
          id: p.blockchainId,
          title: p.productName,
          subtitle: `Created by ${p.manufacturer.name}`,
          time: p.createdAt,
          status: p.status,
        })),
        ...shipmentsRes.data.shipments.map((s) => ({
          type: 'shipment',
          id: s.blockchainId,
          title: `Shipment #${s.trackingNumber}`,
          subtitle: `${s.from.name} → ${s.to.name}`,
          time: s.createdAt,
          status: s.status,
        })),
      ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10);

      setActivities(activities);
    } catch (error) {
      console.error('Fetch activity error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type, status) => {
    if (type === 'product') return <Package size={20} />;
    if (status === 'Delivered') return <CheckCircle size={20} />;
    if (status === 'Delayed') return <AlertCircle size={20} />;
    return <Truck size={20} />;
  };

  const getStatusColor = (status) => {
    const colors = {
      Created: 'primary',
      InTransit: 'warning',
      Delivered: 'success',
      Verified: 'info',
      Disputed: 'error',
      Pending: 'default',
      Delayed: 'error',
    };
    return colors[status] || 'default';
  };

  const handleClick = (activity) => {
    if (activity.type === 'product') {
      navigate(`/products/${activity.id}`);
    } else {
      navigate(`/shipments/${activity.id}`);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Loading activity...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Recent Activity
      </Typography>

      <List>
        {activities.map((activity, index) => (
          <ListItem
            key={index}
            sx={{
              borderRadius: 2,
              mb: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'grey.50',
              },
            }}
            onClick={() => handleClick(activity)}
          >
            <Avatar
              sx={{
                bgcolor: `${getStatusColor(activity.status)}.main`,
                mr: 2,
              }}
            >
              {getIcon(activity.type, activity.status)}
            </Avatar>

            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {activity.title}
                  </Typography>
                  <Chip
                    label={activity.status}
                    size="small"
                    color={getStatusColor(activity.status)}
                  />
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {activity.subtitle}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(activity.time)}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {activities.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No recent activity
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default RecentActivity;