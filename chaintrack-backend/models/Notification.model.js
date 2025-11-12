import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'ProductCreated',
      'ShipmentCreated',
      'CheckpointAdded',
      'StatusUpdated',
      'DelayAlert',
      'Delivered',
      'Verified',
      'Disputed',
      'EnvironmentalAlert',
      'SystemNotification'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    productId: Number,
    shipmentId: Number,
    trackingNumber: String,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  channels: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    }
  },
  actionUrl: {
    type: String
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });

// Methods
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
};

// Statics
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this({
    recipient: data.recipient,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data || {},
    priority: data.priority || 'Medium',
    actionUrl: data.actionUrl
  });
  
  await notification.save();
  return notification;
};

notificationSchema.statics.getUnreadCount = async function(userAddress) {
  return await this.countDocuments({
    recipient: userAddress,
    isRead: false
  });
};

notificationSchema.statics.markAllAsRead = async function(userAddress) {
  return await this.updateMany(
    { recipient: userAddress, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;