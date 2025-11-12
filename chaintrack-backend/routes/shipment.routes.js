import express from 'express';
import Shipment from '../models/Shipment.model.js';
import Product from '../models/Product.model.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import aiService from '../services/ai.service.js';

const router = express.Router();

// @route   POST /api/shipments/sync
// @desc    Sync shipment from blockchain
// @access  Private
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const {
      blockchainId,
      productId,
      fromAddress,
      toAddress,
      trackingNumber,
      departureTime,
      expectedArrival,
      vehicleInfo,
      transactionHash
    } = req.body;

    // Check if shipment exists
    let shipment = await Shipment.findOne({ blockchainId });
    if (shipment) {
      return res.status(400).json({
        success: false,
        message: 'Shipment already synced'
      });
    }

    // Get product details
    const product = await Product.findOne({ blockchainId: productId });

    // Create shipment
    shipment = new Shipment({
      blockchainId,
      product: {
        blockchainId: productId,
        name: product?.productName || 'Unknown',
        batchNumber: product?.batchNumber || ''
      },
      from: {
        address: fromAddress.toLowerCase(),
        name: req.user.name
      },
      to: {
        address: toAddress.toLowerCase()
      },
      trackingNumber,
      departureTime: new Date(departureTime * 1000),
      expectedArrival: new Date(expectedArrival * 1000),
      vehicleInfo,
      status: 'Pending',
      blockchain: {
        transactionHash
      }
    });

    await shipment.save();

    // Get AI prediction
    const prediction = await aiService.predictDelay(shipment);
    shipment.aiPredictions = {
      predictedDelay: {
        value: prediction.predictedDelay,
        unit: 'hours',
        confidence: prediction.confidence,
        factors: prediction.factors,
        predictedAt: new Date()
      }
    };
    await shipment.save();

    // Update product status
    if (product) {
      product.status = 'InTransit';
      await product.save();
    }

    res.status(201).json({
      success: true,
      message: 'Shipment synced successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Shipment sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing shipment',
      error: error.message
    });
  }
});

// @route   GET /api/shipments
// @desc    Get all shipments with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      status,
      from,
      to,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (from) query['from.address'] = from.toLowerCase();
    if (to) query['to.address'] = to.toLowerCase();

    const shipments = await Shipment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Shipment.countDocuments(query);

    res.json({
      success: true,
      data: {
        shipments,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipments',
      error: error.message
    });
  }
});

// @route   GET /api/shipments/:id
// @desc    Get shipment by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ blockchainId: req.params.id });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipment',
      error: error.message
    });
  }
});

// @route   POST /api/shipments/:id/checkpoint
// @desc    Add checkpoint to shipment
// @access  Private
router.post('/:id/checkpoint', authMiddleware, async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ blockchainId: req.params.id });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    const checkpointData = {
      handler: {
        address: req.user.walletAddress,
        name: req.user.name,
        role: req.user.role
      },
      location: {
        name: req.body.location,
        coordinates: {
          latitude: req.body.latitude,
          longitude: req.body.longitude
        }
      },
      remarks: req.body.remarks || '',
      environmentalConditions: {
        temperature: {
          value: req.body.temperature
        },
        humidity: {
          value: req.body.humidity
        }
      }
    };

    await shipment.addCheckpoint(checkpointData);

    // Emit socket event
    const io = req.app.get('io');
    io.to(shipment.to.address).emit('checkpoint-added', {
      shipmentId: shipment.blockchainId,
      checkpoint: checkpointData
    });

    res.json({
      success: true,
      message: 'Checkpoint added successfully',
      data: shipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding checkpoint',
      error: error.message
    });
  }
});

// @route   PUT /api/shipments/:id/complete
// @desc    Complete shipment delivery
// @access  Private
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ blockchainId: req.params.id });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    if (shipment.to.address !== req.user.walletAddress) {
      return res.status(403).json({
        success: false,
        message: 'Only recipient can complete shipment'
      });
    }

    await shipment.updateStatus('Delivered');

    // Update product
    const product = await Product.findOne({ blockchainId: shipment.product.blockchainId });
    if (product) {
      product.status = 'Delivered';
      product.ownershipHistory.push({
        owner: req.user.walletAddress,
        transferredAt: new Date(),
        role: req.user.role
      });
      await product.save();
    }

    res.json({
      success: true,
      message: 'Shipment completed successfully',
      data: shipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing shipment',
      error: error.message
    });
  }
});

// @route   GET /api/shipments/:id/track
// @desc    Track shipment real-time
// @access  Public
router.get('/:id/track', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingNumber: req.params.id })
      .select('trackingNumber status checkpoints currentLocation expectedArrival');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    res.json({
      success: true,
      data: {
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        expectedArrival: shipment.expectedArrival,
        currentLocation: shipment.currentLocation,
        checkpoints: shipment.checkpoints,
        progress: shipment.progressPercentage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error tracking shipment',
      error: error.message
    });
  }
});

export default router;