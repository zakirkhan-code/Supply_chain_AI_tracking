import express from 'express';
import Product from '../models/Product.model.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   POST /api/products/sync
// @desc    Sync product from blockchain to database
// @access  Private
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const {
      blockchainId,
      productName,
      description,
      category,
      batchNumber,
      quantity,
      manufacturerAddress,
      manufacturerName,
      manufacturingDate,
      qrCodeHash,
      imageHashes,
      transactionHash,
      blockNumber
    } = req.body;

    // Check if product already exists
    let product = await Product.findOne({ blockchainId });

    if (product) {
      return res.status(400).json({
        success: false,
        message: 'Product already synced'
      });
    }

    // Create new product
    product = new Product({
      blockchainId,
      productName,
      description,
      category,
      batchNumber,
      quantity,
      manufacturer: {
        address: manufacturerAddress.toLowerCase(),
        name: manufacturerName
      },
      manufacturingDate: new Date(manufacturingDate * 1000),
      qrCodeHash,
      images: imageHashes?.map(hash => ({
        ipfsHash: hash,
        url: `https://gateway.pinata.cloud/ipfs/${hash}`,
        uploadedAt: new Date()
      })) || [],
      status: 'Created',
      isAuthentic: true,
      ownershipHistory: [{
        owner: manufacturerAddress.toLowerCase(),
        transferredAt: new Date(),
        role: 'Manufacturer'
      }],
      metadata: {
        blockchain: {
          network: process.env.NETWORK_NAME || 'Polygon Mumbai',
          transactionHash,
          blockNumber
        }
      }
    });

    await product.save();

    // Emit socket event
    const io = req.app.get('io');
    io.emit('product-created', {
      productId: product.blockchainId,
      productName: product.productName,
      manufacturer: product.manufacturer.address
    });

    res.status(201).json({
      success: true,
      message: 'Product synced successfully',
      data: product
    });
  } catch (error) {
    console.error('Product sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing product',
      error: error.message
    });
  }
});

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      status,
      manufacturer,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (manufacturer) query['manufacturer.address'] = manufacturer.toLowerCase();
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const count = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by blockchain ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ blockchainId: req.params.id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await product.incrementViews();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// @route   GET /api/products/qr/:qrHash
// @desc    Verify product by QR code
// @access  Public
router.get('/qr/:qrHash', async (req, res) => {
  try {
    const product = await Product.findOne({ qrCodeHash: req.params.qrHash });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found with this QR code'
      });
    }

    // Record scan if scanner address provided
    if (req.query.scanner) {
      await product.recordScan(req.query.scanner.toLowerCase());
    }

    res.json({
      success: true,
      data: {
        exists: true,
        product,
        isAuthentic: product.isAuthentic,
        verifications: product.verifications.length
      }
    });
  } catch (error) {
    console.error('QR verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying QR code',
      error: error.message
    });
  }
});

// @route   POST /api/products/:id/verify
// @desc    Add verification to product
// @access  Private
router.post('/:id/verify', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({ blockchainId: req.params.id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { notes } = req.body;

    await product.addVerification(
      req.user.walletAddress,
      req.user.role,
      notes || ''
    );

    // Update product status
    product.status = 'Verified';
    await product.save();

    res.json({
      success: true,
      message: 'Product verified successfully',
      data: product
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying product',
      error: error.message
    });
  }
});

// @route   POST /api/products/:id/dispute
// @desc    Report product as disputed
// @access  Private
router.post('/:id/dispute', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({ blockchainId: req.params.id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide dispute reason'
      });
    }

    await product.addDispute(req.user.walletAddress, reason);

    // Emit socket event
    const io = req.app.get('io');
    io.emit('product-disputed', {
      productId: product.blockchainId,
      productName: product.productName,
      disputedBy: req.user.walletAddress,
      reason
    });

    res.json({
      success: true,
      message: 'Product marked as disputed',
      data: product
    });
  } catch (error) {
    console.error('Dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reporting dispute',
      error: error.message
    });
  }
});

// @route   GET /api/products/:id/history
// @desc    Get product ownership history
// @access  Public
router.get('/:id/history', async (req, res) => {
  try {
    const product = await Product.findOne({ blockchainId: req.params.id })
      .select('ownershipHistory productName batchNumber');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        productName: product.productName,
        batchNumber: product.batchNumber,
        history: product.ownershipHistory
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ownership history',
      error: error.message
    });
  }
});

// @route   GET /api/products/manufacturer/:address
// @desc    Get products by manufacturer
// @access  Public
router.get('/manufacturer/:address', async (req, res) => {
  try {
    const products = await Product.find({
      'manufacturer.address': req.params.address.toLowerCase()
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        count: products.length,
        products
      }
    });
  } catch (error) {
    console.error('Get manufacturer products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching manufacturer products',
      error: error.message
    });
  }
});

// @route   PUT /api/products/:id/update
// @desc    Update product information (off-chain only)
// @access  Private
router.put('/:id/update', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({ blockchainId: req.params.id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Only manufacturer can update
    if (product.manufacturer.address !== req.user.walletAddress) {
      return res.status(403).json({
        success: false,
        message: 'Only manufacturer can update product information'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['specifications', 'pricing', 'compliance'];
    const updates = req.body;

    allowedUpdates.forEach(field => {
      if (updates[field]) {
        product[field] = { ...product[field], ...updates[field] };
      }
    });

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

export default router;