const mongoose = require('mongoose');

const userChallengeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  challengeId: {
    type: String,
    required: true
  },
  challengeName: {
    type: String,
    required: true
  },
  challengeDescription: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['weekly', 'monthly', 'streak'],
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  targetMetric: {
    type: String,
    enum: ['activities', 'categorySpecific', 'co2Reduction', 'consistency'],
    required: true
  },
  currentProgress: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'abandoned'],
    default: 'active'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    required: true
  },
  reward: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  // Social sharing data
  shared: {
    type: Boolean,
    default: false
  },
  sharedAt: {
    type: Date,
    default: null
  },
  sharedPlatforms: [{
    platform: {
      type: String,
      enum: ['instagram', 'whatsapp', 'facebook']
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Leaderboard data
  globalRank: {
    type: Number,
    default: null
  },
  co2Saved: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
userChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
userChallengeSchema.index({ status: 1, endDate: 1 });
userChallengeSchema.index({ completedAt: 1 });

// Methods
userChallengeSchema.methods.updateProgress = function(newProgress) {
  this.currentProgress = newProgress;
  if (newProgress >= this.target && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  return this.save();
};

userChallengeSchema.methods.markAsShared = function(platform) {
  this.shared = true;
  this.sharedAt = new Date();
  this.sharedPlatforms.push({
    platform: platform,
    sharedAt: new Date()
  });
  return this.save();
};

// Static methods
userChallengeSchema.statics.getActiveUserChallenges = function(userId) {
  return this.find({ 
    userId: userId, 
    status: 'active',
    endDate: { $gte: new Date() }
  });
};

userChallengeSchema.statics.getCompletedUserChallenges = function(userId) {
  return this.find({ 
    userId: userId, 
    status: 'completed'
  }).sort({ completedAt: -1 });
};

userChallengeSchema.statics.getLeaderboard = function(challengeId, limit = 50) {
  return this.find({ 
    challengeId: challengeId,
    status: 'completed'
  })
  .sort({ completedAt: 1, currentProgress: -1 })
  .limit(limit)
  .select('userId challengeName currentProgress completedAt co2Saved');
};

const UserChallenge = mongoose.model('UserChallenge', userChallengeSchema);

module.exports = UserChallenge;