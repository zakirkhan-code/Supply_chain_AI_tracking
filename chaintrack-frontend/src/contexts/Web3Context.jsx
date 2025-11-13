import { createContext, useState, useEffect } from 'react';
import blockchainService from '@services/blockchain';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          await connectWallet();
        }
      }
    } catch (error) {
      console.error('Check connection error:', error);
    }
  };

  const setupEventListeners = () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const result = await blockchainService.connectWallet();
      setAccount(result.address);
      setChainId(result.chainId);
      setIsConnected(true);
      return result;
    } catch (error) {
      console.error('Connect wallet error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
  };

  const signMessage = async (message) => {
    try {
      return await blockchainService.signMessage(message);
    } catch (error) {
      console.error('Sign message error:', error);
      throw error;
    }
  };

  const value = {
    account,
    chainId,
    isConnected,
    isLoading,
    connectWallet,
    disconnectWallet,
    signMessage,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};