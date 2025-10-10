const User = require('../models/User');
const { CHALLENGE_TEMPLATES, INITIAL_BADGES } = require('../data/challengeData');

// Submit quiz results and calculate baseline
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.user.userId; // Fixed: use userId instead of _id

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Quiz answers are required and must be an array'
      });
    }

    // Calculate CO2 baseline from answers
    const co2Baseline = calculateCO2Baseline(answers);
    
    // Generate initial weekly challenge
    const weeklyChallenge = selectWeeklyChallenge(answers, []);
    
    // Create initial badges
    const welcomeBadge = INITIAL_BADGES.find(badge => badge.id === 'welcome');
    
    // Update user profile
    const updateData = {
      completedOnboarding: true,
      quizResult: {
        answers,
        co2Baseline,
        completedAt: new Date()
      },
      'carbonProfile.baselineCO2': co2Baseline,
      badges: welcomeBadge ? [welcomeBadge] : [],
      'stats.totalCo2Saved': 0,
      'stats.streakDays': 0,
      'stats.activitiesLogged': 0
    };

    // Add weekly challenge if available
    if (weeklyChallenge) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 7);
      
      updateData.currentChallenge = {
        id: weeklyChallenge.id,
        title: weeklyChallenge.title,
        description: weeklyChallenge.description,
        category: weeklyChallenge.category,
        targetReduction: weeklyChallenge.targetReduction,
        progress: 0,
        startDate,
        endDate,
        completed: false,
        badge: weeklyChallenge.badge
      };
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz results saved successfully',
      data: {
        user: user.toPublicJSON(),
        co2Baseline,
        challenge: weeklyChallenge
      }
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving quiz results',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user profile with all data
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Fixed: use userId instead of _id

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current challenge has expired and needs renewal
    if (user.currentChallenge && new Date() > user.currentChallenge.endDate && !user.currentChallenge.completed) {
      // Challenge expired, generate a new one
      const completedChallengeIds = user.completedChallenges.map(c => c.challengeId);
      const newChallenge = selectWeeklyChallenge(user.quizResult.answers, completedChallengeIds);
      
      if (newChallenge) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 7);
        
        user.currentChallenge = {
          id: newChallenge.id,
          title: newChallenge.title,
          description: newChallenge.description,
          category: newChallenge.category,
          targetReduction: newChallenge.targetReduction,
          progress: 0,
          startDate,
          endDate,
          completed: false,
          badge: newChallenge.badge
        };
        
        await user.save();
      }
    }

    const profileData = {
      user: user.toPublicJSON(),
      needsOnboarding: !user.completedOnboarding,
      profile: {
        co2Baseline: user.quizResult?.co2Baseline || 0,
        totalCo2Saved: user.stats?.totalCo2Saved || 0,
        streakDays: user.stats?.streakDays || 0,
        activitiesLogged: user.stats?.activitiesLogged || 0
      },
      currentChallenge: user.currentChallenge,
      badges: user.badges || [],
      recentCompletedChallenges: user.completedChallenges?.slice(-3) || []
    };

    res.status(200).json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update challenge progress
exports.updateChallengeProgress = async (req, res) => {
  try {
    const { progress, completed } = req.body;
    const userId = req.user.userId; // Fixed: use userId instead of _id

    const user = await User.findById(userId);
    
    if (!user || !user.currentChallenge) {
      return res.status(404).json({
        success: false,
        message: 'No active challenge found'
      });
    }

    // Update challenge progress
    user.currentChallenge.progress = Math.min(100, Math.max(0, progress));
    
    if (completed || user.currentChallenge.progress >= 100) {
      user.currentChallenge.completed = true;
      
      // Add to completed challenges
      user.completedChallenges.push({
        challengeId: user.currentChallenge.id,
        completedAt: new Date(),
        co2Saved: user.currentChallenge.targetReduction
      });
      
      // Update total CO2 saved
      user.stats.totalCo2Saved += user.currentChallenge.targetReduction;
      
      // Award badge if specified
      if (user.currentChallenge.badge) {
        const badge = INITIAL_BADGES.find(b => b.id === user.currentChallenge.badge);
        if (badge && !user.badges.some(b => b.id === badge.id)) {
          user.badges.push({
            ...badge,
            earnedAt: new Date()
          });
        }
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Challenge progress updated',
      data: {
        challenge: user.currentChallenge,
        totalCo2Saved: user.stats.totalCo2Saved,
        newBadges: completed ? user.badges.filter(b => 
          new Date() - new Date(b.earnedAt) < 60000 // Badges earned in last minute
        ) : []
      }
    });

  } catch (error) {
    console.error('Error updating challenge progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating challenge progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper functions (these would be imported from the frontend data file)
function calculateCO2Baseline(answers) {
  // This is a simplified version of the frontend calculation
  // In a real app, you'd import the actual calculation logic
  let totalWeeklyCO2 = 0;
  
  // Basic calculation based on common patterns
  answers.forEach(answer => {
    const { questionId, selectedOptions } = answer;
    
    switch (questionId) {
      case 'transport-primary':
        const transportImpact = {
          'car-alone': 15.2,
          'car-carpool': 7.6,
          'public-transport': 3.2,
          'bike': 0.1,
          'walk': 0,
          'work-from-home': 0
        };
        totalWeeklyCO2 += transportImpact[selectedOptions[0]] || 0;
        break;
      
      case 'energy-home':
        const energyImpact = {
          'renewable': 2.1,
          'mixed-green': 8.4,
          'natural-gas': 12.6,
          'electricity-grid': 16.8,
          'not-sure': 12.6
        };
        totalWeeklyCO2 += energyImpact[selectedOptions[0]] || 0;
        break;
      
      case 'food-diet':
        const dietImpact = {
          'vegan': 4.2,
          'vegetarian': 6.3,
          'flexitarian': 9.8,
          'omnivore-moderate': 14.7,
          'omnivore-heavy': 21.0
        };
        totalWeeklyCO2 += dietImpact[selectedOptions[0]] || 0;
        break;
      
      case 'consumption-shopping':
        const shoppingImpact = {
          'minimal': 2.8,
          'conscious': 4.9,
          'average': 8.4,
          'frequent': 12.6,
          'impulse': 16.8
        };
        totalWeeklyCO2 += shoppingImpact[selectedOptions[0]] || 0;
        break;
    }
  });
  
  return Math.max(0, totalWeeklyCO2);
}

function selectWeeklyChallenge(answers, completedChallenges) {
  // Simplified challenge selection
  const answerOptions = answers.flatMap(answer => answer.selectedOptions);
  
  const availableChallenges = CHALLENGE_TEMPLATES.filter(template => {
    if (completedChallenges.includes(template.id)) {
      return false;
    }
    
    if (template.prerequisites) {
      return template.prerequisites.some(prereq => answerOptions.includes(prereq));
    }
    
    return true;
  });
  
  // Return first easy challenge
  return availableChallenges.find(c => c.difficulty === 'easy') || availableChallenges[0] || null;
}