import { useState, useCallback } from 'react';
import blockchainService from '@services/blockchain';
import { toast } from 'react-toastify';

export const useContract = () => {
  const [loading, setLoading] = useState(false);

  const executeTransaction = useCallback(async (contractFunction, ...args) => {
    setLoading(true);
    try {
      const result = await contractFunction(...args);
      toast.success('Transaction successful!');
      return result;
    } catch (error) {
      console.error('Contract execution error:', error);
      toast.error(error.message || 'Transaction failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(
    async (productData) => {
      return executeTransaction(
        blockchainService.createProduct.bind(blockchainService),
        productData
      );
    },
    [executeTransaction]
  );

  const createShipment = useCallback(
    async (shipmentData) => {
      return executeTransaction(
        blockchainService.createShipment.bind(blockchainService),
        shipmentData
      );
    },
    [executeTransaction]
  );

  const addCheckpoint = useCallback(
    async (shipmentId, checkpointData) => {
      return executeTransaction(
        blockchainService.addCheckpoint.bind(blockchainService),
        shipmentId,
        checkpointData
      );
    },
    [executeTransaction]
  );

  const completeShipment = useCallback(
    async (shipmentId) => {
      return executeTransaction(
        blockchainService.completeShipment.bind(blockchainService),
        shipmentId
      );
    },
    [executeTransaction]
  );

  const verifyProduct = useCallback(
    async (productId) => {
      return executeTransaction(
        blockchainService.verifyProduct.bind(blockchainService),
        productId
      );
    },
    [executeTransaction]
  );

  const disputeProduct = useCallback(
    async (productId, reason) => {
      return executeTransaction(
        blockchainService.disputeProduct.bind(blockchainService),
        productId,
        reason
      );
    },
    [executeTransaction]
  );

  return {
    loading,
    createProduct,
    createShipment,
    addCheckpoint,
    completeShipment,
    verifyProduct,
    disputeProduct,
  };
};