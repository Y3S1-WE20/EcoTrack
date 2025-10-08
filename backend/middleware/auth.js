const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// Middleware to protect routes - requires valid JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from "Bearer TOKEN"
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.JWT_SECRET);
      
      // Check if user still exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Token is no longer valid. User not found.'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated'
        });
      }

      // Add user info to request object
      req.user = {
        userId: user._id,
        email: user.email,
        name: user.name,
        completedOnboarding: user.completedOnboarding
      };

      next();
    } catch (jwtError) {
      console.error('JWT verify error:', jwtError && jwtError.message ? jwtError.message : jwtError);
      return res.status(401).json({
        success: false,
        error: 'Token is not valid'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error in authentication'
    });
  }
};

// Middleware to check if user has completed onboarding
const requireOnboarding = (req, res, next) => {
  if (!req.user.completedOnboarding) {
    return res.status(403).json({
      success: false,
      error: 'Please complete onboarding first',
      requiresOnboarding: true
    });
  }
  next();
};

// Optional auth - doesn't fail if no token, but adds user info if token is valid
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (user && user.isActive) {
          req.user = {
            userId: user._id,
            email: user.email,
            name: user.name,
            completedOnboarding: user.completedOnboarding
          };
        }
      } catch (jwtError) {
        // Invalid token, but continue without user info
        req.user = null;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};

module.exports = {
  protect,
  requireOnboarding,
  optionalAuth
};