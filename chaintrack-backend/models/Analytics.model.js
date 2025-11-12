import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  products: {
    totalCreated: {
      type: Number,
      default: 0
    },
    byCategory: {
      Electronics: { type: Number, default: 0 },
      Pharmaceuticals: { type: Number, default: 0 },
      Food: { type: Number, default: 0 },
      Textiles: { type: Number, default: 0 },
      Automotive: { type: Number, default: 0 },
      Chemicals: { type: Number, default: 0 },
      Other: { type: Number, default: 0 }
    },
    byStatus: {
      Created: { type: Number, default: 0 },
      InTransit: { type: Number, default: 0 },
      Delivered: { type: Number, default: 0 },
      Verified: { type: Number, default: 0 },
      Disputed: { type: Number, default: 0 }
    },
    totalScans: {
      type: Number,
      default: 0
    },
    uniqueScanners: {
      type: Number,
      default: 0
    }
  },
  shipments: {
    totalCreated: {
      type: Number,
      default: 0
    },
    byStatus: {
      Pending: { type: Number, default: 0 },
      InTransit: { type: Number, default: 0 },
      Delivered: { type: Number, default: 0 },
      Delayed: { type: Number, default: 0 },
      Cancelled: { type: Number, default: 0 }
    },
    totalCheckpoints: {
      type: Number,
      default: 0
    },
    averageDeliveryTime: {
      type: Number,
      default: 0
    },
    onTimeDeliveryRate: {
      type: Number,
      default: 0
    },
    totalDelays: {
      type: Number,
      default: 0
    }
  },
  users: {
    totalRegistrations: {
      type: Number,
      default: 0
    },
    byRole: {
      Manufacturer: { type: Number, default: 0 },
      Distributor: { type: Number, default: 0 },
      Retailer: { type: Number, default: 0 },
      Customer: { type: Number, default: 0 }
    },
    activeUsers: {
      type: Number,
      default: 0
    },
    totalLogins: {
      type: Number,
      default: 0
    }
  },
  blockchain: {
    totalTransactions: {
      type: Number,
      default: 0
    },
    totalGasUsed: {
      type: Number,
      default: 0
    },
    averageGasPrice: {
      type: Number,
      default: 0
    }
  },
  ai: {
    totalPredictions: {
      type: Number,
      default: 0
    },
    accurateDelayPredictions: {
      type: Number,
      default: 0
    },
    predictionAccuracy: {
      type: Number,
      default: 0
    },
    totalAnomaliesDetected: {
      type: Number,
      default: 0
    }
  },
  performance: {
    averageResponseTime: {
      type: Number,
      default: 0
    },
    totalApiCalls: {
      type: Number,
      default: 0
    },
    errorRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
analyticsSchema.index({ date: -1 });

// Static methods for aggregations
analyticsSchema.statics.getDateRangeStats = async function(startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: '$products.totalCreated' },
        totalShipments: { $sum: '$shipments.totalCreated' },
        totalUsers: { $sum: '$users.totalRegistrations' },
        totalScans: { $sum: '$products.totalScans' },
        averageDeliveryTime: { $avg: '$shipments.averageDeliveryTime' },
        onTimeDeliveryRate: { $avg: '$shipments.onTimeDeliveryRate' }
      }
    }
  ]);
};

analyticsSchema.statics.getTopCategories = async function(limit = 5) {
  const latestAnalytics = await this.findOne().sort({ date: -1 });
  
  if (!latestAnalytics) return [];
  
  const categories = Object.entries(latestAnalytics.products.byCategory)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  
  return categories;
};

analyticsSchema.statics.getTrendData = async function(days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .sort({ date: 1 })
  .select('date products.totalCreated shipments.totalCreated users.totalRegistrations');
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;