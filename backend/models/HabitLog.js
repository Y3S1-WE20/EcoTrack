const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  co2Impact: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  voiceNote: {
    type: String, // URL or file path
    trim: true
  },
  photo: {
    type: String, // URL or file path
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    }
  },
  isManualEntry: {
    type: Boolean,
    default: true
  },
  syncStatus: {
    type: String,
    enum: ['synced', 'pending', 'offline'],
    default: 'synced'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
habitLogSchema.index({ userId: 1, date: -1 });
habitLogSchema.index({ userId: 1, category: 1, date: -1 });
habitLogSchema.index({ location: '2dsphere' });

// Virtual for formatted date
habitLogSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Method to calculate daily total for user
habitLogSchema.statics.getDailyTotal = function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        totalCO2: { $sum: '$co2Impact' },
        activityCount: { $sum: 1 }
      }
    }
  ]);
};

// Method to get weekly progress
habitLogSchema.statics.getWeeklyProgress = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          category: '$category'
        },
        totalCO2: { $sum: '$co2Impact' },
        activities: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id.category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    }
  ]);
};

module.exports = mongoose.model('HabitLog', habitLogSchema);