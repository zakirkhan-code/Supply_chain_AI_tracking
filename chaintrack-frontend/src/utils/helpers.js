import { format } from 'date-fns';

// Format address
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format date
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return format(date, 'MMM dd, yyyy HH:mm');
};

// Format date simple
export const formatDateSimple = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return format(date, 'MMM dd, yyyy');
};

// Format time ago
export const timeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

// Convert timestamp to date input format
export const timestampToDateInput = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toISOString().slice(0, 16);
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Copy failed:', error);
    return false;
  }
};

// Generate random tracking number
export const generateTrackingNumber = () => {
  const prefix = 'CT';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Generate batch number
export const generateBatchNumber = (category) => {
  const prefix = category.slice(0, 3).toUpperCase();
  const date = format(new Date(), 'yyyyMMdd');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}-${date}-${random}`;
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Validate Ethereum address
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Parse blockchain error
export const parseBlockchainError = (error) => {
  if (error.message.includes('user rejected')) {
    return 'Transaction rejected by user';
  }
  if (error.message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  if (error.message.includes('gas')) {
    return 'Gas estimation failed';
  }
  return error.message || 'Transaction failed';
};

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    Created: 'blue',
    'In Transit': 'yellow',
    Delivered: 'green',
    Verified: 'purple',
    Disputed: 'red',
    Pending: 'gray',
    Delayed: 'orange',
  };
  return colors[status] || 'gray';
};

// Get role badge color
export const getRoleColor = (role) => {
  const colors = {
    Manufacturer: 'indigo',
    Distributor: 'teal',
    Retailer: 'pink',
    Customer: 'cyan',
  };
  return colors[role] || 'gray';
};

// Calculate delivery progress
export const calculateProgress = (departureTime, expectedArrival) => {
  const now = Date.now() / 1000;
  const total = expectedArrival - departureTime;
  const elapsed = now - departureTime;
  const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
  return Math.round(progress);
};

// Check if delayed
export const isDelayed = (expectedArrival, status) => {
  const now = Date.now() / 1000;
  return status !== 'Delivered' && now > expectedArrival;
};

// Format coordinates
export const formatCoordinates = (lat, lng) => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};