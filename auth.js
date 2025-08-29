const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('./models');
const config = require('../config');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// POST /api/auth/register
router.post('/register', validateRegistration, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email already registered',
        message: 'An account with this email already exists' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);
    
    // Create user
    const user = await User.create({ 
      email, 
      passwordHash, 
      name: name || null 
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      }, 
      config.security.jwtSecret, 
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      },
      token 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'Unable to create account. Please try again.' 
    });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account disabled',
        message: 'Your account has been disabled. Please contact support.' 
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect' 
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      }, 
      config.security.jwtSecret, 
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true,
      message: 'Login successful',
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        lastLogin: user.lastLogin 
      },
      token 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'Unable to log in. Please try again.' 
    });
  }
});

// GET /api/auth/profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided',
        message: 'Authentication token is required' 
      });
    }

    const decoded = jwt.verify(token, config.security.jwtSecret);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User account not found' 
      });
    }

    res.json({ 
      success: true,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt 
      }
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Authentication token is invalid' 
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Authentication token has expired' 
      });
    }
    
    console.error('Profile error:', err);
    res.status(500).json({ 
      error: 'Profile retrieval failed',
      message: 'Unable to retrieve profile. Please try again.' 
    });
  }
});

// PUT /api/auth/profile
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided',
        message: 'Authentication token is required' 
      });
    }

    const decoded = jwt.verify(token, config.security.jwtSecret);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User account not found' 
      });
    }

    const { name } = req.body;
    await user.update({ name });

    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        lastLogin: user.lastLogin 
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ 
      error: 'Profile update failed',
      message: 'Unable to update profile. Please try again.' 
    });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided',
        message: 'Authentication token is required' 
      });
    }

    const decoded = jwt.verify(token, config.security.jwtSecret);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User account not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Token is valid',
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      }
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Authentication token is invalid' 
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Authentication token has expired' 
      });
    }
    
    console.error('Token verification error:', err);
    res.status(500).json({ 
      error: 'Token verification failed',
      message: 'Unable to verify token. Please try again.' 
    });
  }
});

module.exports = router; 