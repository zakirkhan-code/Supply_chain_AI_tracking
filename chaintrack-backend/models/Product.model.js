import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  blockchainId: {
    type: Number,
    required: true,
    unique: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Pharmaceuticals', 'Food', 'Textiles', 'Automotive', 'Chemicals', 'Other']
  },
  batchNumber: {
    type: String,
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  manufacturer: {
    address: {
      type: String,
      required: true,
      ref: 'User'
    },
    name: String,
    organization: String
  },
  manufacturingDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  },
  qrCodeHash: {
    type: String,
    required: true,
    unique: true
  },
  images: [{
    ipfsHash: String,
    url: String,
    uploadedAt: Date
  }],
  specifications: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        default: 'cm'
      }
    },
    color: String,
    material: String,
    customFields: mongoose.Schema.Types.Mixed
  },
  pricing: {
    manufacturerPrice: Number,
    distributorPrice: Number,
    retailPrice: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  status: {
    type: String,
    enum: ['Created', 'InTransit', 'Delivered', 'Verified', 'Disputed'],
    default: 'Created'
  },
  isAuthentic: {
    type: Boolean,
    default: true
  },
  verifications: [{
    verifiedBy: {
      type: String,
      ref: 'User'
    },
    verifiedAt: Date,
    role: String,
    notes: String
  }],
  disputes: [{
    disputedBy: {
      type: String,
      ref: 'User'
    },
    disputedAt: Date,
    reason: String,
    status: {
      type: String,
      enum: ['Open', 'InvestigationInProgress', 'Resolved', 'Rejected'],
      default: 'Open'
    },
    resolution: String,
    resolvedAt: Date
  }],
  ownershipHistory: [{
    owner: {
      type: String,
      ref: 'User'
    },
    transferredAt: Date,
    role: String
  }],
  compliance: {
    certifications: [String],
    regulatoryApprovals: [String],
    safetyStandards: [String]
  },
  metadata: {
    blockchain: {
      network: String,
      transactionHash: String,
      blockNumber: Number
    },
    ipfs: {
      metadataHash: String,
      gatewayUrl: String
    }
  },
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalScans: {
      type: Number,
      default: 0
    },
    lastScannedAt: Date,
    uniqueScanners: [String]
  }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ blockchainId: 1, qrCodeHash: 1, batchNumber: 1 });
productSchema.index({ 'manufacturer.address': 1 });
productSchema.index({ status: 1 });
productSchema.index({ category: 1 });

// Virtual for product age
productSchema.virtual('productAge').get(function() {
  return Math.floor((Date.now() - this.manufacturingDate) / (1000 * 60 * 60 * 24));
});

// Methods
productSchema.methods.incrementViews = async function() {
  this.analytics.totalViews += 1;
  await this.save();
};

productSchema.methods.recordScan = async function(scannerAddress) {
  this.analytics.totalScans += 1;
  this.analytics.lastScannedAt = new Date();
  
  if (!this.analytics.uniqueScanners.includes(scannerAddress)) {
    this.analytics.uniqueScanners.push(scannerAddress);
  }
  
  await this.save();
};

productSchema.methods.addVerification = async function(verifierAddress, role, notes) {
  this.verifications.push({
    verifiedBy: verifierAddress,
    verifiedAt: new Date(),
    role,
    notes
  });
  await this.save();
};

productSchema.methods.addDispute = async function(disputerAddress, reason) {
  this.disputes.push({
    disputedBy: disputerAddress,
    disputedAt: new Date(),
    reason,
    status: 'Open'
  });
  this.status = 'Disputed';
  this.isAuthentic = false;
  await this.save();
};

const Product = mongoose.model('Product', productSchema);

export default Product;