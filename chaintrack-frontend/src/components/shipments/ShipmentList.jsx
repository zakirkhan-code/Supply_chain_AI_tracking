import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  Pagination,
  Tabs,
  Tab,
} from '@mui/material';
import { Search, Plus, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { shipmentAPI } from '@services/api';
import { ROLES, SHIPMENT_STATUS } from '@config/config';
import ShipmentCard from './ShipmentCard';
import Loading from '@components/common/Loading';
import { toast } from 'react-toastify';

const ShipmentList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState(0);

  const [filters, setFilters] = useState({
    status: '',
    from: '',
    to: '',
  });

  useEffect(() => {
    fetchShipments();
  }, [page, filters, activeTab]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        ...(filters.status && { status: filters.status }),
      };

      // Add user-specific filters based on tab
      if (activeTab === 1 && user?.walletAddress) {
        params.from = user.walletAddress;
      } else if (activeTab === 2 && user?.walletAddress) {
        params.to = user.walletAddress;
      }

      const response = await shipmentAPI.getShipments(params);
      setShipments(response.data.shipments);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Fetch shipments error:', error);
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Shipments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage all shipments
          </Typography>
        </Box>

        {[ROLES.MANUFACTURER, ROLES.DISTRIBUTOR, ROLES.RETAILER].includes(user?.role) && (
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => navigate('/shipments/create')}
            sx={{ textTransform: 'none' }}
          >
            Create Shipment
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="All Shipments" />
          <Tab label="Sent" />
          <Tab label="Received" />
        </Tabs>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by tracking number..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="InTransit">In Transit</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Delayed">Delayed</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Shipments Grid */}
      {loading ? (
        <Loading message="Loading shipments..." />
      ) : shipments.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {shipments.map((shipment) => (
              <Grid item xs={12} md={6} lg={4} key={shipment.blockchainId}>
                <ShipmentCard shipment={shipment} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Truck size={64} color="#cbd5e1" />
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
            No shipments found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or create a new shipment
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ShipmentList;