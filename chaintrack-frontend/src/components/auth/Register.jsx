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
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Wallet, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useWeb3 } from '@hooks/useWeb3';
import { authAPI } from '@services/api';
import { toast } from 'react-toastify';
import { ROLES } from '@config/config';
import { validateEmail } from '@utils/validation';

const steps = ['Connect Wallet', 'User Details', 'Complete'];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { account, connectWallet, signMessage } = useWeb3();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    organization: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      setError('');

      if (!account) {
        await connectWallet();
      }

      setActiveStep(1);
    } catch (error) {
      console.error('Connect wallet error:', error);
      setError('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      if (!validateForm()) return;

      setLoading(true);
      setError('');

      // Get nonce
      const nonceResponse = await authAPI.getNonce(account);
      const nonce = nonceResponse.data.nonce;

      // Sign message
      const signature = await signMessage(nonce);

      // Register
      await register({
        walletAddress: account,
        name: formData.name,
        email: formData.email,
        role: parseInt(formData.role),
        organization: formData.organization,
        signature,
        message: nonce,
      });

      setActiveStep(2);
      
      setTimeout(() => {
        toast.success('Registration successful!');
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed');
      toast.error('Registration failed');
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
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
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
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
            Create Account
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 4 }}
          >
            Join ChainTrack Supply Chain Network
          </Typography>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Step 1: Connect Wallet */}
          {activeStep === 0 && (
            <Box>
              {account ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Wallet Connected: {account.slice(0, 6)}...{account.slice(-4)}
                </Alert>
              ) : null}

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Wallet />}
                endIcon={<ArrowRight />}
                onClick={handleConnectWallet}
                disabled={loading}
                sx={{ py: 1.5, fontSize: '1rem', textTransform: 'none' }}
              >
                {account ? 'Continue to Registration' : 'Connect Wallet'}
              </Button>
            </Box>
          )}

          {/* Step 2: User Details */}
          {activeStep === 1 && (
            <Box>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                error={!!errors.role}
                helperText={errors.role}
                sx={{ mb: 2 }}
              >
                <MenuItem value={ROLES.MANUFACTURER}>Manufacturer</MenuItem>
                <MenuItem value={ROLES.DISTRIBUTOR}>Distributor</MenuItem>
                <MenuItem value={ROLES.RETAILER}>Retailer</MenuItem>
                <MenuItem value={ROLES.CUSTOMER}>Customer</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Organization (Optional)"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowLeft />}
                  onClick={() => setActiveStep(0)}
                  sx={{ flex: 1 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  endIcon={<ArrowRight />}
                  onClick={handleRegister}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 3: Complete */}
          {activeStep === 2 && (
            <Box textAlign="center">
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <Typography variant="h2">✓</Typography>
              </Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Registration Complete!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your account has been created successfully. Redirecting to dashboard...
              </Typography>
            </Box>
          )}

          {/* Login Link */}
          {activeStep < 2 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 3 }}>
              Already have an account?{' '}
              <Link
                component="button"
                onClick={() => navigate('/login')}
                sx={{ fontWeight: 600, cursor: 'pointer' }}
              >
                Login here
              </Link>
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;