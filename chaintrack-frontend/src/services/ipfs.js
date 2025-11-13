import axios from 'axios';
import { config } from '@config/config';

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_API_KEY = '3bf83b3b33dfdb329a4a';
const PINATA_SECRET_KEY = '55b2cced03c0c217adb2fc8306a097cfe362502267b486a886e4d265dbf7df79';

class IPFSService {
  constructor() {
    this.gateway = config.ipfsGateway;
  }

  // Upload file to IPFS
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          timestamp: Date.now(),
        },
      });
      formData.append('pinataMetadata', metadata);

      const response = await axios.post(
        `${PINATA_API_URL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
          maxBodyLength: Infinity,
        }
      );

      return {
        hash: response.data.IpfsHash,
        url: `https://${this.gateway}/ipfs/${response.data.IpfsHash}`,
        size: response.data.PinSize,
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw error;
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files) {
    try {
      const uploadPromises = files.map((file) => this.uploadFile(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Multiple upload error:', error);
      throw error;
    }
  }

  // Upload JSON data
  async uploadJSON(data) {
    try {
      const response = await axios.post(
        `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
        }
      );

      return {
        hash: response.data.IpfsHash,
        url: `https://${this.gateway}/ipfs/${response.data.IpfsHash}`,
      };
    } catch (error) {
      console.error('JSON upload error:', error);
      throw error;
    }
  }

  // Get file from IPFS
  getFileUrl(hash) {
    return `https://${this.gateway}/ipfs/${hash}`;
  }

  // Get file data
  async getFileData(hash) {
    try {
      const url = this.getFileUrl(hash);
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Get file error:', error);
      throw error;
    }
  }

  // Delete file from IPFS (unpin)
  async deleteFile(hash) {
    try {
      await axios.delete(`${PINATA_API_URL}/pinning/unpin/${hash}`, {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      });
      return true;
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }
}

export default new IPFSService();