import { createContext, useState, useEffect } from 'react';
import { authAPI } from '@services/api';
import blockchainService from '@services/blockchain';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getProfile();
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (walletAddress, signature, message) => {
    try {
      const response = await authAPI.login({
        walletAddress,
        signature,
        message,
      });

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data) => {
    try {
      // First register on blockchain
      await blockchainService.registerUser(data.name, data.email, data.role);

      // Then register in backend
      const response = await authAPI.register(data);

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data);
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};