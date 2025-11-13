import { ethers } from 'ethers';
import { config } from '@config/config';
import { CONTRACT_ABI } from '@config/contractABI';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  // Initialize provider
  async initProvider() {
    if (window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      return true;
    }
    throw new Error('MetaMask not installed');
  }

  // Connect wallet
  async connectWallet() {
    try {
      await this.initProvider();
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      // Check network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== config.chainId) {
        await this.switchNetwork();
      }
      
      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(
        config.contractAddress,
        CONTRACT_ABI,
        this.signer
      );
      
      return {
        address: accounts[0],
        chainId: Number(network.chainId),
      };
    } catch (error) {
      console.error('Connect wallet error:', error);
      throw error;
    }
  }

  // Switch network
  async switchNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${config.chainId.toString(16)}` }],
      });
    } catch (error) {
      // Network not added, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${config.chainId.toString(16)}`,
              chainName: config.networkName,
              rpcUrls: [config.rpcUrl],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }

  // Sign message
  async signMessage(message) {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return await this.signer.signMessage(message);
  }

  // Get contract instance
  getContract() {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return this.contract;
  }

  // Register user on blockchain
  async registerUser(name, email, role) {
    try {
      const tx = await this.contract.registerUser(name, email, role);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Register user error:', error);
      throw error;
    }
  }

  // Create product on blockchain
  async createProduct(productData) {
    try {
      const {
        productName,
        description,
        category,
        batchNumber,
        quantity,
        qrCodeHash,
        imageHashes,
      } = productData;

      const tx = await this.contract.createProduct(
        productName,
        description,
        category,
        batchNumber,
        quantity,
        qrCodeHash,
        imageHashes
      );

      const receipt = await tx.wait();
      
      // Get product ID from event
      const event = receipt.logs.find(
        (log) => log.fragment?.name === 'ProductCreated'
      );
      
      return {
        productId: Number(event.args[0]),
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  }

  // Get product from blockchain
  async getProduct(productId) {
    try {
      const product = await this.contract.getProduct(productId);
      return this.formatProduct(product);
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  }

  // Verify product by QR
  async verifyProductByQR(qrCodeHash) {
    try {
      const result = await this.contract.verifyProductByQR(qrCodeHash);
      return {
        exists: result[0],
        productId: Number(result[1]),
        product: result[0] ? this.formatProduct(result[2]) : null,
      };
    } catch (error) {
      console.error('Verify product error:', error);
      throw error;
    }
  }

  // Create shipment on blockchain
  async createShipment(shipmentData) {
    try {
      const { productId, to, expectedArrival, trackingNumber, vehicleInfo } =
        shipmentData;

      const tx = await this.contract.createShipment(
        productId,
        to,
        Math.floor(new Date(expectedArrival).getTime() / 1000),
        trackingNumber,
        vehicleInfo
      );

      const receipt = await tx.wait();
      
      const event = receipt.logs.find(
        (log) => log.fragment?.name === 'ShipmentCreated'
      );

      return {
        shipmentId: Number(event.args[0]),
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Create shipment error:', error);
      throw error;
    }
  }

  // Get shipment from blockchain
  async getShipment(shipmentId) {
    try {
      const shipment = await this.contract.getShipment(shipmentId);
      return this.formatShipment(shipment);
    } catch (error) {
      console.error('Get shipment error:', error);
      throw error;
    }
  }

  // Add checkpoint
  async addCheckpoint(shipmentId, checkpointData) {
    try {
      const {
        location,
        remarks,
        latitude,
        longitude,
        temperature,
        humidity,
      } = checkpointData;

      const tx = await this.contract.addCheckpoint(
        shipmentId,
        location,
        remarks,
        Math.floor(latitude * 1000000),
        Math.floor(longitude * 1000000),
        temperature,
        humidity
      );

      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Add checkpoint error:', error);
      throw error;
    }
  }

  // Complete shipment
  async completeShipment(shipmentId) {
    try {
      const tx = await this.contract.completeShipment(shipmentId);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Complete shipment error:', error);
      throw error;
    }
  }

  // Verify product
  async verifyProduct(productId) {
    try {
      const tx = await this.contract.verifyProduct(productId);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Verify product error:', error);
      throw error;
    }
  }

  // Dispute product
  async disputeProduct(productId, reason) {
    try {
      const tx = await this.contract.markProductAsDisputed(productId, reason);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Dispute product error:', error);
      throw error;
    }
  }

  // Get user info
  async getUserInfo(address) {
    try {
      const user = await this.contract.getUserInfo(address);
      return {
        userAddress: user.userAddress,
        name: user.name,
        email: user.email,
        role: Number(user.role),
        isActive: user.isActive,
        registeredAt: Number(user.registeredAt),
      };
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  // Format product data
  formatProduct(product) {
    return {
      productId: Number(product.productId),
      productName: product.productName,
      description: product.description,
      category: product.category,
      manufacturingDate: Number(product.manufacturingDate),
      manufacturer: product.manufacturer,
      batchNumber: product.batchNumber,
      quantity: Number(product.quantity),
      status: Number(product.status),
      isAuthentic: product.isAuthentic,
      createdAt: Number(product.createdAt),
      qrCodeHash: product.qrCodeHash,
      imageHashes: product.imageHashes,
    };
  }

  // Format shipment data
  formatShipment(shipment) {
    return {
      shipmentId: Number(shipment[0]),
      productId: Number(shipment[1]),
      from: shipment[2],
      to: shipment[3],
      departureTime: Number(shipment[4]),
      expectedArrival: Number(shipment[5]),
      actualArrival: Number(shipment[6]),
      status: Number(shipment[7]),
      trackingNumber: shipment[8],
      vehicleInfo: shipment[9],
    };
  }

  // Listen to events
  listenToEvents(eventName, callback) {
    if (!this.contract) return;

    this.contract.on(eventName, (...args) => {
      callback(...args);
    });
  }

  // Remove event listener
  removeEventListener(eventName) {
    if (!this.contract) return;
    this.contract.removeAllListeners(eventName);
  }
}

export default new BlockchainService();