const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');

// Get user's challenges (active and completed)
router.get('/user/:userId', challengeController.getUserChallenges);

// Join a challenge
router.post('/user/:userId/join', challengeController.joinChallenge);

// Update challenge progress
router.put('/user/:userId/:challengeId/progress', challengeController.updateChallengeProgress);

// Get challenge leaderboard
router.get('/:challengeId/leaderboard', challengeController.getChallengeLeaderboard);

// Mark challenge as shared
router.post('/user/:userId/:challengeId/share', challengeController.markChallengeShared);

// Get challenge share data
router.get('/user/:userId/:challengeId/share-data', challengeController.getChallengeShareData);

module.exports = router;