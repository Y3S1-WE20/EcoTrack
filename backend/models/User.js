const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  completedOnboarding: {
    type: Boolean,
    default: false
  },
  carbonProfile: {
    // Store onboarding quiz results
    lifestyle: {
      type: String,
      enum: ['low-impact', 'moderate', 'high-impact'],
      default: 'moderate'
    },
    baselineCO2: {
      type: Number,
      default: 0
    },
    goals: {
      daily: { type: Number, default: 7.1 }, // kg CO2
      weekly: { type: Number, default: 50 },
      monthly: { type: Number, default: 200 }
    },
    preferences: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  // Quiz results and profile data
  quizResult: {
    answers: [{
      questionId: String,
      selectedOptions: [String]
    }],
    co2Baseline: {
      type: Number,
      default: 0
    },
    completedAt: Date
  },
  // Weekly challenges
  currentChallenge: {
    id: String,
    title: String,
    description: String,
    category: {
      type: String,
      enum: ['transport', 'energy', 'food', 'consumption']
    },
    targetReduction: Number,
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    startDate: Date,
    endDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    badge: String
  },
  completedChallenges: [{
    challengeId: String,
    completedAt: Date,
    co2Saved: Number
  }],
  // Badges and achievements
  badges: [{
    id: String,
    name: String,
    description: String,
    icon: String,
    category: {
      type: String,
      enum: ['streak', 'reduction', 'challenge', 'milestone']
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Progress tracking
  stats: {
    totalCo2Saved: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    lastActivityDate: Date,
    activitiesLogged: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Instance method to get public profile (without password)
userSchema.methods.toPublicJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method to find user by email with password for login
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password');
};

module.exports = mongoose.model('User', userSchema);