/**
 * EcoTrack AI Chat Routes - Simple & Reliable with Enhanced Features
 */

const express = require('express');
const router = express.Router();
const { 
  processMessage, 
  getChatHistory, 
  getAssistantStatus 
} = require('../controllers/simpleChatController');
const { 
  processEnhancedMessage 
} = require('../controllers/enhancedChatController');

/**
 * @route   POST /api/v1/chat/message
 * @desc    Chat with EcoTrack AI Assistant (simple)
 * @access  Public
 */
router.post('/message', processMessage);

/**
 * @route   POST /api/v1/chat/enhanced
 * @desc    Enhanced chat with multimedia and multilingual support
 * @access  Public
 */
router.post('/enhanced', processEnhancedMessage);

/**
 * @route   GET /api/v1/chat/history
 * @desc    Get chat history (future feature)
 * @access  Public
 */
router.get('/history', getChatHistory);

/**
 * @route   GET /api/v1/chat/status
 * @desc    Get AI assistant status for debugging
 * @access  Public
 */
router.get('/status', getAssistantStatus);

module.exports = router;