const express = require('express');
const router = express.Router();
const {
  getTodayImpact,
  addHabitLog,
  getActivitiesByCategory,
  getCategories,
  getActivityHistory,
  getWeeklyStats,
  getMonthlyStats,
  updateHabitLog,
  deleteHabitLog,
  getFilteredHabitLogs
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

// GET /api/v1/habits/stats/monthly/:userId - Get monthly statistics
router.get('/stats/monthly/:userId', getMonthlyStats);

// PUT /api/v1/habits/log/:logId - Update habit log
router.put('/log/:logId', protect, updateHabitLog);

// DELETE /api/v1/habits/log/:logId - Delete habit log
router.delete('/log/:logId', protect, deleteHabitLog);

// GET /api/v1/habits/filtered/:userId - Get filtered habit logs
router.get('/filtered/:userId', getFilteredHabitLogs);

module.exports = router;