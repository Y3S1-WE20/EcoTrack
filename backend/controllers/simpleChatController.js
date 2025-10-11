/**
 * EcoTrack AI Chat Controller - Simple & Reliable
 */

const ecotrackAI = require('../services/ecotrackAI');

/**
 * Handle chat messages with EcoTrack AI Assistant
 */
const processMessage = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid message',
        error: 'INVALID_INPUT'
      });
    }

    console.log('\n📨 New chat message received:', message);

    // Check AI status
    const aiStatus = ecotrackAI.getStatus();
    console.log('🔍 AI Status:', aiStatus);

    if (!ecotrackAI.isReady()) {
      console.log('⚠️ AI not ready, returning error');
      return res.status(503).json({
        success: false,
        message: 'EcoTrack AI Assistant is currently offline. Please try again in a moment.',
        error: 'AI_OFFLINE',
        debug: aiStatus
      });
    }

    // Get AI response
    console.log('🚀 Sending message to AI...');
    const aiResponse = await ecotrackAI.chat(message.trim());
    
    console.log('📤 Sending response to client:', aiResponse);
    
    // Return response
    res.json(aiResponse);

  } catch (error) {
    console.error('\n❌ Chat Controller Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Sorry, something went wrong with the AI assistant. Please try again.',
      error: 'SERVER_ERROR'
    });
  }
};

/**
 * Get chat history (placeholder for future implementation)
 */
const getChatHistory = async (req, res) => {
  res.json({
    success: true,
    history: [],
    message: 'Chat history feature coming soon!'
  });
};

/**
 * Get AI assistant status for debugging
 */
const getAssistantStatus = async (req, res) => {
  const status = ecotrackAI.getStatus();
  const isReady = ecotrackAI.isReady();
  
  res.json({
    success: true,
    status: {
      ...status,
      isReady,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  processMessage,
  getChatHistory,
  getAssistantStatus
};