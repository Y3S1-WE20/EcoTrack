const express = require('express');
const router = express.Router();
const {
  getTodayImpact,
  addHabitLog,
  getActivitiesByCategory,
  getCategories,
  getActivityHistory,
  getWeeklyStats,
  updateHabitLog,
  deleteHabitLog
} = require('../controllers/habitController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes - no authentication required
// GET /api/v1/habits/categories - Get all categories
router.get('/categories', getCategories);

// GET /api/v1/habits/activities/:categoryId - Get activities by category
router.get('/activities/:categoryId', getActivitiesByCategory);

// Protected routes - authentication required
// GET /api/v1/habits/today - Get today's impact for current user
router.get('/today', protect, getTodayImpact);

// POST /api/v1/habits/log - Add new habit log
router.post('/log', protect, addHabitLog);

// GET /api/v1/habits/history - Get current user's activity history
router.get('/history', protect, getActivityHistory);

// GET /api/v1/habits/stats/weekly - Get weekly statistics for current user
router.get('/stats/weekly', protect, getWeeklyStats);

// PUT /api/v1/habits/log/:logId - Update habit log
router.put('/log/:logId', protect, updateHabitLog);

// DELETE /api/v1/habits/log/:logId - Delete habit log
router.delete('/log/:logId', protect, deleteHabitLog);

module.exports = router;