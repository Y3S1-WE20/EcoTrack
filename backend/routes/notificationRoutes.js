const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  generateDailyNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All notification routes require authentication
router.use(protect);

// GET /api/v1/notifications - Get user notifications
router.get('/', getNotifications);

// PUT /api/v1/notifications/:id/read - Mark notification as read
router.put('/:id/read', markAsRead);

// PUT /api/v1/notifications/read-all - Mark all notifications as read
router.put('/read-all', markAllAsRead);

// DELETE /api/v1/notifications/:id - Delete notification
router.delete('/:id', deleteNotification);

// POST /api/v1/notifications/generate-daily - Generate daily notifications (admin/cron)
router.post('/generate-daily', generateDailyNotifications);

module.exports = router;