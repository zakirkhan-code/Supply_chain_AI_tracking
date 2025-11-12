import express from 'express';
import Analytics from '../models/Analytics.model.js';
import Product from '../models/Product.model.js';
import Shipment from '../models/Shipment.model.js';
import User from '../models/User.model.js';

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard statistics
// @access  Public
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get counts
    const [
      totalProducts,
      totalShipments,
      totalUsers,
      productsToday,
      shipmentsInTransit,
      deliveredToday
    ] = await Promise.all([
      Product.countDocuments(),
      Shipment.countDocuments(),
      User.countDocuments(),
      Product.countDocuments({ createdAt: { $gte: today } }),
      Shipment.countDocuments({ status: 'InTransit' }),
      Shipment.countDocuments({ 
        status: 'Delivered',
        actualArrival: { $gte: today }
      })
    ]);

    // Get category distribution
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get status distribution
    const statusDistribution = await Shipment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate on-time delivery rate
    const deliveredShipments = await Shipment.find({ status: 'Delivered' })
      .select('expectedArrival actualArrival')
      .limit(100);

    const onTimeDeliveries = deliveredShipments.filter(s => 
      new Date(s.actualArrival) <= new Date(s.expectedArrival)
    ).length;

    const onTimeRate = deliveredShipments.length > 0 
      ? (onTimeDeliveries / deliveredShipments.length) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          totalShipments,
          totalUsers,
          productsToday,
          shipmentsInTransit,
          deliveredToday
        },
        categoryDistribution,
        statusDistribution,
        performance: {
          onTimeDeliveryRate: Math.round(onTimeRate),
          totalDelivered: deliveredShipments.length
        }
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get trend data for charts
// @access  Public
router.get('/trends', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get daily product creation trend
    const productTrend = await Product.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get daily shipment creation trend
    const shipmentTrend = await Shipment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        products: productTrend,
        shipments: shipmentTrend
      }
    });
  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trend data',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/user/:address
// @desc    Get user-specific analytics
// @access  Public
router.get('/user/:address', async (req, res) => {
  try {
    const address = req.params.address.toLowerCase();

    const [
      productsManufactured,
      shipmentsCreated,
      shipmentsReceived,
      totalScans
    ] = await Promise.all([
      Product.countDocuments({ 'manufacturer.address': address }),
      Shipment.countDocuments({ 'from.address': address }),
      Shipment.countDocuments({ 'to.address': address }),
      Product.aggregate([
        { $match: { 'manufacturer.address': address } },
        { $group: { _id: null, totalScans: { $sum: '$analytics.totalScans' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        productsManufactured,
        shipmentsCreated,
        shipmentsReceived,
        totalScans: totalScans[0]?.totalScans || 0
      }
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user analytics',
      error: error.message
    });
  }
});

export default router;