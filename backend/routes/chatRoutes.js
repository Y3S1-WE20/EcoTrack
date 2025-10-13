const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  processMessage,
  getChatHistory,
  getActivitySuggestions
} = require('../controllers/chatController');

// Middleware to optionally authenticate (doesn't require auth but uses it if present)
const optionalProtect = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    // If token provided, try to authenticate
    protect(req, res, (err) => {
      if (err) {
        // If auth fails, continue without user (don't block the request)
        req.user = null;
      }
      next();
    });
  } else {
    // No token provided, continue without user
    req.user = null;
    next();
  }
};

/**
 * @route   POST /api/v1/chat/message
 * @desc    Process chat message and extract activities
 * @access  Public (works better with auth)
 */
router.post('/message', optionalProtect, processMessage);

/**
 * @route   GET /api/v1/chat/history
 * @desc    Get chat history for authenticated user
 * @access  Private
 */
router.get('/history', protect, getChatHistory);

/**
 * @route   GET /api/v1/chat/suggestions
 * @desc    Get personalized activity suggestions
 * @access  Private
 */
router.get('/suggestions', protect, getActivitySuggestions);

module.exports = router;