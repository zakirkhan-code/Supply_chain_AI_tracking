import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { Wallet, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useWeb3 } from '@hooks/useWeb3';
import { formatAddress } from '@utils/helpers';
import { toast } from 'react-toastify';

const WalletConnect = ({ open, onClose, onConnect }) => {
  const { account, connectWallet, isConnected, isLoading } = useWeb3();
  const [error, setError] = useState('');

  const handleConnect = async () => {
    try {
      setError('');
      const result = await connectWallet();
      toast.success('Wallet connected successfully!');
      if (onConnect) {
        onConnect(result);
      }
    } catch (error) {
      console.error('Connect error:', error);
      setError(error.message || 'Failed to connect wallet');
      toast.error('Failed to connect wallet');
    }
  };

  const installMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  const hasMetaMask = typeof window.ethereum !== 'undefined';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Wallet size={24} />
          <Typography variant="h6" fontWeight={600}>
            Connect Wallet
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Already Connected */}
        {isConnected && account ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CheckCircle size={40} color="white" />
            </Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Wallet Connected
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {formatAddress(account)}
            </Typography>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{ mt: 2 }}
            >
              Continue
            </Button>
          </Box>
        ) : (
          <Box>
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* MetaMask Available */}
            {hasMetaMask ? (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                      component="img"
                      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                      alt="MetaMask"
                      sx={{ width: 48, height: 48 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        MetaMask
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Connect using MetaMask wallet
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleConnect}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <Wallet />}
                  >
                    {isLoading ? 'Connecting...' : 'Connect MetaMask'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* MetaMask Not Installed */
              <Card sx={{ mb: 2, bgcolor: 'warning.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AlertCircle size={24} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      MetaMask Not Detected
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    You need MetaMask to connect. MetaMask is a secure wallet for
                    Ethereum and other blockchains.
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    endIcon={<ExternalLink size={18} />}
                    onClick={installMetaMask}
                  >
                    Install MetaMask
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Info Box */}
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                ℹ️ What is a wallet?
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Wallets are used to send, receive, store, and display digital assets. It's
                also a way to sign in to dApps without needing to create new accounts and
                passwords on every website.
              </Typography>
            </Box>

            {/* Terms */}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
              By connecting, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnect;