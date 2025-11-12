import mongoose from 'mongoose';

const checkpointSchema = new mongoose.Schema({
  handler: {
    address: {
      type: String,
      required: true,
      ref: 'User'
    },
    name: String,
    role: String
  },
  location: {
    name: {
      type: String,
      required: true
    },
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    }
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  remarks: String,
  productStatus: {
    type: String,
    enum: ['Created', 'InTransit', 'Delivered', 'Verified', 'Disputed']
  },
  environmentalConditions: {
    temperature: {
      value: Number,
      unit: {
        type: String,
        default: 'Celsius'
      }
    },
    humidity: {
      value: Number,
      unit: {
        type: String,
        default: '%'
      }
    },
    pressure: Number,
    vibration: Number
  },
  photos: [{
    ipfsHash: String,
    url: String,
    caption: String,
    uploadedAt: Date
  }],
  blockchainTxHash: String
}, {
  _id: true,
  timestamps: true
});

const shipmentSchema = new mongoose.Schema({
  blockchainId: {
    type: Number,
    required: true,
    unique: true
  },
  product: {
    blockchainId: {
      type: Number,
      required: true,
      ref: 'Product'
    },
    name: String,
    batchNumber: String
  },
  from: {
    address: {
      type: String,
      required: true,
      ref: 'User'
    },
    name: String,
    organization: String
  },
  to: {
    address: {
      type: String,
      required: true,
      ref: 'User'
    },
    name: String,
    organization: String
  },
  trackingNumber: {
    type: String,
    required: true,
    unique: true
  },
  vehicleInfo: {
    type: String,
    vehicleNumber: String,
    driverName: String,
    driverContact: String,
    vehicleType: String
  },
  departureTime: {
    type: Date,
    required: true
  },
  expectedArrival: {
    type: Date,
    required: true
  },
  actualArrival: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'InTransit', 'Delivered', 'Delayed', 'Cancelled'],
    default: 'Pending'
  },
  checkpoints: [checkpointSchema],
  route: {
    origin: {
      name: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    destination: {
      name: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    distance: {
      value: Number,
      unit: {
        type: String,
        default: 'km'
      }
    },
    estimatedDuration: {
      value: Number,
      unit: {
        type: String,
        default: 'hours'
      }
    }
  },
  currentLocation: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    address: String,
    lastUpdated: Date
  },
  specialInstructions: String,
  handlingRequirements: [String],
  insurance: {
    provider: String,
    policyNumber: String,
    value: Number,
    currency: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['Invoice', 'PackingList', 'Certificate', 'CustomsDeclaration', 'Other']
    },
    name: String,
    ipfsHash: String,
    url: String,
    uploadedAt: Date
  }],
  blockchain: {
    transactionHash: String,
    blockNumber: Number,
    gasUsed: Number
  },
  aiPredictions: {
    predictedDelay: {
      value: Number,
      unit: String,
      confidence: Number,
      factors: [String],
      predictedAt: Date
    },
    riskScore: {
      value: Number,
      factors: [String],
      calculatedAt: Date
    }
  },
  notifications: [{
    type: {
      type: String,
      enum: ['StatusUpdate', 'DelayWarning', 'EnvironmentalAlert', 'Delivered', 'CheckpointAdded']
    },
    message: String,
    sentTo: [String],
    sentAt: Date,
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  alerts: [{
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical']
    },
    type: String,
    message: String,
    triggeredAt: Date,
    resolvedAt: Date,
    isResolved: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes
shipmentSchema.index({ blockchainId: 1, trackingNumber: 1 });
shipmentSchema.index({ 'from.address': 1, 'to.address': 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ 'product.blockchainId': 1 });

// Virtual for shipment duration
shipmentSchema.virtual('duration').get(function() {
  if (!this.actualArrival) return null;
  return Math.floor((this.actualArrival - this.departureTime) / (1000 * 60 * 60));
});

// Virtual for delay
shipmentSchema.virtual('delay').get(function() {
  if (!this.actualArrival) return null;
  const delay = Math.floor((this.actualArrival - this.expectedArrival) / (1000 * 60 * 60));
  return delay > 0 ? delay : 0;
});

// Virtual for progress percentage
shipmentSchema.virtual('progressPercentage').get(function() {
  if (this.status === 'Delivered') return 100;
  if (this.status === 'Pending') return 0;
  
  const now = Date.now();
  const total = this.expectedArrival - this.departureTime;
  const elapsed = now - this.departureTime;
  
  return Math.min(Math.floor((elapsed / total) * 100), 99);
});

// Methods
shipmentSchema.methods.addCheckpoint = async function(checkpointData) {
  this.checkpoints.push(checkpointData);
  
  if (this.status === 'Pending') {
    this.status = 'InTransit';
  }
  
  // Update current location
  this.currentLocation = {
    coordinates: checkpointData.location.coordinates,
    address: checkpointData.location.name,
    lastUpdated: new Date()
  };
  
  await this.save();
};

shipmentSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  
  if (newStatus === 'Delivered') {
    this.actualArrival = new Date();
  }
  
  await this.save();
};

shipmentSchema.methods.addAlert = async function(alertData) {
  this.alerts.push({
    severity: alertData.severity,
    type: alertData.type,
    message: alertData.message,
    triggeredAt: new Date(),
    isResolved: false
  });
  await this.save();
};

shipmentSchema.methods.addNotification = async function(notificationData) {
  this.notifications.push({
    type: notificationData.type,
    message: notificationData.message,
    sentTo: notificationData.sentTo,
    sentAt: new Date(),
    isRead: false
  });
  await this.save();
};

shipmentSchema.methods.checkDelayAndAlert = async function() {
  const now = Date.now();
  const expectedTime = this.expectedArrival.getTime();
  
  if (now > expectedTime && this.status !== 'Delivered') {
    const delayHours = Math.floor((now - expectedTime) / (1000 * 60 * 60));
    
    await this.addAlert({
      severity: delayHours > 24 ? 'Critical' : 'High',
      type: 'Delay',
      message: `Shipment is delayed by ${delayHours} hours`
    });
    
    this.status = 'Delayed';
    await this.save();
  }
};

const Shipment = mongoose.model('Shipment', shipmentSchema);

export default Shipment;