const mongoose = require('mongoose');

const userGoalSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  goalType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  targetCO2: {
    type: Number,
    required: true,
    min: 0
  },
  currentCO2: {
    type: Number,
    default: 0,
    min: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  achievements: [{
    type: {
      type: String,
      enum: ['streak', 'target_met', 'improvement', 'milestone']
    },
    title: String,
    description: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying
userGoalSchema.index({ userId: 1, goalType: 1, isActive: 1 });
userGoalSchema.index({ userId: 1, startDate: 1, endDate: 1 });

// Virtual for progress percentage
userGoalSchema.virtual('progressPercentage').get(function() {
  if (this.targetCO2 === 0) return 0;
  return Math.min(Math.round((this.currentCO2 / this.targetCO2) * 100), 100);
});

// Method to update current CO2
userGoalSchema.methods.updateProgress = function(additionalCO2) {
  this.currentCO2 += additionalCO2;
  return this.save();
};

module.exports = mongoose.model('UserGoal', userGoalSchema);