import axios from 'axios';
import { config } from '@config/config';

// Create axios instance
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    console.error('API Error:', message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  getNonce: (address) => api.get(`/auth/nonce/${address}`),
  
  register: (data) => api.post('/auth/register', data),
  
  login: (data) => api.post('/auth/login', data),
  
  getProfile: () => api.get('/auth/me'),
  
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Product APIs
export const productAPI = {
  syncProduct: (data) => api.post('/products/sync', data),
  
  getProducts: (params) => api.get('/products', { params }),
  
  getProduct: (id) => api.get(`/products/${id}`),
  
  verifyByQR: (qrHash, scanner) => 
    api.get(`/products/qr/${qrHash}?scanner=${scanner}`),
  
  verifyProduct: (id, notes) => 
    api.post(`/products/${id}/verify`, { notes }),
  
  disputeProduct: (id, reason) => 
    api.post(`/products/${id}/dispute`, { reason }),
  
  getHistory: (id) => api.get(`/products/${id}/history`),
  
  getByManufacturer: (address) => 
    api.get(`/products/manufacturer/${address}`),
  
  updateProduct: (id, data) => api.put(`/products/${id}/update`, data),
};

// Shipment APIs
export const shipmentAPI = {
  syncShipment: (data) => api.post('/shipments/sync', data),
  
  getShipments: (params) => api.get('/shipments', { params }),
  
  getShipment: (id) => api.get(`/shipments/${id}`),
  
  addCheckpoint: (id, data) => 
    api.post(`/shipments/${id}/checkpoint`, data),
  
  completeShipment: (id) => api.put(`/shipments/${id}/complete`),
  
  trackShipment: (trackingNumber) => 
    api.get(`/shipments/${trackingNumber}/track`),
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  
  getTrends: (days) => api.get(`/analytics/trends?days=${days}`),
  
  getUserAnalytics: (address) => 
    api.get(`/analytics/user/${address}`),
};

// AI APIs
export const aiAPI = {
  predictDelay: (shipmentId) => 
    api.post('/ai/predict-delay', { shipmentId }),
  
  detectAnomalies: (shipmentId) => 
    api.post('/ai/detect-anomalies', { shipmentId }),
  
  calculateRiskScore: (shipmentId) => 
    api.post('/ai/risk-score', { shipmentId }),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () => api.put('/notifications/read-all'),
  
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export default api;