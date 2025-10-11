/**
 * EcoTrack AI Chat Routes - Simple & Reliable
 */

const express = require('express');
const router = express.Router();
const { 
  processMessage, 
  getChatHistory, 
  getAssistantStatus 
} = require('../controllers/simpleChatController');

/**
 * @route   POST /api/v1/chat/message
 * @desc    Chat with EcoTrack AI Assistant
 * @access  Public
 */
router.post('/message', processMessage);

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