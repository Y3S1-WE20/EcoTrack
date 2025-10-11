const HabitLog = require('../models/HabitLog');
const Activity = require('../models/Activity');
const Category = require('../models/Category');
const UserGoal = require('../models/UserGoal');

// Helper function to calculate CO2 impact
const calculateCO2Impact = (activity, quantity) => {
  return activity.co2PerUnit * quantity;
};

// Get today's impact for a user
const getTodayImpact = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's activities
    const todayActivities = await HabitLog.find({
      userId,
      date: { $gte: today, $lt: tomorrow }
    }).populate('activity category');

    // Calculate total CO2 for today
    const totalCO2 = todayActivities.reduce((sum, log) => sum + log.co2Impact, 0);

    // Get weekly goal
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    let weeklyGoal = await UserGoal.findOne({
      userId,
      goalType: 'weekly',
      startDate: { $lte: today },
      endDate: { $gte: today },
      isActive: true
    });

    if (!weeklyGoal) {
      // Create default weekly goal
      weeklyGoal = new UserGoal({
        userId,
        goalType: 'weekly',
        targetCO2: 50, // 50kg CO2 per week
        startDate: weekStart,
        endDate: weekEnd
      });
      await weeklyGoal.save();
    }

    // Calculate weekly progress
    const weeklyActivities = await HabitLog.find({
      userId,
      date: { $gte: weekStart, $lte: weekEnd }
    });
    const weeklyTotal = weeklyActivities.reduce((sum, log) => sum + log.co2Impact, 0);
    const weeklyProgress = Math.min((weeklyTotal / weeklyGoal.targetCO2) * 100, 100);

    res.json({
      success: true,
      data: {
        todayTotal: parseFloat(totalCO2.toFixed(1)),
        weeklyGoal: weeklyGoal.targetCO2,
        weeklyProgress: Math.round(weeklyProgress),
        activities: todayActivities,
        activityCount: todayActivities.length
      }
    });
  } catch (error) {
    console.error('Get today impact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get today\'s impact'
    });
  }
};

// Add a new habit log
const addHabitLog = async (req, res) => {
  try {
    const { userId, activityId, quantity, notes, voiceNote, photo } = req.body;

    // Validate required fields
    if (!userId || !activityId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'User ID, activity ID, and quantity are required'
      });
    }

    // Get activity details
    const activity = await Activity.findById(activityId).populate('category');
    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Calculate CO2 impact
    const co2Impact = calculateCO2Impact(activity, quantity);

    // Create habit log
    const habitLog = new HabitLog({
      userId,
      activity: activityId,
      category: activity.category._id,
      quantity,
      co2Impact,
      notes,
      voiceNote,
      photo,
      date: new Date()
    });

    await habitLog.save();
    await habitLog.populate('activity category');

    // Update weekly goal progress
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    await UserGoal.updateOne(
      {
        userId,
        goalType: 'weekly',
        startDate: { $lte: today },
        endDate: { $gte: today },
        isActive: true
      },
      { $inc: { currentCO2: co2Impact } }
    );

    res.status(201).json({
      success: true,
      data: habitLog,
      message: 'Activity added successfully'
    });
  } catch (error) {
    console.error('Add habit log error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add activity'
    });
  }
};

// Get activities by category
const getActivitiesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const activities = await Activity.find({
      category: categoryId,
      isActive: true
    }).sort({ priority: 1, name: 1 });

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get activities by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get activities'
    });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories'
    });
  }
};

// Get user's activity history
const getActivityHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, category, startDate, endDate } = req.query;

    // Build filter
    const filter = { userId };
    
    if (category) {
      filter.category = category;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Get activities with pagination
    const activities = await HabitLog.find(filter)
      .populate('activity category')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await HabitLog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get activity history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get activity history'
    });
  }
};

// Get weekly statistics
const getWeeklyStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get weekly progress data
    const weeklyData = await HabitLog.getWeeklyProgress(userId, weekStart, weekEnd);

    // Get daily totals for the week
    const dailyStats = await HabitLog.aggregate([
      {
        $match: {
          userId,
          date: { $gte: weekStart, $lte: weekEnd }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalCO2: { $sum: '$co2Impact' },
          activityCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        weeklyData,
        dailyStats,
        period: {
          start: weekStart,
          end: weekEnd
        }
      }
    });
  } catch (error) {
    console.error('Get weekly stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get weekly statistics'
    });
  }
};

// Get monthly statistics
const getMonthlyStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    // Get monthly progress data
    const monthlyData = await HabitLog.getWeeklyProgress(userId, monthStart, monthEnd);

    // Get daily totals for the month
    const dailyStats = await HabitLog.aggregate([
      {
        $match: {
          userId,
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalCO2: { $sum: '$co2Impact' },
          activityCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get weekly breakdown for the month
    const weeklyBreakdown = await HabitLog.aggregate([
      {
        $match: {
          userId,
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: { 
            week: { $week: '$date' },
            year: { $year: '$date' }
          },
          totalCO2: { $sum: '$co2Impact' },
          activityCount: { $sum: 1 },
          weekStart: { $min: '$date' },
          weekEnd: { $max: '$date' }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        monthlyData,
        dailyStats,
        weeklyBreakdown,
        period: {
          start: monthStart,
          end: monthEnd
        }
      }
    });
  } catch (error) {
    console.error('Get monthly stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get monthly statistics'
    });
  }
};

// Update habit log
const updateHabitLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const { quantity, notes } = req.body;

    const habitLog = await HabitLog.findById(logId).populate('activity');
    if (!habitLog) {
      return res.status(404).json({
        success: false,
        error: 'Activity log not found'
      });
    }

    // Recalculate CO2 impact if quantity changed
    if (quantity !== undefined && quantity !== habitLog.quantity) {
      const oldCO2 = habitLog.co2Impact;
      habitLog.quantity = quantity;
      habitLog.co2Impact = calculateCO2Impact(habitLog.activity, quantity);
      
      // Update weekly goal progress
      const co2Difference = habitLog.co2Impact - oldCO2;
      await UserGoal.updateOne(
        {
          userId: habitLog.userId,
          goalType: 'weekly',
          startDate: { $lte: habitLog.date },
          endDate: { $gte: habitLog.date },
          isActive: true
        },
        { $inc: { currentCO2: co2Difference } }
      );
    }

    if (notes !== undefined) {
      habitLog.notes = notes;
    }

    await habitLog.save();
    await habitLog.populate('activity category');

    res.json({
      success: true,
      data: habitLog,
      message: 'Activity updated successfully'
    });
  } catch (error) {
    console.error('Update habit log error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update activity'
    });
  }
};

// Delete habit log
const deleteHabitLog = async (req, res) => {
  try {
    const { logId } = req.params;

    const habitLog = await HabitLog.findById(logId);
    if (!habitLog) {
      return res.status(404).json({
        success: false,
        error: 'Activity log not found'
      });
    }

    // Update weekly goal progress (subtract the CO2 impact)
    await UserGoal.updateOne(
      {
        userId: habitLog.userId,
        goalType: 'weekly',
        startDate: { $lte: habitLog.date },
        endDate: { $gte: habitLog.date },
        isActive: true
      },
      { $inc: { currentCO2: -habitLog.co2Impact } }
    );

    await HabitLog.findByIdAndDelete(logId);

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Delete habit log error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete activity'
    });
  }
};

module.exports = {
  getTodayImpact,
  addHabitLog,
  getActivitiesByCategory,
  getCategories,
  getActivityHistory,
  getWeeklyStats,
  getMonthlyStats,
  updateHabitLog,
  deleteHabitLog
};