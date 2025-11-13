// Role constants
export const ROLES = {
  NONE: 0,
  MANUFACTURER: 1,
  DISTRIBUTOR: 2,
  RETAILER: 3,
  CUSTOMER: 4,
};

export const ROLE_NAMES = {
  0: 'None',
  1: 'Manufacturer',
  2: 'Distributor',
  3: 'Retailer',
  4: 'Customer',
};

export const PRODUCT_STATUS_NAMES = {
  0: 'Created',
  1: 'In Transit',
  2: 'Delivered',
  3: 'Verified',
  4: 'Disputed',
};

export const SHIPMENT_STATUS_NAMES = {
  0: 'Pending',
  1: 'In Transit',
  2: 'Delivered',
  3: 'Delayed',
};

export const STATUS_COLORS = {
  Created: 'bg-blue-100 text-blue-800',
  'In Transit': 'bg-yellow-100 text-yellow-800',
  Delivered: 'bg-green-100 text-green-800',
  Verified: 'bg-purple-100 text-purple-800',
  Disputed: 'bg-red-100 text-red-800',
  Pending: 'bg-gray-100 text-gray-800',
  Delayed: 'bg-orange-100 text-orange-800',
};

export const ROLE_COLORS = {
  Manufacturer: 'bg-indigo-100 text-indigo-800',
  Distributor: 'bg-teal-100 text-teal-800',
  Retailer: 'bg-pink-100 text-pink-800',
  Customer: 'bg-cyan-100 text-cyan-800',
};

// Shipment status constants
export const SHIPMENT_STATUS = {
  PENDING: 0,
  IN_TRANSIT: 1,
  DELIVERED: 2,
  DELAYED: 3,
};