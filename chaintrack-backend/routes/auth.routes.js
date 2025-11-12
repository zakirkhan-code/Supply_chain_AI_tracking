import express from 'express';
import User from '../models/User.model.js';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Generate JWT token
const generateToken = (address) => {
  return jwt.sign(
    { address },
    process.env.JWT_SECRET || 'chaintrack_secret_key',
    { expiresIn: '7d' }
  );
};

// Verify signature middleware
const verifySignature = (message, signature, address) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    return false;
  }
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { walletAddress, name, email, role, organization, signature, message } = req.body;

    // Validate input
    if (!walletAddress || !name || !email || !role || !signature || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Verify signature
    if (!verifySignature(message, signature, walletAddress)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already registered'
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Create new user
    const user = new User({
      walletAddress: walletAddress.toLowerCase(),
      name,
      email: email.toLowerCase(),
      role,
      organization: organization || '',
      isActive: true,
      isVerified: false
    });

    await user.save();

    // Generate token
    const token = generateToken(user.walletAddress);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with wallet signature
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide wallet address, signature and message'
      });
    }

    // Verify signature
    if (!verifySignature(message, signature, walletAddress)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Find user
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Update last login
    await user.updateLastLogin(
      req.ip,
      req.headers['user-agent']
    );

    // Generate token
    const token = generateToken(user.walletAddress);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chaintrack_secret_key');
    const user = await User.findOne({ walletAddress: decoded.address });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chaintrack_secret_key');
    const user = await User.findOne({ walletAddress: decoded.address });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'phone', 'organization', 'avatar', 'preferences'];
    const updates = req.body;

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'preferences') {
          user.preferences = { ...user.preferences, ...updates[field] };
        } else {
          user[field] = updates[field];
        }
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @route   GET /api/auth/nonce/:address
// @desc    Get nonce for wallet signature
// @access  Public
router.get('/nonce/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Generate a nonce message
    const nonce = `ChainTrack Login\n\nNonce: ${Date.now()}\nAddress: ${address}`;

    res.json({
      success: true,
      data: { nonce }
    });
  } catch (error) {
    console.error('Nonce generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating nonce',
      error: error.message
    });
  }
});

export default router;