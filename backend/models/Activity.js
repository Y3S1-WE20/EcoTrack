const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  co2PerUnit: {
    type: Number,
    required: true
    // Removed min: 0 to allow negative values for carbon-reducing activities like recycling
  },
  unit: {
    type: String,
    required: true,
    enum: ['km', 'kg', 'kWh', 'liter', 'piece', 'hour', 'custom']
  },
  unitLabel: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
activitySchema.index({ category: 1, isActive: 1 });
activitySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Activity', activitySchema);