const UserChallenge = require('../models/UserChallenge');
const HabitLog = require('../models/HabitLog');

// Get all active challenges for a user
const getUserChallenges = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get active challenges
    const activeChallenges = await UserChallenge.getActiveUserChallenges(userId);
    
    // Get completed challenges (recent ones)
    const completedChallenges = await UserChallenge.getCompletedUserChallenges(userId)
      .limit(10);
    
    res.json({
      success: true,
      data: {
        active: activeChallenges,
        completed: completedChallenges
      }
    });
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch challenges'
    });
  }
};

// Join a challenge
const joinChallenge = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      challengeId, 
      challengeName, 
      challengeDescription, 
      category, 
      type, 
      target, 
      targetMetric, 
      endDate, 
      reward, 
      icon, 
      color 
    } = req.body;

    // Check if user already joined this challenge
    const existingChallenge = await UserChallenge.findOne({ userId, challengeId });
    if (existingChallenge) {
      return res.status(400).json({
        success: false,
        error: 'Already joined this challenge'
      });
    }

    // Calculate initial progress based on existing activities
    let initialProgress = 0;
    const now = new Date();
    const challengeStartDate = new Date(now.getTime() - (type === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000);

    const userActivities = await HabitLog.find({
      userId: userId,
      date: { $gte: challengeStartDate, $lte: now }
    }).populate('category');

    // Calculate progress based on target metric
    switch (targetMetric) {
      case 'activities':
        initialProgress = userActivities.length;
        break;
      case 'categorySpecific':
        initialProgress = userActivities.filter(log => 
          log.category.name === category
        ).length;
        break;
      case 'co2Reduction':
        initialProgress = userActivities.filter(log => 
          log.co2Impact < 2
        ).length;
        break;
      case 'consistency':
        const uniqueDays = new Set(userActivities.map(log => 
          log.date.toISOString().split('T')[0]
        )).size;
        initialProgress = uniqueDays;
        break;
    }

    // Create new challenge participation
    const userChallenge = new UserChallenge({
      userId,
      challengeId,
      challengeName,
      challengeDescription,
      category,
      type,
      target,
      targetMetric,
      currentProgress: initialProgress,
      endDate: new Date(endDate),
      reward,
      icon,
      color
    });

    // Check if already completed based on initial progress
    if (initialProgress >= target) {
      userChallenge.status = 'completed';
      userChallenge.completedAt = new Date();
    }

    await userChallenge.save();

    res.json({
      success: true,
      data: userChallenge
    });
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join challenge'
    });
  }
};

// Update challenge progress
const updateChallengeProgress = async (req, res) => {
  try {
    const { userId, challengeId } = req.params;
    
    const userChallenge = await UserChallenge.findOne({ userId, challengeId });
    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    // Calculate new progress based on current activities
    const now = new Date();
    const challengeStartDate = userChallenge.joinedAt;

    const userActivities = await HabitLog.find({
      userId: userId,
      date: { $gte: challengeStartDate, $lte: now }
    }).populate('category');

    let newProgress = 0;
    let co2Saved = 0;

    // Calculate progress and CO2 saved
    switch (userChallenge.targetMetric) {
      case 'activities':
        newProgress = userActivities.length;
        co2Saved = userActivities.reduce((sum, log) => sum + (log.co2Impact || 0), 0);
        break;
      case 'categorySpecific':
        const categoryActivities = userActivities.filter(log => 
          log.category.name === userChallenge.category
        );
        newProgress = categoryActivities.length;
        co2Saved = categoryActivities.reduce((sum, log) => sum + (log.co2Impact || 0), 0);
        break;
      case 'co2Reduction':
        const ecoActivities = userActivities.filter(log => log.co2Impact < 2);
        newProgress = ecoActivities.length;
        co2Saved = ecoActivities.reduce((sum, log) => sum + (log.co2Impact || 0), 0);
        break;
      case 'consistency':
        const uniqueDays = new Set(userActivities.map(log => 
          log.date.toISOString().split('T')[0]
        )).size;
        newProgress = uniqueDays;
        co2Saved = userActivities.reduce((sum, log) => sum + (log.co2Impact || 0), 0);
        break;
    }

    // Update progress and CO2 saved
    userChallenge.currentProgress = newProgress;
    userChallenge.co2Saved = co2Saved;

    // Check if challenge is completed
    if (newProgress >= userChallenge.target && userChallenge.status === 'active') {
      userChallenge.status = 'completed';
      userChallenge.completedAt = new Date();
      
      // Calculate global rank for completed challenge
      const completedCount = await UserChallenge.countDocuments({
        challengeId: challengeId,
        status: 'completed'
      });
      userChallenge.globalRank = completedCount;
    }

    await userChallenge.save();

    res.json({
      success: true,
      data: userChallenge
    });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update challenge progress'
    });
  }
};

// Get challenge leaderboard
const getChallengeLeaderboard = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { limit = 50 } = req.query;
    
    const leaderboard = await UserChallenge.getLeaderboard(challengeId, parseInt(limit));
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
};

// Mark challenge as shared
const markChallengeShared = async (req, res) => {
  try {
    const { userId, challengeId } = req.params;
    const { platform } = req.body;
    
    const userChallenge = await UserChallenge.findOne({ userId, challengeId });
    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    if (userChallenge.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Can only share completed challenges'
      });
    }

    await userChallenge.markAsShared(platform);

    res.json({
      success: true,
      data: userChallenge
    });
  } catch (error) {
    console.error('Error marking challenge as shared:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark challenge as shared'
    });
  }
};

// Get sharing data for a completed challenge
const getChallengeShareData = async (req, res) => {
  try {
    const { userId, challengeId } = req.params;
    
    const userChallenge = await UserChallenge.findOne({ userId, challengeId });
    if (!userChallenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    if (userChallenge.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Challenge not completed yet'
      });
    }

    // Get total participants for this challenge
    const totalParticipants = await UserChallenge.countDocuments({
      challengeId: challengeId
    });

    const shareData = {
      challengeName: userChallenge.challengeName,
      reward: userChallenge.reward,
      icon: userChallenge.icon,
      color: userChallenge.color,
      completedAt: userChallenge.completedAt,
      globalRank: userChallenge.globalRank,
      totalParticipants: totalParticipants,
      co2Saved: userChallenge.co2Saved,
      progress: userChallenge.currentProgress,
      target: userChallenge.target
    };

    res.json({
      success: true,
      data: shareData
    });
  } catch (error) {
    console.error('Error fetching share data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch share data'
    });
  }
};

module.exports = {
  getUserChallenges,
  joinChallenge,
  updateChallengeProgress,
  getChallengeLeaderboard,
  markChallengeShared,
  getChallengeShareData
};