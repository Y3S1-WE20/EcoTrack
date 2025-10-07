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

// GET /api/v1/habits/today/:userId - Get today's impact
router.get('/today/:userId', getTodayImpact);

// POST /api/v1/habits/log - Add new habit log
router.post('/log', addHabitLog);

// GET /api/v1/habits/categories - Get all categories
router.get('/categories', getCategories);

// GET /api/v1/habits/activities/:categoryId - Get activities by category
router.get('/activities/:categoryId', getActivitiesByCategory);

// GET /api/v1/habits/history/:userId - Get user's activity history
router.get('/history/:userId', getActivityHistory);

// GET /api/v1/habits/stats/weekly/:userId - Get weekly statistics
router.get('/stats/weekly/:userId', getWeeklyStats);

// PUT /api/v1/habits/log/:logId - Update habit log
router.put('/log/:logId', updateHabitLog);

// DELETE /api/v1/habits/log/:logId - Delete habit log
router.delete('/log/:logId', deleteHabitLog);

module.exports = router;