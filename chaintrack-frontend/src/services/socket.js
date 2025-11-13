import { io } from 'socket.io-client';
import { config } from '@config/config';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  // Connect to socket
  connect() {
    if (this.socket?.connected) return;

    this.socket = io(config.socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join room (user's wallet address)
  joinRoom(userAddress) {
    if (this.socket) {
      this.socket.emit('join', userAddress);
      console.log(`Joined room: ${userAddress}`);
    }
  }

  // Listen to events
  on(eventName, callback) {
    if (this.socket) {
      this.socket.on(eventName, callback);
      this.listeners[eventName] = callback;
    }
  }

  // Remove event listener
  off(eventName) {
    if (this.socket && this.listeners[eventName]) {
      this.socket.off(eventName, this.listeners[eventName]);
      delete this.listeners[eventName];
    }
  }

  // Emit event
  emit(eventName, data) {
    if (this.socket) {
      this.socket.emit(eventName, data);
    }
  }

  // Listen to product events
  onProductCreated(callback) {
    this.on('product-created', callback);
  }

  onProductDisputed(callback) {
    this.on('product-disputed', callback);
  }

  // Listen to shipment events
  onShipmentUpdated(callback) {
    this.on('shipment-updated', callback);
  }

  onCheckpointAdded(callback) {
    this.on('checkpoint-added', callback);
  }

  // Remove all listeners
  removeAllListeners() {
    Object.keys(this.listeners).forEach((eventName) => {
      this.off(eventName);
    });
  }
}

export default new SocketService();