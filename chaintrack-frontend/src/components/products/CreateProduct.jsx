import React, { useState } from 'react';
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
} from '@mui/material';
import { ArrowLeft, Upload, X, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useContract } from '@hooks/useContract';
import { productAPI } from '@services/api';
import ipfsService from '@services/ipfs';
import { CATEGORIES } from '@config/config';
import { validateProductForm } from '@utils/validation';
import { generateBatchNumber } from '@utils/helpers';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';

const CreateProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createProduct, loading: txLoading } = useContract();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    category: '',
    batchNumber: '',
    quantity: '',
    expiryDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const generateBatch = () => {
    const batch = generateBatchNumber(formData.category || 'PRD');
    setFormData((prev) => ({ ...prev, batchNumber: batch }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateProductForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (imageFiles.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Upload images to IPFS
      toast.info('Uploading images to IPFS...');
      const imageUploads = await ipfsService.uploadMultipleFiles(imageFiles);
      const imageHashes = imageUploads.map((upload) => upload.hash);

      // Step 2: Generate QR code
      toast.info('Generating QR code...');
      const qrData = JSON.stringify({
        productName: formData.productName,
        batchNumber: formData.batchNumber,
        manufacturer: user.walletAddress,
      });
      const qrCodeDataUrl = await QRCode.toDataURL(qrData);
      const qrBlob = await fetch(qrCodeDataUrl).then((r) => r.blob());
      const qrFile = new File([qrBlob], 'qr-code.png', { type: 'image/png' });
      
      const qrUpload = await ipfsService.uploadFile(qrFile);
      const qrCodeHash = qrUpload.hash;

      // Step 3: Create product on blockchain
      toast.info('Creating product on blockchain...');
      const blockchainData = {
        productName: formData.productName,
        description: formData.description,
        category: formData.category,
        batchNumber: formData.batchNumber,
        quantity: parseInt(formData.quantity),
        qrCodeHash,
        imageHashes,
      };

      const txResult = await createProduct(blockchainData);

      // Step 4: Sync to backend
      toast.info('Syncing to database...');
      await productAPI.syncProduct({
        blockchainId: txResult.productId,
        productName: formData.productName,
        description: formData.description,
        category: formData.category,
        batchNumber: formData.batchNumber,
        quantity: parseInt(formData.quantity),
        manufacturerAddress: user.walletAddress,
        manufacturerName: user.name,
        manufacturingDate: Math.floor(Date.now() / 1000),
        qrCodeHash,
        imageHashes,
        transactionHash: txResult.transactionHash,
        blockNumber: txResult.blockNumber,
      });

      toast.success('Product created successfully!');
      navigate(`/products/${txResult.productId}`);
    } catch (error) {
      console.error('Create product error:', error);
      toast.error(error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/products')} sx={{ mr: 2 }}>
            <ArrowLeft />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Create New Product
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add a new product to the supply chain
            </Typography>
          </Box>
        </Box>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Product Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                error={!!errors.productName}
                helperText={errors.productName}
                required
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                error={!!errors.category}
                helperText={errors.category}
                required
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Batch Number */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Batch Number"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  error={!!errors.batchNumber}
                  helperText={errors.batchNumber}
                  required
                />
                <Button variant="outlined" onClick={generateBatch} sx={{ whiteSpace: 'nowrap' }}>
                  Generate
                </Button>
              </Box>
            </Grid>

            {/* Quantity */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                error={!!errors.quantity}
                helperText={errors.quantity}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>

            {/* Expiry Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Expiry Date (Optional)"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Product Images (Max 5)
              </Typography>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload />}
                sx={{ mb: 2 }}
              >
                Upload Images
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </Button>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <Grid container spacing={2}>
                  {imagePreviews.map((preview, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={preview}
                          sx={{
                            width: '100%',
                            height: 150,
                            objectFit: 'cover',
                            borderRadius: 2,
                            border: 1,
                            borderColor: 'divider',
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' },
                          }}
                        >
                          <X size={16} />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>

            {/* Info Alert */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Note:</strong> Once created, the product will be registered on the blockchain and cannot be deleted. Make sure all information is correct.
                </Typography>
              </Alert>
            </Grid>

            {/* Submit Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/products')}
                  disabled={loading || txLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || txLoading}
                  startIcon={loading || txLoading ? <CircularProgress size={20} /> : <Package />}
                >
                  {loading || txLoading ? 'Creating...' : 'Create Product'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateProduct;