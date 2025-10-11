const express = require('express');
const router = express.Router();
const motivationController = require('../controllers/motivationController');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Motivation API is working',
    timestamp: new Date().toISOString() 
  });
});

// AI-generated quotes
router.get('/quotes', motivationController.getMotivationalQuotes);
router.post('/quotes/generate', motivationController.generateNewQuote);

// Community forum
router.get('/community/posts', motivationController.getCommunityPosts);
router.post('/community/posts', motivationController.createCommunityPost);
router.post('/community/posts/:id/like', motivationController.likeCommunityPost);
router.post('/community/posts/:id/comment', motivationController.addComment);

// Articles
router.get('/articles', motivationController.getFeaturedArticles);

// Challenges
router.get('/challenges', motivationController.getPersonalizedChallenges);
router.post('/challenges/:id/join', motivationController.joinChallenge);

module.exports = router;