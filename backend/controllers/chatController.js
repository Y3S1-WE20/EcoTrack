const nlpService = require('../services/nlpService');
const co2Service = require('../services/co2Service');
const geminiService = require('../services/geminiService');
const badgeService = require('../services/badgeService');
const HabitLog = require('../models/HabitLog');
const Activity = require('../models/Activity');
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
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid message'
      });
    }

    console.log('Processing chat message:', message);

    // Parse the message using NLP service
    let parsed = nlpService.parseMessage(message);

    // Enhance with Gemini AI if available
    if (geminiService.isAvailable()) {
      try {
        const aiParsed = await geminiService.parseActivityWithAI(message, parsed);
        if (aiParsed && aiParsed.aiEnhanced) {
          parsed = aiParsed;
          console.log('Enhanced with Gemini AI:', parsed);
        }
      } catch (aiError) {
        console.error('Gemini AI parsing failed, using fallback:', aiError);
      }
    }

    if (!parsed) {
      // Try conversational response with Gemini AI
      if (geminiService.isAvailable()) {
        try {
          const conversationResponse = await geminiService.handleConversation(message);
          if (conversationResponse) {
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

      // Fallback to rule-based suggestions
      const suggestions = nlpService.generateSuggestions(message);
      
      return res.json({
        success: true,
        message: "I didn't quite understand that activity. Could you be more specific?",
        suggestions: suggestions[0],
        parsed: null,
        needsAuth: false
      });
    }

    console.log('Parsed activity:', parsed);

    // Calculate CO2 emissions
    const co2Result = co2Service.calculateEmissions(
      parsed.activityType,
      parsed.activity,
      parsed.amount,
      parsed.unit
    );

    if (co2Result.error) {
      return res.status(400).json({
        success: false,
        message: `Sorry, I couldn't calculate emissions for that activity: ${co2Result.error}`
      });
    }

    // Generate personalized suggestion
    let suggestion = co2Service.generateSuggestion(
      parsed.activityType,
      parsed.activity,
      parsed.amount,
      co2Result,
      req.user || null
    );

    // Enhance suggestion with Gemini AI if available
    if (geminiService.isAvailable() && req.user) {
      try {
        const aiSuggestion = await geminiService.generateSuggestion(
          parsed.activityType,
          parsed.activity,
          parsed.amount,
          parsed.unit,
          co2Result.absoluteEmissions,
          co2Result.impactCategory,
          req.user.profile || null
        );
        
        if (aiSuggestion && aiSuggestion.text) {
          suggestion = aiSuggestion.text;
        }
      } catch (aiError) {
        console.error('Gemini suggestion generation failed:', aiError);
      }
    }

    let habitLogId = null;
    let responseMessage = `Got it! ${co2Result.formattedEmission}`;

    // If user is authenticated, save to database
    if (req.user) {
      try {
        // Find or create activity
        let activity = await Activity.findOne({ 
          name: parsed.activity,
          category: parsed.activityType 
        });

        if (!activity) {
          activity = await Activity.create({
            name: parsed.activity,
            category: parsed.activityType,
            unit: parsed.unit,
            carbonFactor: co2Result.emissionFactor
          });
        }

        // Create habit log
        const habitLog = await HabitLog.create({
          user: req.user.userId, // Fixed: use userId instead of _id
          activity: activity._id,
          quantity: parsed.amount,
          unit: parsed.unit,
          carbonEmitted: co2Result.isSavings ? 0 : co2Result.absoluteEmissions,
          carbonSaved: co2Result.isSavings ? co2Result.absoluteEmissions : 0,
          notes: `Logged via chat: "${message}"`,
          parsedData: {
            originalMessage: message,
            confidence: parsed.confidence,
            activityType: parsed.activityType
          }
        });

        habitLogId = habitLog._id;
        responseMessage += ' I\'ve saved this to your activity log!';
        
        console.log('Created habit log:', habitLogId);

        // Check for badge achievements
        const newBadges = await badgeService.checkBadges(req.user.userId, habitLog); // Fixed: use userId instead of _id
        if (newBadges.length > 0) {
          const badgeNames = newBadges.map(b => b.badge.name).join(', ');
          responseMessage += ` 🏆 Congratulations! You earned: ${badgeNames}!`;
        }

      } catch (dbError) {
        console.error('Database error:', dbError);
        responseMessage += ' (Note: Could not save to your activity log due to a database error)';
      }
    } else {
      responseMessage += ' Sign in to automatically track your activities!';
    }

    res.json({
      success: true,
      message: responseMessage,
      parsed: {
        activity: parsed.activity,
        amount: parsed.amount,
        unit: parsed.unit,
        activityType: parsed.activityType
      },
      co2Data: {
        activity: co2Result.formattedEmission,
        amount: parsed.amount,
        unit: parsed.unit,
        co2Saved: co2Result.isSavings ? co2Result.absoluteEmissions : undefined,
        co2Emitted: co2Result.isSavings ? undefined : co2Result.absoluteEmissions
      },
      suggestion,
      habitLogId,
      needsAuth: !req.user
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