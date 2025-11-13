export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Blockchain Configuration
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || '0x30473184138b6bB420617ce9D70567bA57B6dBD9',
  chainId: 11155111, // Sepolia testnet
  chainName: 'Sepolia',
  rpcUrl: 'https://sepolia.infura.io/v3/',
  
  // IPFS Configuration
  pinataApiKey: import.meta.env.VITE_PINATA_API_KEY,
  pinataSecretKey: import.meta.env.VITE_PINATA_SECRET_KEY,
  ipfsGateway: import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs',
  
  // Google Maps Configuration
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  
  // Socket.IO Configuration
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
};

// Role constants (also export from here for convenience)
export const ROLES = {
  NONE: 0,
  MANUFACTURER: 1,
  DISTRIBUTOR: 2,
  RETAILER: 3,
  CUSTOMER: 4,
};

// Categories
export const CATEGORIES = [
  'Electronics',
  'Pharmaceuticals',
  'Food & Beverages',
  'Textiles',
  'Automotive',
  'Chemicals',
  'Agriculture',
  'Other',
];

// Shipment status
export const SHIPMENT_STATUS = {
  PENDING: 0,
  IN_TRANSIT: 1,
  DELIVERED: 2,
  DELAYED: 3,
};