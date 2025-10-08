require('dotenv').config();

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME || 'EcoTrack',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key-for-development',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',

  // API Configuration
  API_VERSION: '1.0.0',
  API_PREFIX: '/api/v1',

  // CO2 Calculation Factors (kg CO2 per unit)
  CO2_FACTORS: {
    transport: {
      'car-gasoline': 0.21, // per km
      'car-electric': 0.05, // per km
      'bus': 0.08, // per km
      'train': 0.04, // per km
      'flight-domestic': 0.25, // per km
      'flight-international': 0.3, // per km
      'motorcycle': 0.1, // per km
      'bicycle': 0, // per km
      'walking': 0 // per km
    },
    energy: {
      'electricity': 0.4, // per kWh
      'natural-gas': 2.0, // per kWh
      'heating-oil': 2.5, // per liter
      'coal': 0.9 // per kg
    },
    food: {
      'beef': 27, // per kg
      'lamb': 39, // per kg
      'cheese': 14, // per kg
      'chicken': 6.9, // per kg
      'fish': 6.1, // per kg
      'eggs': 4.8, // per kg
      'rice': 2.7, // per kg
      'vegetables': 2.0, // per kg
      'fruits': 1.1 // per kg
    },
    waste: {
      'general-waste': 0.5, // per kg
      'recycling': -0.1, // per kg (negative = reduction)
      'composting': -0.2 // per kg (negative = reduction)
    },
    consumption: {
      'clothing': 8.0, // per item
      'electronics': 300, // per item
      'books': 2.5, // per item
      'furniture': 50 // per item
    }
  },

  // Goals and Targets
  DEFAULT_GOALS: {
    daily: 7.1, // kg CO2 per day (average global target)
    weekly: 50, // kg CO2 per week
    monthly: 200 // kg CO2 per month
  },

  // File Upload Configuration
  UPLOAD_LIMITS: {
    fileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'audio/mp3', 'audio/wav']
  },

  // Rate Limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // JWT Configuration (for future authentication)
  JWT_SECRET: process.env.JWT_SECRET || 'eco-track-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',

  // API Configuration
  API_VERSION: 'v1',
  API_PREFIX: '/api/v1'
};