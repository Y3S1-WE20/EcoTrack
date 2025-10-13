/**
 * Badge Service
 * Manages badge awarding, progress tracking, and achievement system
 */

const { Badge, UserBadge } = require('../models/Badge');
const HabitLog = require('../models/HabitLog');

class BadgeService {
  constructor() {
    this.defaultBadges = [
      // Transportation badges
      {
        name: 'Green Commuter',
        description: 'Use eco-friendly transport 10 times',
        icon: '🚌',
        category: 'transport',
        criteria: { type: 'count', target: 10, activity: 'green_transport' },
        points: 20,
        rarity: 'common'
      },
      {
        name: 'Car-Free Week',
        description: 'Complete a week without driving',
        icon: '🚫🚗',
        category: 'transport',
        criteria: { type: 'streak', target: 7, period: 'day', activity: 'no_driving' },
        points: 50,
        rarity: 'uncommon'
      },
      {
        name: 'Cycling Champion',
        description: 'Cycle 100km total',
        icon: '🚴',
        category: 'transport',
        criteria: { type: 'total', target: 100, activity: 'cycling' },
        points: 30,
        rarity: 'common'
      },
      {
        name: 'Walking Warrior',
        description: 'Walk 500km total',
        icon: '🚶',
        category: 'transport',
        criteria: { type: 'total', target: 500, activity: 'walking' },
        points: 40,
        rarity: 'uncommon'
      },

      // Overall impact badges
      {
        name: 'Carbon Saver',
        description: 'Save 10kg CO₂ in total',
        icon: '🌱',
        category: 'overall',
        criteria: { type: 'total', target: 10, activity: 'co2_saved' },
        points: 25,
        rarity: 'common'
      },
      {
        name: 'Climate Hero',
        description: 'Save 100kg CO₂ in total',
        icon: '🦸',
        category: 'overall',
        criteria: { type: 'total', target: 100, activity: 'co2_saved' },
        points: 100,
        rarity: 'rare'
      },
      {
        name: 'Eco Warrior',
        description: 'Save 500kg CO₂ in total',
        icon: '🏆',
        category: 'overall',
        criteria: { type: 'total', target: 500, activity: 'co2_saved' },
        points: 500,
        rarity: 'epic'
      },

      // Streak badges
      {
        name: 'Consistency King',
        description: 'Log activities for 7 days straight',
        icon: '📅',
        category: 'streak',
        criteria: { type: 'streak', target: 7, period: 'day' },
        points: 30,
        rarity: 'common'
      },
      {
        name: 'Monthly Master',
        description: 'Log activities every day for a month',
        icon: '🗓️',
        category: 'streak',
        criteria: { type: 'streak', target: 30, period: 'day' },
        points: 150,
        rarity: 'rare'
      },

      // Activity count badges
      {
        name: 'Getting Started',
        description: 'Log your first 5 activities',
        icon: '🌟',
        category: 'overall',
        criteria: { type: 'count', target: 5 },
        points: 10,
        rarity: 'common'
      },
      {
        name: 'Tracking Pro',
        description: 'Log 50 activities',
        icon: '📊',
        category: 'overall',
        criteria: { type: 'count', target: 50 },
        points: 75,
        rarity: 'uncommon'
      },
      {
        name: 'Data Master',
        description: 'Log 200 activities',
        icon: '📈',
        category: 'overall',
        criteria: { type: 'count', target: 200 },
        points: 200,
        rarity: 'rare'
      },

      // Improvement badges
      {
        name: 'Week Improver',
        description: 'Reduce weekly CO₂ by 20% compared to previous week',
        icon: '📉',
        category: 'overall',
        criteria: { type: 'reduction', target: 20, period: 'week' },
        points: 40,
        rarity: 'uncommon'
      }
    ];
  }

  /**
   * Initialize default badges in database
   */
  async initializeBadges() {
    try {
      for (const badgeData of this.defaultBadges) {
        await Badge.findOneAndUpdate(
          { name: badgeData.name },
          badgeData,
          { upsert: true, new: true }
        );
      }
      console.log('✅ Badges initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing badges:', error);
    }
  }

  /**
   * Check and award badges for a user after activity logging
   */
  async checkBadges(userId, newHabitLog) {
    try {
      const badges = await Badge.find({ isActive: true });
      const newlyEarned = [];

      for (const badge of badges) {
        const progress = await this.calculateBadgeProgress(userId, badge);
        
        // Get or create user badge
        let userBadge = await UserBadge.findOne({ user: userId, badge: badge._id });
        
        if (!userBadge) {
          userBadge = new UserBadge({
            user: userId,
            badge: badge._id,
            progress: { current: 0, target: badge.criteria.target }
          });
        }

        const wasUnlocked = userBadge.isUnlocked;
        await userBadge.updateProgress(progress);

        // If badge was just unlocked
        if (!wasUnlocked && userBadge.isUnlocked) {
          newlyEarned.push({
            badge: await badge.populate('badge'),
            earnedAt: userBadge.earnedAt,
            points: badge.points
          });
        }
      }

      return newlyEarned;

    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }

  /**
   * Calculate current progress for a specific badge
   */
  async calculateBadgeProgress(userId, badge) {
    const { criteria } = badge;
    let progress = 0;

    try {
      switch (criteria.type) {
        case 'count':
          progress = await this.calculateCountProgress(userId, criteria);
          break;
        case 'total':
          progress = await this.calculateTotalProgress(userId, criteria);
          break;
        case 'streak':
          progress = await this.calculateStreakProgress(userId, criteria);
          break;
        case 'reduction':
          progress = await this.calculateReductionProgress(userId, criteria);
          break;
        default:
          progress = 0;
      }
    } catch (error) {
      console.error(`Error calculating progress for badge ${badge.name}:`, error);
      progress = 0;
    }

    return Math.max(0, progress);
  }

  /**
   * Calculate count-based progress (e.g., number of activities)
   */
  async calculateCountProgress(userId, criteria) {
    const query = { user: userId };
    
    if (criteria.activity) {
      switch (criteria.activity) {
        case 'green_transport':
          query['$or'] = [
            { 'activity.name': { $in: ['walking', 'cycling', 'bus', 'train'] } }
          ];
          break;
        default:
          query['activity.name'] = criteria.activity;
      }
    }

    // Apply period filter if specified
    if (criteria.period && criteria.period !== 'all_time') {
      const dateFilter = this.getDateFilter(criteria.period);
      if (dateFilter) query.createdAt = dateFilter;
    }

    return await HabitLog.countDocuments(query);
  }

  /**
   * Calculate total-based progress (e.g., total distance, total CO₂ saved)
   */
  async calculateTotalProgress(userId, criteria) {
    const query = { user: userId };
    
    // Apply period filter if specified
    if (criteria.period && criteria.period !== 'all_time') {
      const dateFilter = this.getDateFilter(criteria.period);
      if (dateFilter) query.createdAt = dateFilter;
    }

    if (criteria.activity === 'co2_saved') {
      const result = await HabitLog.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$carbonSaved' } } }
      ]);
      return result[0]?.total || 0;
    }

    if (criteria.activity === 'cycling' || criteria.activity === 'walking') {
      query['activity.name'] = criteria.activity;
      const result = await HabitLog.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);
      return result[0]?.total || 0;
    }

    return 0;
  }

  /**
   * Calculate streak-based progress
   */
  async calculateStreakProgress(userId, criteria) {
    const logs = await HabitLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('createdAt activity');

    if (logs.length === 0) return 0;

    let currentStreak = 0;
    let streakDates = new Set();
    
    // Group logs by date
    for (const log of logs) {
      const dateKey = log.createdAt.toISOString().split('T')[0];
      
      // Apply activity filter if specified
      if (criteria.activity === 'no_driving') {
        // For "no driving" streak, we need to check that there's no driving activity on each date
        const drivingOnDate = await HabitLog.findOne({
          user: userId,
          'activity.name': 'driving',
          createdAt: {
            $gte: new Date(dateKey + 'T00:00:00.000Z'),
            $lt: new Date(dateKey + 'T23:59:59.999Z')
          }
        });
        
        if (!drivingOnDate) {
          streakDates.add(dateKey);
        }
      } else {
        streakDates.add(dateKey);
      }
    }

    // Calculate consecutive days
    const sortedDates = Array.from(streakDates).sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    
    if (sortedDates[0] === today || this.isYesterday(sortedDates[0])) {
      currentStreak = 1;
      
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i-1]);
        const prevDate = new Date(sortedDates[i]);
        const daysDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return currentStreak;
  }

  /**
   * Calculate reduction-based progress
   */
  async calculateReductionProgress(userId, criteria) {
    const now = new Date();
    let currentPeriodStart, previousPeriodStart, previousPeriodEnd;

    if (criteria.period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      currentPeriodStart = startOfWeek;
      previousPeriodStart = new Date(startOfWeek);
      previousPeriodStart.setDate(startOfWeek.getDate() - 7);
      previousPeriodEnd = new Date(startOfWeek);
      previousPeriodEnd.setMilliseconds(-1);
    }

    if (!currentPeriodStart) return 0;

    // Calculate current period emissions
    const currentEmissions = await HabitLog.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: currentPeriodStart }
        }
      },
      { $group: { _id: null, total: { $sum: '$carbonEmitted' } } }
    ]);

    // Calculate previous period emissions
    const previousEmissions = await HabitLog.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd }
        }
      },
      { $group: { _id: null, total: { $sum: '$carbonEmitted' } } }
    ]);

    const current = currentEmissions[0]?.total || 0;
    const previous = previousEmissions[0]?.total || 0;

    if (previous === 0) return 0;

    const reductionPercentage = ((previous - current) / previous) * 100;
    return Math.max(0, reductionPercentage);
  }

  /**
   * Get date filter for time periods
   */
  getDateFilter(period) {
    const now = new Date();
    
    switch (period) {
      case 'day':
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        return { $gte: startOfDay };
      
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return { $gte: startOfWeek };
      
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return { $gte: startOfMonth };
      
      default:
        return null;
    }
  }

  /**
   * Check if date is yesterday
   */
  isYesterday(dateString) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return dateString === yesterday.toISOString().split('T')[0];
  }

  /**
   * Get user's badges with progress
   */
  async getUserBadges(userId) {
    const userBadges = await UserBadge.find({ user: userId })
      .populate('badge')
      .sort({ earnedAt: -1 });

    return userBadges.map(ub => ({
      badge: ub.badge,
      progress: ub.progress,
      isUnlocked: ub.isUnlocked,
      earnedAt: ub.earnedAt
    }));
  }

  /**
   * Get user's total points from badges
   */
  async getUserPoints(userId) {
    const unlockedBadges = await UserBadge.find({ 
      user: userId, 
      isUnlocked: true 
    }).populate('badge');

    return unlockedBadges.reduce((total, ub) => total + (ub.badge.points || 0), 0);
  }
}

module.exports = new BadgeService();