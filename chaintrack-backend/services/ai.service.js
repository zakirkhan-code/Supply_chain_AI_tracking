// AI Service with graceful TensorFlow handling for Windows compatibility
let tf = null;
let tensorflowAvailable = false;

// Try to load TensorFlow with error handling
async function loadTensorFlow() {
  try {
    const tfModule = await import('@tensorflow/tfjs-node');
    tf = tfModule.default || tfModule;
    tensorflowAvailable = true;
    console.log('✅ TensorFlow.js loaded successfully');
    return true;
  } catch (error) {
    console.warn('⚠️  TensorFlow.js not available. Using fallback AI predictions.');
    console.warn('   To enable full AI features, run:');
    console.warn('   npm rebuild @tensorflow/tfjs-node --build-addon-from-source');
    return false;
  }
}

import Shipment from '../models/Shipment.model.js';

class AIService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
    this.tensorflowAvailable = false;
    this.featureScaler = {
      min: {},
      max: {}
    };
  }

  // Initialize
  async initialize() {
    this.tensorflowAvailable = await loadTensorFlow();
    
    if (!this.tensorflowAvailable) {
      console.log('📊 AI Service initialized with fallback predictions');
      return;
    }

    try {
      this.model = await tf.loadLayersModel('file://./models/delay_prediction_model/model.json');
      this.isModelLoaded = true;
      console.log('✅ AI Model loaded');
    } catch (err) {
      console.log('📦 Model not found, will create on first training');
    }
  }

  // Fallback rule-based prediction
  fallbackPrediction(shipmentData, historicalData) {
    const departureTime = new Date(shipmentData.departureTime).getTime();
    const expectedArrival = new Date(shipmentData.expectedArrival).getTime();
    const expectedDuration = (expectedArrival - departureTime) / (1000 * 60 * 60);
    
    let delayHours = 0;
    const factors = [];

    // Rule-based delay calculation
    if (shipmentData.route?.distance?.value > 500) {
      delayHours += 2;
      factors.push('Long distance route');
    }

    if (historicalData.averageDelay > 0) {
      delayHours += historicalData.averageDelay * 0.5;
      factors.push('Historical delays');
    }

    if (shipmentData.checkpoints?.length > 5) {
      delayHours += 1;
      factors.push('Multiple transit points');
    }

    const departureHour = new Date(shipmentData.departureTime).getHours();
    if (departureHour >= 18 || departureHour <= 6) {
      delayHours += 0.5;
      factors.push('Off-peak departure');
    }

    const dayOfWeek = new Date(shipmentData.departureTime).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      delayHours += 1;
      factors.push('Weekend shipment');
    }

    if (expectedDuration > 48) {
      delayHours += 1;
      factors.push('Extended travel time');
    }

    const confidence = historicalData.totalShipments > 10 ? 70 : 50;

    return {
      predictedDelay: Math.max(0, Math.round(delayHours)),
      confidence,
      factors: factors.length > 0 ? factors : ['Standard delivery expected'],
      riskLevel: this.calculateRiskLevel(delayHours),
      recommendation: this.generateRecommendation(delayHours, factors),
      method: 'rule-based'
    };
  }

  // Predict delay
  async predictDelay(shipmentData) {
    try {
      const historicalData = await this.getHistoricalPerformance(shipmentData.from);

      // Use fallback if TensorFlow not available
      if (!this.tensorflowAvailable || !this.isModelLoaded) {
        return this.fallbackPrediction(shipmentData, historicalData);
      }

      // TensorFlow prediction would go here
      // For now, using fallback
      return this.fallbackPrediction(shipmentData, historicalData);
      
    } catch (error) {
      console.error('Prediction error:', error);
      const historicalData = await this.getHistoricalPerformance(shipmentData.from);
      return this.fallbackPrediction(shipmentData, historicalData);
    }
  }

  async getHistoricalPerformance(fromAddress) {
    try {
      const historicalShipments = await Shipment.find({
        'from.address': fromAddress,
        status: 'Delivered'
      })
      .limit(50)
      .sort({ createdAt: -1 });

      if (historicalShipments.length === 0) {
        return { averageDelay: 0, successfulDeliveries: 0, totalShipments: 0 };
      }

      const totalDelay = historicalShipments.reduce((sum, shipment) => {
        const delay = (new Date(shipment.actualArrival) - new Date(shipment.expectedArrival)) / (1000 * 60 * 60);
        return sum + Math.max(0, delay);
      }, 0);

      const onTimeDeliveries = historicalShipments.filter(s => 
        new Date(s.actualArrival) <= new Date(s.expectedArrival)
      ).length;

      return {
        averageDelay: totalDelay / historicalShipments.length,
        successfulDeliveries: onTimeDeliveries,
        totalShipments: historicalShipments.length
      };
    } catch (error) {
      return { averageDelay: 0, successfulDeliveries: 0, totalShipments: 0 };
    }
  }

  calculateRiskLevel(delayHours) {
    if (delayHours <= 2) return 'Low';
    if (delayHours <= 6) return 'Medium';
    if (delayHours <= 12) return 'High';
    return 'Critical';
  }

  generateRecommendation(delayHours, factors) {
    if (delayHours <= 2) {
      return 'Shipment expected to arrive on time.';
    } else if (delayHours <= 6) {
      return 'Minor delay expected. Consider notifying recipient.';
    } else if (delayHours <= 12) {
      return 'Significant delay predicted. Optimize route or schedule alternative transport.';
    } else {
      return 'Critical delay risk. Consider expedited shipping.';
    }
  }

  async detectAnomalies(shipmentData) {
    const anomalies = [];

    const latestCheckpoint = shipmentData.checkpoints?.[shipmentData.checkpoints.length - 1];
    if (latestCheckpoint) {
      const temp = latestCheckpoint.environmentalConditions?.temperature?.value;
      const humidity = latestCheckpoint.environmentalConditions?.humidity?.value;

      if (temp && (temp < -10 || temp > 50)) {
        anomalies.push({
          type: 'temperature',
          severity: 'High',
          message: `Unusual temperature: ${temp}°C`,
          recommendation: 'Check product integrity'
        });
      }

      if (humidity && (humidity < 10 || humidity > 90)) {
        anomalies.push({
          type: 'humidity',
          severity: 'Medium',
          message: `Unusual humidity: ${humidity}%`,
          recommendation: 'Monitor moisture-sensitive products'
        });
      }
    }

    return anomalies;
  }

  async calculateRiskScore(shipmentData) {
    const prediction = await this.predictDelay(shipmentData);
    const anomalies = await this.detectAnomalies(shipmentData);
    
    let riskScore = 0;
    riskScore += Math.min((prediction.predictedDelay / 24) * 40, 40);
    riskScore += anomalies.length * 10;

    const historical = await this.getHistoricalPerformance(shipmentData.from?.address);
    const failureRate = 1 - (historical.successfulDeliveries / Math.max(historical.totalShipments, 1));
    riskScore += failureRate * 30;

    return {
      score: Math.min(Math.round(riskScore), 100),
      level: riskScore < 25 ? 'Low' : riskScore < 50 ? 'Medium' : riskScore < 75 ? 'High' : 'Critical',
      factors: {
        delayRisk: prediction.predictedDelay,
        anomalies: anomalies.length,
        historicalPerformance: `${Math.round((1 - failureRate) * 100)}% success rate`
      }
    };
  }

  async trainWithExistingData() {
    console.log('⚠️  Model training skipped (using rule-based predictions)');
    console.log('   To enable ML training, fix TensorFlow installation');
  }
}

const aiService = new AIService();
export default aiService;