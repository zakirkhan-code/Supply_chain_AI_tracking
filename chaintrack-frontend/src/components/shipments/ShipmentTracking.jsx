import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Thermometer,
  Droplets,
  Package,
  CheckCircle,
  Truck,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { shipmentAPI, aiAPI } from '@services/api';
import { formatDate, formatAddress, calculateProgress, isDelayed } from '@utils/helpers';
import { SHIPMENT_STATUS_NAMES, STATUS_COLORS, ROLES } from '@utils/constants';
import Loading from '@components/common/Loading';
import ShipmentMap from './ShipmentMap';
import AddCheckpoint from './AddCheckpoint';
import Modal from '@components/common/Modal';
import { toast } from 'react-toastify';

const ShipmentTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addCheckpointOpen, setAddCheckpointOpen] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    fetchShipmentDetails();
  }, [id]);

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true);
      const response = await shipmentAPI.getShipment(id);
      setShipment(response.data);
    } catch (error) {
      console.error('Fetch shipment error:', error);
      toast.error('Failed to load shipment details');
      navigate('/shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteShipment = async () => {
    try {
      await shipmentAPI.completeShipment(id);
      toast.success('Shipment completed successfully!');
      fetchShipmentDetails();
    } catch (error) {
      console.error('Complete shipment error:', error);
      toast.error('Failed to complete shipment');
    }
  };

  const handlePredictDelay = async () => {
    try {
      setLoadingAI(true);
      const response = await aiAPI.predictDelay(id);
      setAiPrediction(response.data);
      toast.success('AI prediction generated');
    } catch (error) {
      console.error('AI prediction error:', error);
      toast.error('Failed to generate prediction');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleCheckpointAdded = () => {
    setAddCheckpointOpen(false);
    fetchShipmentDetails();
    toast.success('Checkpoint added successfully!');
  };

  if (loading) {
    return <Loading message="Loading shipment details..." />;
  }

  if (!shipment) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Shipment not found</Alert>
      </Container>
    );
  }

  const statusName = SHIPMENT_STATUS_NAMES[shipment.status] || 'Unknown';
  const statusColor = STATUS_COLORS[statusName];
  const progress = calculateProgress(shipment.departureTime, shipment.expectedArrival);
  const delayed = isDelayed(shipment.expectedArrival, statusName);

  const canAddCheckpoint =
    shipment.status !== 'Delivered' &&
    (shipment.from.address === user?.walletAddress ||
      shipment.to.address === user?.walletAddress ||
      user?.role === ROLES.DISTRIBUTOR);

  const canComplete =
    shipment.status !== 'Delivered' &&
    shipment.to.address === user?.walletAddress;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/shipments')} sx={{ mr: 2 }}>
          <ArrowLeft />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            Shipment Tracking
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {shipment.trackingNumber}
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canAddCheckpoint && (
            <Button
              variant="outlined"
              startIcon={<MapPin />}
              onClick={() => setAddCheckpointOpen(true)}
            >
              Add Checkpoint
            </Button>
          )}

          {canComplete && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={handleCompleteShipment}
            >
              Complete Delivery
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Status Card */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip label={statusName} className={statusColor} />
                {delayed && (
                  <Chip
                    icon={<AlertTriangle size={16} />}
                    label="Delayed"
                    color="error"
                    size="small"
                  />
                )}
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {progress}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 1, mb: 3 }}
            />

            {/* Route Info */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MapPin size={20} color="#10b981" />
                      <Typography variant="subtitle2" fontWeight={600}>
                        From
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={600}>
                      {shipment.from.name || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatAddress(shipment.from.address)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      <Calendar size={14} />
                      <Typography variant="caption">
                        {formatDate(shipment.departureTime)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MapPin size={20} color="#ef4444" />
                      <Typography variant="subtitle2" fontWeight={600}>
                        To
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={600}>
                      {shipment.to.name || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatAddress(shipment.to.address)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      <Calendar size={14} />
                      <Typography variant="caption">
                        Expected: {formatDate(shipment.expectedArrival)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Vehicle Info */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Truck size={18} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Vehicle Information
                </Typography>
              </Box>
              <Typography variant="body2">{shipment.vehicleInfo}</Typography>
            </Box>
          </Paper>

          {/* Map */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Live Tracking Map
            </Typography>
            <ShipmentMap shipment={shipment} />
          </Paper>

          {/* Checkpoints Timeline */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Shipment Journey ({shipment.checkpoints?.length || 0} Checkpoints)
            </Typography>

            {shipment.checkpoints && shipment.checkpoints.length > 0 ? (
              <Stepper orientation="vertical" sx={{ mt: 2 }}>
                {shipment.checkpoints.map((checkpoint, index) => (
                  <Step key={index} active completed>
                    <StepLabel
                      icon={<MapPin size={20} />}
                      optional={
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(checkpoint.timestamp)}
                        </Typography>
                      }
                    >
                      <Typography variant="subtitle2" fontWeight={600}>
                        {checkpoint.location.name}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ pl: 2 }}>
                        {checkpoint.remarks && (
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {checkpoint.remarks}
                          </Typography>
                        )}

                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <User size={14} />
                              <Typography variant="caption">
                                {formatAddress(checkpoint.handler.address)}
                              </Typography>
                            </Box>
                          </Grid>

                          {checkpoint.environmentalConditions?.temperature && (
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Thermometer size={14} />
                                <Typography variant="caption">
                                  {checkpoint.environmentalConditions.temperature.value}°C
                                </Typography>
                              </Box>
                            </Grid>
                          )}

                          {checkpoint.environmentalConditions?.humidity && (
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Droplets size={14} />
                                <Typography variant="caption">
                                  {checkpoint.environmentalConditions.humidity.value}%
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No checkpoints added yet
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Product Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Product Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Package size={20} color="#64748b" />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {shipment.product?.name || 'Unknown'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Product ID: #{shipment.productId}
                </Typography>
              </Box>
            </Box>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate(`/products/${shipment.productId}`)}
            >
              View Product Details
            </Button>
          </Paper>

          {/* AI Predictions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              AI Predictions
            </Typography>

            {!aiPrediction && !shipment.aiPredictions?.predictedDelay ? (
              <Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Get AI-powered insights about potential delays
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePredictDelay}
                  disabled={loadingAI}
                  startIcon={loadingAI && <CircularProgress size={16} />}
                >
                  {loadingAI ? 'Analyzing...' : 'Predict Delays'}
                </Button>
              </Box>
            ) : (
              <Box>
                {(aiPrediction || shipment.aiPredictions?.predictedDelay) && (
                  <>
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Clock size={18} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Predicted Delay
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight={700}>
                        {aiPrediction?.predictedDelay || shipment.aiPredictions.predictedDelay.value} hours
                      </Typography>
                      <Typography variant="caption">
                        Confidence: {aiPrediction?.confidence || shipment.aiPredictions.predictedDelay.confidence}%
                      </Typography>
                    </Box>

                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Contributing Factors:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {(aiPrediction?.factors || shipment.aiPredictions.predictedDelay.factors).map(
                        (factor, index) => (
                          <Typography
                            key={index}
                            component="li"
                            variant="caption"
                            color="text.secondary"
                          >
                            {factor}
                          </Typography>
                        )
                      )}
                    </Box>
                  </>
                )}
              </Box>
            )}
          </Paper>

          {/* Current Location */}
          {shipment.currentLocation && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Current Location
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MapPin size={18} color="#ef4444" />
                <Typography variant="body2" fontWeight={600}>
                  {shipment.currentLocation.address || 'Unknown'}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Last updated: {formatDate(shipment.currentLocation.lastUpdated)}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Add Checkpoint Modal */}
      <Modal
        open={addCheckpointOpen}
        onClose={() => setAddCheckpointOpen(false)}
        title="Add Checkpoint"
        maxWidth="md"
      >
        <AddCheckpoint
          shipmentId={id}
          onSuccess={handleCheckpointAdded}
          onCancel={() => setAddCheckpointOpen(false)}
        />
      </Modal>
    </Container>
  );
};

export default ShipmentTracking;