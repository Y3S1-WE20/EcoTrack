const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateOnboarding
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// @route   POST /api/v1/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', register);

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/v1/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/v1/auth/onboarding
// @desc    Update onboarding status and carbon profile
// @access  Private
router.put('/onboarding', protect, updateOnboarding);

module.exports = router;