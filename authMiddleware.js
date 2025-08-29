const jwt = require('jsonwebtoken');
const { User } = require('./models');
const config = require('../config');

// Middleware to verify JWT token and attach user to request
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Authentication token is required to access this resource'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.security.jwtSecret);
    
    // Get user from database
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account disabled',
        message: 'Your account has been disabled. Please contact support.'
      });
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    next();
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
        message: 'Authentication token has expired. Please log in again.'
      });
    }

    console.error('Authentication middleware error:', err);
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'Unable to authenticate request'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    // Verify token
    const decoded = jwt.verify(token, config.security.jwtSecret);
    
    // Get user from database
    const user = await User.findByPk(decoded.userId);
    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name
      };
    }

    next();
  } catch (err) {
    // If token is invalid, just continue without authentication
    next();
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    // For now, we'll implement basic role checking
    // You can extend this based on your role system
    if (roles && roles.length > 0) {
      // Add role checking logic here when you implement roles
      // For now, we'll just check if user exists
      return next();
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole
}; 