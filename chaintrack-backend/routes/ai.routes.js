import express from 'express';
import aiService from '../services/ai.service.js';
import Shipment from '../models/Shipment.model.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   POST /api/ai/predict-delay
// @desc    Predict delivery delay for shipment
// @access  Private
router.post('/predict-delay', authMiddleware, async (req, res) => {
  try {
    const { shipmentId } = req.body;

    const shipment = await Shipment.findOne({ blockchainId: shipmentId });
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    const prediction = await aiService.predictDelay(shipment);

    // Update shipment with prediction
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

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Delay prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error predicting delay',
      error: error.message
    });
  }
});

// @route   POST /api/ai/detect-anomalies
// @desc    Detect anomalies in shipment
// @access  Private
router.post('/detect-anomalies', authMiddleware, async (req, res) => {
  try {
    const { shipmentId } = req.body;

    const shipment = await Shipment.findOne({ blockchainId: shipmentId });
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    const anomalies = await aiService.detectAnomalies(shipment);

    // Add alerts for critical anomalies
    for (const anomaly of anomalies) {
      if (anomaly.severity === 'High' || anomaly.severity === 'Critical') {
        await shipment.addAlert({
          severity: anomaly.severity,
          type: anomaly.type,
          message: anomaly.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        anomaliesDetected: anomalies.length,
        anomalies
      }
    });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error detecting anomalies',
      error: error.message
    });
  }
});

// @route   POST /api/ai/risk-score
// @desc    Calculate risk score for shipment
// @access  Private
router.post('/risk-score', authMiddleware, async (req, res) => {
  try {
    const { shipmentId } = req.body;

    const shipment = await Shipment.findOne({ blockchainId: shipmentId });
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    const riskScore = await aiService.calculateRiskScore(shipment);

    // Update shipment
    shipment.aiPredictions.riskScore = {
      value: riskScore.score,
      factors: Object.values(riskScore.factors),
      calculatedAt: new Date()
    };
    await shipment.save();

    res.json({
      success: true,
      data: riskScore
    });
  } catch (error) {
    console.error('Risk score calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating risk score',
      error: error.message
    });
  }
});

// @route   POST /api/ai/train
// @desc    Train AI model with latest data
// @access  Private (Admin only)
router.post('/train', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin (you can add admin role check)
    
    await aiService.trainWithExistingData();

    res.json({
      success: true,
      message: 'Model training initiated successfully'
    });
  } catch (error) {
    console.error('Model training error:', error);
    res.status(500).json({
      success: false,
      message: 'Error training model',
      error: error.message
    });
  }
});

export default router;