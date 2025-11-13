import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Eye, MapPin, Calendar, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateSimple, formatAddress, calculateProgress, isDelayed } from '@utils/helpers';
import { SHIPMENT_STATUS_NAMES, STATUS_COLORS } from '@utils/constants';

const ShipmentCard = ({ shipment }) => {
  const navigate = useNavigate();

  const statusName = SHIPMENT_STATUS_NAMES[shipment.status] || 'Unknown';
  const statusColor = STATUS_COLORS[statusName];
  const progress = calculateProgress(shipment.departureTime, shipment.expectedArrival);
  const delayed = isDelayed(shipment.expectedArrival, statusName);

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
      onClick={() => navigate(`/shipments/${shipment.blockchainId}`)}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip label={statusName} size="small" className={statusColor} />
          {delayed && (
            <Tooltip title="Delayed">
              <AlertTriangle size={20} color="#ef4444" />
            </Tooltip>
          )}
        </Box>

        {/* Tracking Number */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {shipment.trackingNumber}
        </Typography>

        {/* Product */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Product: {shipment.product?.name || `#${shipment.productId}`}
        </Typography>

        {/* Route */}
        <Box sx={{ my: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MapPin size={16} color="#64748b" />
            <Typography variant="caption" color="text.secondary">
              From
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {shipment.from?.name || formatAddress(shipment.from?.address)}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <ArrowRight size={20} color="#64748b" />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MapPin size={16} color="#64748b" />
            <Typography variant="caption" color="text.secondary">
              To
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={600}>
            {shipment.to?.name || formatAddress(shipment.to?.address)}
          </Typography>
        </Box>

        {/* Progress */}
        {shipment.status !== 'Delivered' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        )}

        {/* Dates */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Calendar size={14} color="#64748b" />
            <Typography variant="caption" color="text.secondary">
              Departure
            </Typography>
          </Box>
          <Typography variant="caption" fontWeight={600}>
            {formatDateSimple(shipment.departureTime)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Calendar size={14} color="#64748b" />
            <Typography variant="caption" color="text.secondary">
              Expected
            </Typography>
          </Box>
          <Typography variant="caption" fontWeight={600}>
            {formatDateSimple(shipment.expectedArrival)}
          </Typography>
        </Box>

        {/* Checkpoints */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Checkpoints: {shipment.checkpoints?.length || 0}
          </Typography>
          <Tooltip title="View Details">
            <IconButton size="small" color="primary">
              <Eye size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ShipmentCard;