import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Eye, QrCode, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateSimple, formatAddress } from '@utils/helpers';
import { PRODUCT_STATUS_NAMES, STATUS_COLORS } from '@utils/constants';
import { config } from '@config/config';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const getImageUrl = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url || `${config.ipfsGateway}/ipfs/${product.images[0].ipfsHash}`;
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  const statusName = PRODUCT_STATUS_NAMES[product.status] || 'Unknown';
  const statusColor = STATUS_COLORS[statusName] || 'bg-gray-100 text-gray-800';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
      onClick={() => navigate(`/products/${product.blockchainId}`)}
    >
      {/* Image */}
      <CardMedia
        component="img"
        height="200"
        image={getImageUrl()}
        alt={product.productName}
        sx={{ objectFit: 'cover' }}
      />

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Status & Category */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip
            label={statusName}
            size="small"
            className={statusColor}
            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
          />
          <Chip
            label={product.category}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>

        {/* Product Name */}
        <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
          {product.productName}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.description}
        </Typography>

        {/* Details */}
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Batch
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {product.batchNumber}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Quantity
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {product.quantity}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Manufacturer
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {formatAddress(product.manufacturer.address)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              Created
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {formatDateSimple(product.createdAt)}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton size="small" color="primary">
                <Eye size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="View QR Code">
              <IconButton size="small" color="primary">
                <QrCode size={18} />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Package size={14} color="#6b7280" />
            <Typography variant="caption" color="text.secondary">
              ID: {product.blockchainId}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;