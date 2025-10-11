const geminiService = require('../services/geminiService');
const { protect } = require('../middleware/auth');

/**
 * Chat Controller
 * Handles chatbot interactions, NLP parsing, and activity logging
 */

/**
 * Process chat message and extract activities
 * @route POST /api/v1/chat/message
 * @access Public (can work without auth for basic parsing)
 */
const processMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      console.log('Invalid message:', { message, type: typeof message, body: req.body });
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid message'
      });
    }

    console.log('Processing chat message:', message);

    // Use ONLY Gemini AI for all responses
    if (geminiService.isAvailable()) {
      try {
        console.log('Handling with Gemini AI');
        const conversationResponse = await geminiService.handleConversation(message);
        console.log('Gemini response:', conversationResponse);
        
        if (conversationResponse && conversationResponse.response) {
          return res.json({
            success: true,
            message: conversationResponse.response,
            type: 'conversation',
            aiEnhanced: true,
            needsAuth: false
          });
        }
      } catch (aiError) {
        console.error('Gemini conversation failed:', aiError);
      }
    }

    // If Gemini is not available or failed, return fallback message
    return res.status(503).json({
      success: false,
      message: 'AI service is currently unavailable. Please try again later.',
      error: 'Gemini AI not available'
    });

  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error processing your message. Please try again.'
    });
  }
};

/**
 * Get chat history for authenticated user
 * @route GET /api/v1/chat/history
 * @access Private
 */
const getChatHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get recent habit logs with chat data
    const habitLogs = await HabitLog.find({
      user: req.user.userId, // Fixed: use userId instead of _id
      'parsedData.originalMessage': { $exists: true }
    })
    .populate('activity', 'name category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const chatHistory = habitLogs.map(log => ({
      id: log._id,
      timestamp: log.createdAt,
      message: log.parsedData.originalMessage,
      activity: log.activity.name,
      activityType: log.activity.category,
      amount: log.quantity,
      unit: log.unit,
      co2Emitted: log.carbonEmitted,
      co2Saved: log.carbonSaved,
      confidence: log.parsedData.confidence
    }));

    res.json({
      success: true,
      chatHistory,
      pagination: {
        page,
        limit,
        total: await HabitLog.countDocuments({
          user: req.user.userId, // Fixed: use userId instead of _id
          'parsedData.originalMessage': { $exists: true }
        })
      }
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history'
    });
  }
};

/**
 * Get activity suggestions based on user's patterns
 * @route GET /api/v1/chat/suggestions
 * @access Private
 */
const getActivitySuggestions = async (req, res) => {
  try {
    // Get user's recent activities
    const recentLogs = await HabitLog.find({ user: req.user.userId }) // Fixed: use userId instead of _id
      .populate('activity', 'name category')
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate summary
    const weeklyActivities = recentLogs.filter(log => 
      log.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    const summary = co2Service.calculatePeriodSummary(weeklyActivities.map(log => ({
      activityType: log.activity.category,
      activity: log.activity.name,
      amount: log.quantity,
      unit: log.unit
    })));

    // Generate personalized suggestions
    const suggestions = [];

    // Suggest improvements based on high-emission activities
    const transportLogs = weeklyActivities.filter(log => log.activity.category === 'transportation');
    if (transportLogs.length > 0) {
      suggestions.push({
        type: 'improvement',
        title: 'Green Transport Challenge',
        description: 'Try walking or cycling for trips under 3km this week',
        potential_savings: '2-5 kg CO₂'
      });
    }

    // Suggest new eco-friendly activities
    if (summary.totalEmissions > 20) {
      suggestions.push({
        type: 'challenge',
        title: 'Carbon Reduction Goal',
        description: 'Aim to reduce your weekly emissions by 10%',
        target: `${(summary.totalEmissions * 0.9).toFixed(1)} kg CO₂`
      });
    }

    res.json({
      success: true,
      summary,
      suggestions,
      achievements: summary.achievements
    });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate suggestions'
    });
  }
};

module.exports = {
  processMessage,
  getChatHistory,
  getActivitySuggestions
};