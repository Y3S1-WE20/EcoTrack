/**
 * Google Gemini AI Integration Service
 * Enhances natural language understanding and provides intelligent responses
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = null;
    this.model = null;
    this.isEnabled = false;

    console.log('🔍 Gemini Service Debug:');
    console.log('   API Key exists:', !!this.apiKey);
    console.log('   API Key length:', this.apiKey ? this.apiKey.length : 0);
    console.log('   API Key preview:', this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'none');

    // Initialize Gemini if API key is available
    if (this.apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        
        // Try different model names until one works
        const modelNames = ['gemini-pro', 'gemini-1.5-pro-latest', 'gemini-1.0-pro-latest'];
        let modelInitialized = false;
        
        for (const modelName of modelNames) {
          try {
            console.log(`🧪 Trying model: ${modelName}`);
            this.model = this.genAI.getGenerativeModel({ model: modelName });
            console.log(`✅ Successfully initialized model: ${modelName}`);
            modelInitialized = true;
            break;
          } catch (modelError) {
            console.log(`❌ Failed to initialize model ${modelName}:`, modelError.message);
          }
        }
        
        if (modelInitialized) {
          this.isEnabled = true;
          console.log('✅ Gemini AI service initialized');
          console.log('   Model created:', !!this.model);
          console.log('   Service enabled:', this.isEnabled);
        } else {
          throw new Error('No working Gemini model found');
        }
      } catch (error) {
        console.error('❌ Failed to initialize Gemini AI:', error.message);
        this.isEnabled = false;
      }
    } else {
      console.log('⚠️ Gemini AI disabled - no API key provided');
    }

    // Prompt templates for different contexts
    this.prompts = {
      activityParsing: `You are an eco-friendly assistant that helps parse activities related to carbon footprint tracking.
Your task is to extract structured information from user messages about their daily activities.

Extract the following information if present:
- Activity type (transportation, energy, food, waste)
- Specific activity (driving, walking, cycling, bus, train, etc.)
- Amount/quantity (numbers)
- Unit (km, miles, kWh, kg, etc.)

Respond with a JSON object only, no additional text:
{
  "activityType": "transportation|energy|food|waste|unknown",
  "activity": "specific activity name",
  "amount": number,
  "unit": "unit of measurement",
  "confidence": 0.0-1.0,
  "originalText": "relevant part of message",
  "suggestions": ["suggestion1", "suggestion2"] // if parsing failed
}

If you cannot parse the activity, set activityType to "unknown" and provide suggestions.

User message: "{{MESSAGE}}"`,

      suggestionGeneration: `You are an eco-friendly lifestyle coach. Generate personalized advice based on the user's carbon footprint activity.

Activity details:
- Type: {{ACTIVITY_TYPE}}
- Activity: {{ACTIVITY}}
- Amount: {{AMOUNT}} {{UNIT}}
- CO2 Impact: {{CO2_AMOUNT}} kg ({{IMPACT_LEVEL}})

User context (if available):
{{USER_CONTEXT}}

Provide a helpful, encouraging response that:
1. Acknowledges their activity
2. Provides one specific, actionable eco-tip
3. Suggests alternatives if applicable
4. Keeps a positive, motivational tone
5. Stays under 150 words

Response:`,

      conversational: `You are EcoTrack's friendly AI assistant. Help users with carbon footprint tracking and eco-friendly lifestyle advice.

Guidelines:
- Be encouraging and positive
- Provide practical, actionable advice
- Focus on environmental benefits
- Keep responses conversational and under 200 words
- If asked about activities, encourage specific logging like "I drove 10 km"

User message: "{{MESSAGE}}"

Response:`
    };
  }

  /**
   * Check if Gemini AI is available
   */
  isAvailable() {
    return this.isEnabled && this.model !== null;
  }

  /**
   * Enhanced activity parsing using Gemini AI
   * Falls back to rule-based parsing if Gemini fails
   */
  async parseActivityWithAI(message, fallbackParsed = null) {
    if (!this.isAvailable()) {
      return fallbackParsed;
    }

    try {
      const prompt = this.prompts.activityParsing.replace('{{MESSAGE}}', message);
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text().trim();

      // Try to parse JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Gemini returned invalid JSON:', responseText);
        return fallbackParsed;
      }

      // Validate response structure
      if (parsedResponse.activityType === 'unknown') {
        return {
          ...fallbackParsed,
          suggestions: parsedResponse.suggestions || [],
          aiEnhanced: true
        };
      }

      // Return enhanced parsed data
      return {
        activityType: parsedResponse.activityType,
        activity: parsedResponse.activity,
        amount: parsedResponse.amount,
        unit: parsedResponse.unit,
        confidence: Math.min(parsedResponse.confidence || 0.8, 1.0),
        originalText: parsedResponse.originalText || message,
        aiEnhanced: true,
        fallbackData: fallbackParsed
      };

    } catch (error) {
      console.error('Gemini activity parsing error:', error);
      return fallbackParsed;
    }
  }

  /**
   * Generate intelligent suggestions using Gemini AI
   */
  async generateSuggestion(activityType, activity, amount, unit, co2Amount, impactLevel, userContext = null) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      let prompt = this.prompts.suggestionGeneration
        .replace('{{ACTIVITY_TYPE}}', activityType)
        .replace('{{ACTIVITY}}', activity)
        .replace('{{AMOUNT}}', amount)
        .replace('{{UNIT}}', unit)
        .replace('{{CO2_AMOUNT}}', co2Amount.toFixed(1))
        .replace('{{IMPACT_LEVEL}}', impactLevel)
        .replace('{{USER_CONTEXT}}', userContext || 'No additional context available');

      const result = await this.model.generateContent(prompt);
      const suggestion = result.response.text().trim();

      return {
        text: suggestion,
        source: 'gemini_ai',
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Gemini suggestion generation error:', error);
      return null;
    }
  }

  /**
   * Handle general conversational queries
   */
  async handleConversation(message, context = {}) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const prompt = this.prompts.conversational.replace('{{MESSAGE}}', message);
      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim();

      return {
        response,
        type: 'conversation',
        source: 'gemini_ai',
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Gemini conversation error:', error);
      return null;
    }
  }

  /**
   * Generate eco-friendly challenges and tips
   */
  async generateWeeklyChallenge(userProfile, recentActivities) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const activitiesSummary = recentActivities.map(a => 
        `${a.activity}: ${a.amount}${a.unit} (${a.co2Impact}kg CO2)`
      ).join(', ');

      const prompt = `Generate a personalized weekly eco-challenge for a user based on their recent activities.

Recent activities: ${activitiesSummary}
User profile: ${JSON.stringify(userProfile)}

Create a specific, measurable challenge that:
1. Builds on their current habits
2. Is realistic and achievable
3. Has clear environmental benefits
4. Includes a specific target or goal

Respond with a JSON object:
{
  "title": "Challenge title",
  "description": "Detailed description",
  "target": "Specific measurable goal",
  "potential_impact": "Expected CO2 savings",
  "tips": ["tip1", "tip2", "tip3"],
  "duration": "7 days"
}`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text().trim();

      try {
        const challenge = JSON.parse(responseText);
        return {
          ...challenge,
          source: 'gemini_ai',
          generated_at: new Date().toISOString()
        };
      } catch (jsonError) {
        console.error('Gemini returned invalid JSON for challenge:', responseText);
        return null;
      }

    } catch (error) {
      console.error('Gemini challenge generation error:', error);
      return null;
    }
  }

  /**
   * Analyze user patterns and provide insights
   */
  async analyzePatterns(userActivities, timeframe = '30 days') {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const activitiesSummary = userActivities.map(a => 
        `${a.date}: ${a.activity} ${a.amount}${a.unit} = ${a.co2}kg CO2`
      ).join('\n');

      const prompt = `Analyze this user's carbon footprint patterns over the last ${timeframe} and provide insights.

Activities:
${activitiesSummary}

Provide analysis in JSON format:
{
  "insights": ["key insight 1", "key insight 2"],
  "trends": {
    "improving": ["areas getting better"],
    "concerning": ["areas needing attention"]
  },
  "recommendations": ["specific actionable advice"],
  "achievements": ["positive patterns to acknowledge"],
  "next_steps": ["what to focus on next"]
}`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text().trim();

      try {
        const analysis = JSON.parse(responseText);
        return {
          ...analysis,
          timeframe,
          source: 'gemini_ai',
          generated_at: new Date().toISOString()
        };
      } catch (jsonError) {
        console.error('Gemini returned invalid JSON for analysis:', responseText);
        return null;
      }

    } catch (error) {
      console.error('Gemini pattern analysis error:', error);
      return null;
    }
  }
}

module.exports = new GeminiService();