/**
 * Natural Language Processing service for parsing activity messages
 * Uses rule-based pattern matching to extract activities from user messages
 */

class NLPService {
  constructor() {
    // Activity patterns with regex and extraction groups
    this.activityPatterns = [
      // Transportation patterns
      {
        pattern: /(?:i|we)\s+(?:drove|drive|driving)\s+(?:about\s+|around\s+)?(\d+(?:\.\d+)?)\s*(km|kilometers?|miles?|mi)\s*(?:to|for|in)?/i,
        activityType: 'transportation',
        activity: 'driving',
        extractors: {
          amount: 1,
          unit: 2
        }
      },
      {
        pattern: /(?:i|we)\s+(?:took|take|taking|rode|ride|riding)\s+(?:the\s+)?(?:bus|public\s+transport|transit)\s+(?:for\s+)?(?:about\s+|around\s+)?(\d+(?:\.\d+)?)\s*(km|kilometers?|miles?|mi)/i,
        activityType: 'transportation',
        activity: 'bus',
        extractors: {
          amount: 1,
          unit: 2
        }
      },
      {
        pattern: /(?:i|we)\s+(?:took|take|taking|rode|ride|riding)\s+(?:the\s+)?(?:train|subway|metro|rail)\s+(?:for\s+)?(?:about\s+|around\s+)?(\d+(?:\.\d+)?)\s*(km|kilometers?|miles?|mi)/i,
        activityType: 'transportation',
        activity: 'train',
        extractors: {
          amount: 1,
          unit: 2
        }
      },
      {
        pattern: /(?:i|we)\s+(?:walked|walk|walking)\s+(?:about\s+|around\s+)?(\d+(?:\.\d+)?)\s*(km|kilometers?|miles?|mi)/i,
        activityType: 'transportation',
        activity: 'walking',
        extractors: {
          amount: 1,
          unit: 2
        }
      },
      {
        pattern: /(?:i|we)\s+(?:cycled|biked|bike|biking|cycling)\s+(?:about\s+|around\s+)?(\d+(?:\.\d+)?)\s*(km|kilometers?|miles?|mi)/i,
        activityType: 'transportation',
        activity: 'cycling',
        extractors: {
          amount: 1,
          unit: 2
        }
      },
      {
        pattern: /(?:i|we)\s+(?:flew|fly|flying|took\s+(?:a\s+)?flight)\s+(?:about\s+|around\s+)?(\d+(?:\.\d+)?)\s*(km|kilometers?|miles?|mi)/i,
        activityType: 'transportation',
        activity: 'flying',
        extractors: {
          amount: 1,
          unit: 2
        }
      },
      
      // Energy consumption patterns
      {
        pattern: /(?:i|we)\s+(?:used|consumed|spent)\s+(?:about\s+|around\s+)?(\d+(?:\.\d+)?)\s*(kwh|kilowatt\s+hours?)\s+(?:of\s+)?(?:electricity|power|energy)/i,
        activityType: 'energy',
        activity: 'electricity',
        extractors: {
          amount: 1,
          unit: 2
        }
      },
      {
        pattern: /(?:i|we)\s+(?:used|consumed|spent)\s+(?:about\s+|around\s+)?(\d+(?:\.\d+)?)\s*(cubic\s+meters?|m3|liters?|gallons?)\s+(?:of\s+)?(?:gas|natural\s+gas)/i,
        activityType: 'energy',
        activity: 'natural_gas',
        extractors: {
          amount: 1,
          unit: 2
        }
      },
      
      // Food consumption patterns
      {
        pattern: /(?:i|we)\s+(?:ate|consumed|had)\s+(?:about\s+|around\s+)?(\d+(?:\.\d+)?)\s*(?:kg|kilograms?|lbs?|pounds?)\s+(?:of\s+)?(?:beef|red\s+meat)/i,
        activityType: 'food',
        activity: 'beef',
        extractors: {
          amount: 1,
          unit: 2
        }
      },
      {
        pattern: /(?:i|we)\s+(?:ate|consumed|had)\s+(?:about\s+|around\s+)?(\d+(?:\.\d+)?)\s*(?:kg|kilograms?|lbs?|pounds?)\s+(?:of\s+)?(?:chicken|poultry|white\s+meat)/i,
        activityType: 'food',
        activity: 'chicken',
        extractors: {
          amount: 1,
          unit: 2
        }
      },
      
      // Alternative patterns without explicit units (assume km for distance)
      {
        pattern: /(?:i|we)\s+(?:drove|drive|driving)\s+(?:about\s+|around\s+)?(\d+(?:\.\d+)?)\s*(?:to|for|today|yesterday)?/i,
        activityType: 'transportation',
        activity: 'driving',
        extractors: {
          amount: 1,
          unit: 'km' // default unit
        }
      },
      {
        pattern: /(?:i|we)\s+(?:walked|walk|walking)\s+(?:about\s+|around\s+)?(\d+(?:\.\d+)?)\s*(?:today|yesterday)?/i,
        activityType: 'transportation',
        activity: 'walking',
        extractors: {
          amount: 1,
          unit: 'km' // default unit
        }
      }
    ];

    // Unit conversion factors to standardize units
    this.unitConversions = {
      // Distance conversions to km
      'km': 1,
      'kilometers': 1,
      'kilometer': 1,
      'miles': 1.60934,
      'mile': 1.60934,
      'mi': 1.60934,
      
      // Energy conversions
      'kwh': 1,
      'kilowatt hours': 1,
      'kilowatt hour': 1,
      
      // Volume conversions to liters
      'liters': 1,
      'liter': 1,
      'l': 1,
      'gallons': 3.78541,
      'gallon': 3.78541,
      'gal': 3.78541,
      'cubic meters': 1000,
      'cubic meter': 1000,
      'm3': 1000,
      
      // Weight conversions to kg
      'kg': 1,
      'kilograms': 1,
      'kilogram': 1,
      'lbs': 0.453592,
      'lb': 0.453592,
      'pounds': 0.453592,
      'pound': 0.453592
    };
  }

  /**
   * Parse a natural language message to extract activity information
   * @param {string} message - The user's message
   * @returns {Object|null} Parsed activity data or null if no match
   */
  parseMessage(message) {
    if (!message || typeof message !== 'string') {
      return null;
    }

    const cleanMessage = message.trim().toLowerCase();

    for (const pattern of this.activityPatterns) {
      const match = cleanMessage.match(pattern.pattern);
      
      if (match) {
        const amount = parseFloat(match[pattern.extractors.amount]);
        let unit = pattern.extractors.unit;
        
        // If unit is a string (default), use it directly
        // If unit is a number (group index), extract from match
        if (typeof unit === 'number') {
          unit = match[unit]?.toLowerCase().trim();
        }
        
        // Normalize unit
        const normalizedUnit = this.normalizeUnit(unit, pattern.activityType);
        
        // Convert amount to standard unit
        const standardAmount = this.convertToStandardUnit(amount, unit, pattern.activityType);

        return {
          activityType: pattern.activityType,
          activity: pattern.activity,
          amount: standardAmount,
          originalAmount: amount,
          unit: normalizedUnit,
          originalUnit: unit,
          confidence: this.calculateConfidence(match, cleanMessage),
          matchedText: match[0]
        };
      }
    }

    return null;
  }

  /**
   * Normalize unit names to standard forms
   */
  normalizeUnit(unit, activityType) {
    if (!unit) return this.getDefaultUnit(activityType);
    
    const unitLower = unit.toLowerCase().trim();
    
    switch (activityType) {
      case 'transportation':
        if (['km', 'kilometers', 'kilometer'].includes(unitLower)) return 'km';
        if (['miles', 'mile', 'mi'].includes(unitLower)) return 'km';
        return 'km';
      
      case 'energy':
        if (['kwh', 'kilowatt hours', 'kilowatt hour'].includes(unitLower)) return 'kWh';
        if (['cubic meters', 'cubic meter', 'm3'].includes(unitLower)) return 'L';
        if (['liters', 'liter', 'l'].includes(unitLower)) return 'L';
        if (['gallons', 'gallon', 'gal'].includes(unitLower)) return 'L';
        return 'kWh';
      
      case 'food':
        if (['kg', 'kilograms', 'kilogram'].includes(unitLower)) return 'kg';
        if (['lbs', 'lb', 'pounds', 'pound'].includes(unitLower)) return 'kg';
        return 'kg';
      
      default:
        return unit;
    }
  }

  /**
   * Convert amount to standard unit for the activity type
   */
  convertToStandardUnit(amount, unit, activityType) {
    if (!unit || !this.unitConversions[unit.toLowerCase()]) {
      return amount;
    }

    const conversionFactor = this.unitConversions[unit.toLowerCase()];
    return amount * conversionFactor;
  }

  /**
   * Get default unit for an activity type
   */
  getDefaultUnit(activityType) {
    switch (activityType) {
      case 'transportation': return 'km';
      case 'energy': return 'kWh';
      case 'food': return 'kg';
      default: return 'unit';
    }
  }

  /**
   * Calculate confidence score based on match quality
   */
  calculateConfidence(match, message) {
    // Base confidence
    let confidence = 0.7;
    
    // Increase confidence for exact matches
    if (match[0].length / message.length > 0.5) {
      confidence += 0.2;
    }
    
    // Increase confidence for specific numbers
    if (match[1] && !isNaN(parseFloat(match[1]))) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Generate suggestions for unclear messages
   */
  generateSuggestions(message) {
    const suggestions = [
      "Try being more specific about the activity and distance, like 'I drove 10 km to work'",
      "Include the transportation method and distance: 'I took the bus for 5 miles'",
      "Mention both the activity and amount: 'I walked 3 km today'",
      "Use clear units like km, miles, kWh, or kg in your message"
    ];

    // Look for partial matches to give targeted suggestions
    if (message.toLowerCase().includes('drove') || message.toLowerCase().includes('car')) {
      return ["Try: 'I drove 15 km to the store' or 'I drove 20 miles today'"];
    }
    
    if (message.toLowerCase().includes('bus') || message.toLowerCase().includes('train')) {
      return ["Try: 'I took the bus for 8 km' or 'I rode the train 12 miles'"];
    }
    
    if (message.toLowerCase().includes('walk')) {
      return ["Try: 'I walked 2 km today' or 'I walked 1.5 miles'"];
    }

    return suggestions;
  }

  /**
   * Check if a message is likely related to activity logging
   * Returns true if the message contains activity-related keywords
   */
  isActivityRelated(message) {
    if (!message || typeof message !== 'string') {
      return false;
    }

    const messageLower = message.toLowerCase().trim();
    
    // Common greetings and conversational starters should NOT be treated as activity-related
    const conversationalPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening|howdy)/i,
      /^(how are you|how's it going|what's up|whats up)/i,
      /^(thanks|thank you|bye|goodbye|see you)/i,
      /^(help|what can you do|what do you do)/i,
      /^(yes|no|ok|okay|sure|maybe|i don't know)/i,
      /(who are you|what are you|tell me about yourself)/i,
      /(introduce yourself|what is your name)/i
    ];

    // If it matches conversational patterns, it's NOT activity-related
    if (conversationalPatterns.some(pattern => pattern.test(messageLower))) {
      return false;
    }

    const activityKeywords = [
      // Transportation
      'drove', 'drive', 'driving', 'car', 'vehicle',
      'bus', 'train', 'subway', 'metro', 'transit', 'public transport',
      'walk', 'walked', 'walking', 'bike', 'biked', 'cycling', 'cycled',
      'flight', 'flew', 'airplane', 'plane', 'taxi', 'uber', 'lyft',
      
      // Energy
      'electricity', 'power', 'energy', 'kwh', 'kilowatt',
      'heating', 'cooling', 'air conditioning', 'ac',
      
      // Waste/Recycling
      'recycle', 'recycled', 'trash', 'garbage', 'waste',
      'compost', 'composted', 'bottles', 'cans', 'plastic',
      
      // Food
      'meal', 'food', 'ate', 'eating', 'meat', 'vegetarian', 'vegan',
      
      // Units and quantities
      'km', 'kilometers', 'miles', 'mi', 'kwh', 'kg', 'pounds', 'lbs',
      
      // Activity indicators
      'today', 'yesterday', 'this morning', 'this evening',
      'logged', 'log', 'track', 'record'
    ];
    
    // Check for numbers (indicating quantities)
    const hasNumbers = /\d+/.test(message);
    
    // Check for activity keywords
    const hasActivityKeywords = activityKeywords.some(keyword => 
      messageLower.includes(keyword)
    );

    // Check for first-person activity patterns
    const hasFirstPersonActivity = /\b(i|we)\s+(drove|walked|took|used|recycled|ate|had)\b/i.test(message);

    // Consider it activity-related if it has numbers + keywords, or clear first-person activity
    return (hasNumbers && hasActivityKeywords) || hasFirstPersonActivity;
  }
}

module.exports = new NLPService();