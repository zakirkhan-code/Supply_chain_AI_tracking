import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
} from '@mui/material';
import { Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useWeb3 } from '@hooks/useWeb3';
import { authAPI } from '@services/api';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { account, connectWallet, signMessage } = useWeb3();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      // Step 1: Connect wallet if not connected
      let walletAddress = account;
      if (!walletAddress) {
        const result = await connectWallet();
        walletAddress = result.address;
      }

      // Step 2: Get nonce from backend
      const nonceResponse = await authAPI.getNonce(walletAddress);
      const nonce = nonceResponse.data.nonce;

      // Step 3: Sign message
      const signature = await signMessage(nonce);

      // Step 4: Login with signature
      await login(walletAddress, signature, nonce);

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Typography variant="h3">🔗</Typography>
          </Box>

          {/* Title */}
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome to ChainTrack
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Blockchain-powered Supply Chain Tracking
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Wallet Info */}
          {account && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </Alert>
          )}

          {/* Login Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Wallet />}
            endIcon={<ArrowRight />}
            onClick={handleLogin}
            disabled={loading}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              mb: 2,
            }}
          >
            {loading
              ? 'Connecting...'
              : account
              ? 'Sign Message to Login'
              : 'Connect Wallet'}
          </Button>

          {/* Register Link */}
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component="button"
              onClick={() => navigate('/register')}
              sx={{ fontWeight: 600, cursor: 'pointer' }}
            >
              Register here
            </Link>
          </Typography>

          {/* Info */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              🔒 Secure login using MetaMask wallet
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;