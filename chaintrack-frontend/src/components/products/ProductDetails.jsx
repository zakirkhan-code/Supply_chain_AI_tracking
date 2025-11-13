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
  Divider,
  Card,
  CardMedia,
  Dialog,
  DialogContent,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Alert,
} from '@mui/material';
import {
  ArrowLeft,
  Package,
  User,
  Calendar,
  Hash,
  QrCode,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Download,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { productAPI } from '@services/api';
import { config } from '@config/config';
import { formatDate, formatAddress } from '@utils/helpers';
import { PRODUCT_STATUS_NAMES, STATUS_COLORS, ROLES } from '@utils/constants';
import Loading from '@components/common/Loading';
import Modal from '@components/common/Modal';
import { toast } from 'react-toastify';
import QRCodeStyling from 'qr-code-styling';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProduct(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Fetch product error:', error);
      toast.error('Failed to load product details');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      await productAPI.verifyProduct(id, 'Product verified');
      toast.success('Product verified successfully');
      fetchProductDetails();
    } catch (error) {
      console.error('Verify error:', error);
      toast.error('Failed to verify product');
    }
  };

  const handleDispute = async () => {
    try {
      if (!disputeReason.trim()) {
        toast.error('Please provide a reason');
        return;
      }

      await productAPI.disputeProduct(id, disputeReason);
      toast.success('Product marked as disputed');
      setDisputeModalOpen(false);
      setDisputeReason('');
      fetchProductDetails();
    } catch (error) {
      console.error('Dispute error:', error);
      toast.error('Failed to dispute product');
    }
  };

  const downloadQR = () => {
    const qrCode = new QRCodeStyling({
      width: 512,
      height: 512,
      data: product.qrCodeHash,
      dotsOptions: {
        color: '#0ea5e9',
        type: 'rounded',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10,
      },
    });

    qrCode.download({
      name: `product-${product.blockchainId}-qr`,
      extension: 'png',
    });
  };

  if (loading) {
    return <Loading message="Loading product details..." />;
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Product not found</Alert>
      </Container>
    );
  }

  const statusName = PRODUCT_STATUS_NAMES[product.status] || 'Unknown';
  const statusColor = STATUS_COLORS[statusName];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/products')} sx={{ mr: 2 }}>
          <ArrowLeft />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            Product Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: #{product.blockchainId}
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<QrCode />}
            onClick={() => setQrModalOpen(true)}
          >
            View QR
          </Button>

          {[ROLES.DISTRIBUTOR, ROLES.RETAILER].includes(user?.role) &&
            product.status !== 'Verified' &&
            product.status !== 'Disputed' && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={handleVerify}
              >
                Verify
              </Button>
            )}

          {product.status !== 'Disputed' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<AlertTriangle />}
              onClick={() => setDisputeModalOpen(true)}
            >
              Dispute
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Info */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* Status & Category */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Chip label={statusName} className={statusColor} />
              <Chip label={product.category} variant="outlined" />
              {!product.isAuthentic && (
                <Chip label="⚠️ Disputed" color="error" />
              )}
            </Box>

            {/* Product Name */}
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {product.productName}
            </Typography>

            {/* Description */}
            <Typography variant="body1" color="text.secondary" paragraph>
              {product.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Details Grid */}
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Hash size={18} color="#64748b" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Batch Number
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {product.batchNumber}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Package size={18} color="#64748b" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Quantity
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {product.quantity} units
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <User size={18} color="#64748b" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Manufacturer
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {product.manufacturer?.name || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatAddress(product.manufacturer?.address)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Calendar size={18} color="#64748b" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Manufacturing Date
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatDate(product.manufacturingDate)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Blockchain Info */}
            {product.metadata?.blockchain && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Blockchain Details
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Network
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {product.metadata.blockchain.network}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Transaction
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" fontWeight={600}>
                      {formatAddress(product.metadata.blockchain.transactionHash)}
                    </Typography>
                    <IconButton
                      size="small"
                      href={`https://sepolia.etherscan.io/tx/${product.metadata.blockchain.transactionHash}`}
                      target="_blank"
                    >
                      <ExternalLink size={14} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>

          {/* Images */}
          {product.images && product.images.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Product Images
              </Typography>
              <Grid container spacing={2}>
                {product.images.map((image, index) => (
                  <Grid item xs={6} sm={4} key={index}>
                    <Card
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedImage(image.url);
                        setImageModalOpen(true);
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={image.url}
                        alt={`Product ${index + 1}`}
                        sx={{ objectFit: 'cover' }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* QR Code */}
          <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              QR Code
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'white',
                borderRadius: 2,
                border: 2,
                borderColor: 'primary.main',
                mb: 2,
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${product.qrCodeHash}`}
                alt="QR Code"
                style={{ width: '100%', maxWidth: 200 }}
              />
            </Box>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadQR}
            >
              Download QR
            </Button>
          </Paper>

          {/* Analytics */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Analytics
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Views
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {product.analytics?.totalViews || 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Scans
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {product.analytics?.totalScans || 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Unique Scanners
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {product.analytics?.uniqueScanners?.length || 0}
              </Typography>
            </Box>
          </Paper>

          {/* Ownership History */}
          {product.ownershipHistory && product.ownershipHistory.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Ownership History
              </Typography>
              <Timeline sx={{ p: 0, m: 0 }}>
                {product.ownershipHistory.map((owner, index) => (
                  <TimelineItem key={index}>
                    <TimelineSeparator>
                      <TimelineDot color="primary" />
                      {index < product.ownershipHistory.length - 1 && (
                        <TimelineConnector />
                      )}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body2" fontWeight={600}>
                        {owner.role || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatAddress(owner.owner)}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {formatDate(owner.transferredAt)}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* QR Modal */}
      <Dialog open={qrModalOpen} onClose={() => setQrModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Product QR Code
          </Typography>
          <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 2, display: 'inline-block' }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${product.qrCodeHash}`}
              alt="QR Code"
              style={{ width: '100%', maxWidth: 400 }}
            />
          </Box>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" startIcon={<Download />} onClick={downloadQR}>
              Download
            </Button>
            <Button variant="outlined" onClick={() => setQrModalOpen(false)}>
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={imageModalOpen} onClose={() => setImageModalOpen(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <img src={selectedImage} alt="Product" style={{ width: '100%' }} />
        </DialogContent>
      </Dialog>

      {/* Dispute Modal */}
      <Modal
        open={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        title="Report Product Dispute"
        actions={
          <>
            <Button onClick={() => setDisputeModalOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDispute}>
              Submit Dispute
            </Button>
          </>
        }
      >
        <Typography variant="body2" color="text.secondary" paragraph>
          Please provide a detailed reason for disputing this product
        </Typography>
        <textarea
          rows={4}
          value={disputeReason}
          onChange={(e) => setDisputeReason(e.target.value)}
          placeholder="Enter dispute reason..."
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontFamily: 'inherit',
            fontSize: '14px',
          }}
        />
      </Modal>
    </Container>
  );
};

export default ProductDetails;