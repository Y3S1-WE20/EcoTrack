const Notification = require('../models/Notification');

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, unreadOnly } = req.query;
    
    const query = { userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          total,
          hasMore: total > page * limit
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: { notification }
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Create notification (internal use)
exports.createNotification = async (userId, title, message, type, data = {}) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      data
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Generate daily notifications for users
exports.generateDailyNotifications = async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({ completedOnboarding: true }).select('_id name');

    const notifications = [];
    const today = new Date();
    
    for (const user of users) {
      // Check if user already has a reminder today
      const existingReminder = await Notification.findOne({
        userId: user._id,
        type: 'reminder',
        createdAt: {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lt: new Date(today.setHours(23, 59, 59, 999))
        }
      });

      if (!existingReminder) {
        // Create daily reminder
        const reminder = await exports.createNotification(
          user._id,
          'Daily Check-in Reminder',
          "Don't forget to log today's eco-friendly activities! Every small action counts towards a greener planet. 🌱",
          'reminder'
        );
        notifications.push(reminder);

        // Create eco tip notification
        const ecoTips = [
          "Try using a reusable water bottle today - you could save 1.5kg of CO₂!",
          "Walking or biking for short trips can reduce your carbon footprint by up to 2kg CO₂ per trip.",
          "Turning off devices when not in use can save 0.5kg CO₂ daily.",
          "Using public transport today? You're already saving 4kg CO₂ compared to driving!",
          "Eating one plant-based meal today can save 2.5kg CO₂. Your planet thanks you!",
          "Air-drying clothes instead of using a dryer saves 2kg CO₂ and your clothes will last longer!",
          "LED bulbs use 75% less energy than incandescent bulbs. Consider switching today!"
        ];
        
        const randomTip = ecoTips[Math.floor(Math.random() * ecoTips.length)];
        const tipNotification = await exports.createNotification(
          user._id,
          'Eco Tip of the Day 🌱',
          randomTip,
          'tip'
        );
        notifications.push(tipNotification);
      }
    }

    res.json({
      success: true,
      message: `Generated ${notifications.length} notifications`,
      data: { count: notifications.length }
    });

  } catch (error) {
    console.error('Error generating daily notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate notifications',
      error: error.message
    });
  }
};