const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['transport', 'energy', 'food', 'waste', 'overall', 'streak', 'social'],
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['count', 'total', 'streak', 'reduction', 'custom'],
      required: true
    },
    target: {
      type: Number,
      required: true
    },
    period: {
      type: String,
      enum: ['day', 'week', 'month', 'year', 'all_time'],
      default: 'all_time'
    },
    activity: String,  // specific activity type (optional)
    comparison: {
      type: String,
      enum: ['gte', 'lte', 'eq'],
      default: 'gte'
    }
  },
  points: {
    type: Number,
    default: 10
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const userBadgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    current: { type: Number, default: 0 },
    target: { type: Number, required: true },
    percentage: { type: Number, default: 0 }
  },
  isUnlocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate user-badge combinations
userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

// Method to calculate progress percentage
userBadgeSchema.methods.updateProgress = function(current) {
  this.progress.current = current;
  this.progress.percentage = Math.min((current / this.progress.target) * 100, 100);
  
  if (this.progress.percentage >= 100 && !this.isUnlocked) {
    this.isUnlocked = true;
    this.earnedAt = new Date();
  }
  
  return this.save();
};

const Badge = mongoose.model('Badge', badgeSchema);
const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

module.exports = { Badge, UserBadge };