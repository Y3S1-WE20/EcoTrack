const express = require('express');
const router = express.Router();
const { submitQuiz, getProfile, updateChallengeProgress } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

// All profile routes require authentication
router.use(protect);

// POST /api/v1/profile/quiz - Submit onboarding quiz
router.post('/quiz', submitQuiz);

// GET /api/v1/profile - Get complete user profile
router.get('/', getProfile);

// PUT /api/v1/profile/challenge - Update challenge progress
router.put('/challenge', updateChallengeProgress);

module.exports = router;