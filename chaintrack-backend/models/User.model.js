import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  role: {
    type: String,
    enum: ['Manufacturer', 'Distributor', 'Retailer', 'Customer'],
    required: true
  },
  organization: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    userAgent: String
  }]
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ walletAddress: 1, email: 1 });

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    walletAddress: this.walletAddress,
    name: this.name,
    email: this.email,
    role: this.role,
    organization: this.organization,
    avatar: this.avatar,
    isVerified: this.isVerified
  };
});

// Methods
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.__v;
  delete user.verificationToken;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

userSchema.methods.updateLastLogin = async function(ipAddress, userAgent) {
  this.lastLogin = new Date();
  this.loginHistory.push({
    timestamp: new Date(),
    ipAddress,
    userAgent
  });
  
  // Keep only last 10 login records
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  
  await this.save();
};

const User = mongoose.model('User', userSchema);

export default User;