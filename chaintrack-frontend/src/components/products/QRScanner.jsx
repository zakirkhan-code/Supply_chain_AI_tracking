import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
  Grid,
} from '@mui/material';
import { Camera, Upload, CheckCircle, XCircle, Package, User } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { productAPI } from '@services/api';
import { formatAddress } from '@utils/helpers';
import { PRODUCT_STATUS_NAMES } from '@utils/constants';
import { toast } from 'react-toastify';

const QRScanner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const startScanner = () => {
    setScanning(true);
    setError('');
    setResult(null);

    const html5QrcodeScanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanError);
    setScanner(html5QrcodeScanner);
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    try {
      stopScanner();
      toast.info('QR Code detected, verifying...');

      // Verify product by QR
      const response = await productAPI.verifyByQR(decodedText, user?.walletAddress);

      if (response.data.exists) {
        setResult(response.data);
        toast.success('Product verified!');
      } else {
        setError('Product not found in the system');
        toast.error('Invalid QR code');
      }
    } catch (error) {
      console.error('Scan error:', error);
      setError('Failed to verify product');
      toast.error('Verification failed');
    }
  };

  const onScanError = (errorMessage) => {
    // Ignore continuous scanning errors
    console.log('Scan error:', errorMessage);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      const result = await html5QrCode.scanFile(file, true);
      onScanSuccess(result);
    } catch (error) {
      console.error('File scan error:', error);
      toast.error('Failed to scan QR from image');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Camera size={40} color="white" />
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            QR Code Scanner
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Scan product QR codes to verify authenticity
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Scanner Controls */}
        {!scanning && !result && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Camera />}
              onClick={startScanner}
              sx={{ mr: 2, mb: 2 }}
            >
              Start Camera Scanner
            </Button>

            <Button
              variant="outlined"
              size="large"
              component="label"
              startIcon={<Upload />}
              sx={{ mb: 2 }}
            >
              Upload QR Image
              <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
            </Button>
          </Box>
        )}

        {/* Scanner View */}
        {scanning && (
          <Box sx={{ mb: 3 }}>
            <div id="qr-reader" style={{ width: '100%' }}></div>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button variant="outlined" onClick={stopScanner}>
                Stop Scanner
              </Button>
            </Box>
          </Box>
        )}

        {/* Scan Result */}
        {result && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              {/* Success Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                {result.product.isAuthentic ? (
                  <>
                    <CheckCircle size={32} color="#10b981" />
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        Authentic Product
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Product verified successfully
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <XCircle size={32} color="#ef4444" />
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h6" fontWeight={600} color="error.main">
                        Disputed Product
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This product has been reported
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>

              {/* Product Details */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Package size={20} color="#64748b" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Product Name
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {result.product.productName}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Product ID
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    #{result.productId}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Batch Number
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {result.product.batchNumber}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {result.product.category}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={PRODUCT_STATUS_NAMES[result.product.status]}
                    size="small"
                    color="primary"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <User size={20} color="#64748b" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Manufacturer
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatAddress(result.product.manufacturer)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate(`/products/${result.productId}`)}
                >
                  View Full Details
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setResult(null);
                    setError('');
                  }}
                >
                  Scan Another
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            How to use:
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              <li>Click "Start Camera Scanner" to use your device camera</li>
              <li>Point your camera at the product QR code</li>
              <li>Wait for automatic detection and verification</li>
              <li>View product authenticity and details</li>
            </ol>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default QRScanner;