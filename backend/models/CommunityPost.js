const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    default: 'Anonymous User'
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  achievement: {
    type: String,
    required: false
  },
  impactData: {
    co2Saved: { type: Number, default: 0 },
    wasteReduced: { type: Number, default: 0 },
    energySaved: { type: Number, default: 0 },
    unit: { type: String, default: 'kg' }
  },
  likes: [{
    type: String, // User IDs
    default: []
  }],
  comments: [{
    author: { type: String, required: true },
    content: { type: String, required: true, maxlength: 200 },
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [{
    type: String
  }],
  location: {
    city: String,
    country: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['achievement', 'tip', 'question', 'challenge', 'general'],
    default: 'general'
  }
}, {
  timestamps: true
});

// Index for efficient querying
communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ author: 1 });
communityPostSchema.index({ category: 1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);