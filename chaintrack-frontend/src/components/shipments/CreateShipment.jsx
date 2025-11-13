import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { ArrowLeft, Truck, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useContract } from '@hooks/useContract';
import { shipmentAPI, productAPI } from '@services/api';
import { validateShipmentForm } from '@utils/validation';
import { generateTrackingNumber } from '@utils/helpers';
import { toast } from 'react-toastify';

const CreateShipment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createShipment, loading: txLoading } = useContract();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    to: '',
    expectedArrival: '',
    trackingNumber: generateTrackingNumber(),
    vehicleInfo: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getProducts({
        manufacturer: user.walletAddress,
        status: 'Created',
        limit: 100,
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error('Failed to load products');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleProductChange = (event, value) => {
    setSelectedProduct(value);
    setFormData((prev) => ({
      ...prev,
      productId: value?.blockchainId || '',
    }));
    setErrors((prev) => ({ ...prev, productId: '' }));
  };

  const generateTracking = () => {
    setFormData((prev) => ({
      ...prev,
      trackingNumber: generateTrackingNumber(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateShipmentForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);

      // Step 1: Create shipment on blockchain
      toast.info('Creating shipment on blockchain...');
      const blockchainData = {
        productId: parseInt(formData.productId),
        to: formData.to,
        expectedArrival: formData.expectedArrival,
        trackingNumber: formData.trackingNumber,
        vehicleInfo: formData.vehicleInfo,
      };

      const txResult = await createShipment(blockchainData);

      // Step 2: Sync to backend
      toast.info('Syncing to database...');
      await shipmentAPI.syncShipment({
        blockchainId: txResult.shipmentId,
        productId: parseInt(formData.productId),
        fromAddress: user.walletAddress,
        toAddress: formData.to,
        trackingNumber: formData.trackingNumber,
        departureTime: Math.floor(Date.now() / 1000),
        expectedArrival: Math.floor(new Date(formData.expectedArrival).getTime() / 1000),
        vehicleInfo: formData.vehicleInfo,
        transactionHash: txResult.transactionHash,
      });

      toast.success('Shipment created successfully!');
      navigate(`/shipments/${txResult.shipmentId}`);
    } catch (error) {
      console.error('Create shipment error:', error);
      toast.error(error.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/shipments')} sx={{ mr: 2 }}>
            <ArrowLeft />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Create New Shipment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ship a product to another party
            </Typography>
          </Box>
        </Box>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Product Selection */}
            <Grid item xs={12}>
              <Autocomplete
                options={products}
                getOptionLabel={(option) => `${option.productName} (${option.batchNumber})`}
                value={selectedProduct}
                onChange={handleProductChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Product"
                    error={!!errors.productId}
                    helperText={errors.productId || 'Choose a product to ship'}
                    required
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Package size={16} />
                      <Box>
                        <Typography variant="body2">{option.productName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Batch: {option.batchNumber} | Qty: {option.quantity}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            {/* Recipient Address */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recipient Wallet Address"
                name="to"
                value={formData.to}
                onChange={handleChange}
                error={!!errors.to}
                helperText={errors.to || 'Enter the recipient\'s Ethereum address'}
                placeholder="0x..."
                required
              />
            </Grid>

            {/* Expected Arrival */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Expected Arrival"
                name="expectedArrival"
                value={formData.expectedArrival}
                onChange={handleChange}
                error={!!errors.expectedArrival}
                helperText={errors.expectedArrival}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().slice(0, 16),
                }}
                required
              />
            </Grid>

            {/* Tracking Number */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Tracking Number"
                  name="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={handleChange}
                  error={!!errors.trackingNumber}
                  helperText={errors.trackingNumber}
                  required
                />
                <Button variant="outlined" onClick={generateTracking} sx={{ whiteSpace: 'nowrap' }}>
                  Generate
                </Button>
              </Box>
            </Grid>

            {/* Vehicle Info */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Vehicle Information"
                name="vehicleInfo"
                value={formData.vehicleInfo}
                onChange={handleChange}
                error={!!errors.vehicleInfo}
                helperText={errors.vehicleInfo || 'Vehicle number, driver name, contact, etc.'}
                placeholder="e.g., TRK-123 | Driver: John Doe | Contact: +1234567890"
                required
              />
            </Grid>

            {/* Selected Product Info */}
            {selectedProduct && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Selected Product Details:
                  </Typography>
                  <Typography variant="body2">
                    Name: {selectedProduct.productName}
                  </Typography>
                  <Typography variant="body2">
                    Category: {selectedProduct.category}
                  </Typography>
                  <Typography variant="body2">
                    Quantity: {selectedProduct.quantity}
                  </Typography>
                  <Typography variant="body2">
                    Batch: {selectedProduct.batchNumber}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Info Alert */}
            <Grid item xs={12}>
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Important:</strong> Make sure the recipient address is correct. Shipment details will be recorded on the blockchain.
                </Typography>
              </Alert>
            </Grid>

            {/* Submit Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/shipments')}
                  disabled={loading || txLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || txLoading}
                  startIcon={loading || txLoading ? <CircularProgress size={20} /> : <Truck />}
                >
                  {loading || txLoading ? 'Creating...' : 'Create Shipment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateShipment;