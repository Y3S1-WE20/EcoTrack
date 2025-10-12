import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  Dimensions,
  Share 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { habitAPI, HabitLog, TodayData } from '../../services/habitAPI';

const screenWidth = Dimensions.get('window').width;

interface Goal {
  id: string;
  name: string;
  type: 'weekly' | 'monthly' | 'yearly' | 'custom';
  target: number;
  current: number;
  unit: string;
  icon: string;
  color: string;
  description: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'starter' | 'consistency' | 'milestone' | 'mastery' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  xpReward: number;
  requirements?: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  participants: number;
  duration: string;
  reward: string;
  icon: string;
  color: string;
  joined: boolean;
  target: number;
  userProgress: number;
  category: string;
  type: 'weekly' | 'monthly' | 'streak';
  endDate: Date;
  targetMetric: 'activities' | 'co2Reduction' | 'categorySpecific' | 'consistency';
  completed?: boolean;
  completedAt?: Date;
  globalRank?: number;
  co2Saved?: number;
}

interface SharingOptions {
  includeRank: boolean;
  includeCO2: boolean;
  platform: 'instagram' | 'whatsapp' | 'facebook' | null;
}

const GoalsScreen = () => {
  const [activeTab, setActiveTab] = useState<'goals' | 'achievements' | 'challenges' | 'reports'>('goals');
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showAchievementDetail, setShowAchievementDetail] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  
  // User data from API
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [userStats, setUserStats] = useState<{
    totalCO2: number;
    activityCount: number;
    daysActive: number;
    weeklyStats: any;
    monthlyStats: any;
    allTimeHabits: HabitLog[];
  } | null>(null);
  
  // For demo purposes, using a fixed user ID - in real app, get from auth
  const userId = 'testuser';
  
  // State for new goal creation
  const [newGoal, setNewGoal] = useState({
    name: '',
    type: 'weekly' as 'weekly' | 'monthly' | 'yearly' | 'custom',
    target: '',
    unit: 'kg CO₂',
    icon: '🎯',
    description: ''
  });

  // Sample data - in real app, this would come from API
  const [goals, setGoals] = useState<Goal[]>([]);

  // Calculate current week's CO₂ total
  const calculateCurrentWeekCO2 = (): number => {
    if (!userStats?.allTimeHabits) return 0;
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of this week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7); // End of this week
    
    return userStats.allTimeHabits
      .filter((log: HabitLog) => {
        const logDate = new Date(log.date);
        return logDate >= startOfWeek && logDate < endOfWeek;
      })
      .reduce((total: number, log: HabitLog) => total + log.co2Impact, 0);
  };

  // Initialize default goals based on user activity patterns
  const getDefaultGoals = (): Goal[] => {
    // Calculate current week's CO₂ (from all activities this week)
    const currentWeekCO2 = calculateCurrentWeekCO2();
    const todaysTotal = todayData?.todayTotal || 0;
    const activityCount = userStats?.activityCount || 0;
    
    return [
      {
        id: '1',
        name: 'Weekly CO₂ Target',
        type: 'weekly',
        target: 50,
        current: currentWeekCO2, // Use actual week's CO₂ total
        unit: 'kg CO₂',
        icon: '📅',
        color: '#4CAF50',
        description: 'Keep weekly carbon emissions under 50kg'
      },
      {
        id: '2',
        name: 'Monthly Activity Goal',
        type: 'monthly',
        target: 100,
        current: activityCount,
        unit: 'activities',
        icon: '📊',
        color: '#2196F3',
        description: 'Log 100 eco-friendly activities per month'
      },
      {
        id: '3',
        name: 'Daily Eco Actions',
        type: 'weekly',
        target: 21, // 3 per day * 7 days
        current: Math.min(activityCount, 21),
        unit: 'actions',
        icon: '🌱',
        color: '#FF9800',
        description: 'Take 3 eco-friendly actions daily'
      }
    ];
  };

  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Calculate achievements based on real user data
  const calculateAchievements = (): Achievement[] => {
    const activityCount = userStats?.activityCount || 0;
    const totalCO2 = userStats?.totalCO2 || 0;
    const daysActive = userStats?.daysActive || 0;
    const todayTotal = todayData?.todayTotal || 0;
    const allTimeHabits = userStats?.allTimeHabits || [];
    
    // Count activities by category
    const categoryStats = allTimeHabits.reduce((acc, log) => {
      const categoryName = log.category.name;
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const transportCount = categoryStats['Transport'] || 0;
    const foodCount = categoryStats['Food'] || 0;
    const energyCount = categoryStats['Energy'] || 0;
    const wasteCount = categoryStats['Waste'] || 0;
    
    // Count eco-friendly activities (low CO2 activities < 1kg)
    const ecoFriendlyCount = allTimeHabits.filter(log => log.co2Impact < 1).length;
    
    // Count high-impact activities for awareness
    const highImpactCount = allTimeHabits.filter(log => log.co2Impact >= 10).length;
    
    // Calculate consecutive days (simplified - actual would need more complex logic)
    const consecutiveDays = Math.min(daysActive, 30);
    
    // Calculate weekly consistency
    const thisWeekActivities = allTimeHabits.filter(log => {
      const logDate = new Date(log.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    }).length;

    return [
      // STARTER ACHIEVEMENTS
      {
        id: '1',
        name: 'First Steps',
        description: 'Welcome to EcoTrack! Log your first activity',
        icon: '�',
        color: '#4CAF50',
        category: 'starter',
        difficulty: 'easy',
        unlockedAt: activityCount > 0 ? new Date('2025-10-01') : undefined,
        progress: Math.min(activityCount, 1),
        maxProgress: 1,
        xpReward: 10,
        requirements: 'Log 1 activity'
      },
      {
        id: '2',
        name: 'Getting Started',
        description: 'You\'re on a roll! Log 5 activities',
        icon: '🚀',
        color: '#2196F3',
        category: 'starter',
        difficulty: 'easy',
        unlockedAt: activityCount >= 5 ? new Date() : undefined,
        progress: Math.min(activityCount, 5),
        maxProgress: 5,
        xpReward: 25,
        requirements: 'Log 5 activities'
      },
      {
        id: '3',
        name: 'Daily Tracker',
        description: 'Track activities today to stay consistent',
        icon: '📱',
        color: '#FFC107',
        category: 'starter',
        difficulty: 'easy',
        unlockedAt: todayTotal > 0 ? new Date() : undefined,
        progress: todayTotal > 0 ? 1 : 0,
        maxProgress: 1,
        xpReward: 5,
        requirements: 'Log activity today'
      },

      // CONSISTENCY ACHIEVEMENTS
      {
        id: '4',
        name: 'Week Warrior',
        description: 'Stay consistent for 7 days of tracking',
        icon: '📅',
        color: '#FF9800',
        category: 'consistency',
        difficulty: 'medium',
        unlockedAt: daysActive >= 7 ? new Date() : undefined,
        progress: Math.min(daysActive, 7),
        maxProgress: 7,
        xpReward: 50,
        requirements: 'Track for 7 days'
      },
      {
        id: '5',
        name: 'Monthly Dedication',
        description: 'Amazing dedication! Track for 30 days',
        icon: '🔥',
        color: '#FF5722',
        category: 'consistency',
        difficulty: 'hard',
        unlockedAt: daysActive >= 30 ? new Date() : undefined,
        progress: Math.min(daysActive, 30),
        maxProgress: 30,
        xpReward: 200,
        requirements: 'Track for 30 days'
      },
      {
        id: '6',
        name: 'Weekly Achiever',
        description: 'Log activities 5+ times this week',
        icon: '⭐',
        color: '#9C27B0',
        category: 'consistency',
        difficulty: 'medium',
        unlockedAt: thisWeekActivities >= 5 ? new Date() : undefined,
        progress: Math.min(thisWeekActivities, 5),
        maxProgress: 5,
        xpReward: 30,
        requirements: '5 activities this week'
      },

      // MILESTONE ACHIEVEMENTS
      {
        id: '7',
        name: 'Activity Collector',
        description: 'Impressive! Log 25 total activities',
        icon: '📊',
        color: '#607D8B',
        category: 'milestone',
        difficulty: 'medium',
        unlockedAt: activityCount >= 25 ? new Date() : undefined,
        progress: Math.min(activityCount, 25),
        maxProgress: 25,
        xpReward: 75,
        requirements: 'Log 25 activities'
      },
      {
        id: '8',
        name: 'Century Club',
        description: 'Incredible milestone! Log 100 activities',
        icon: '�',
        color: '#4CAF50',
        category: 'milestone',
        difficulty: 'hard',
        unlockedAt: activityCount >= 100 ? new Date() : undefined,
        progress: Math.min(activityCount, 100),
        maxProgress: 100,
        xpReward: 300,
        requirements: 'Log 100 activities'
      },
      {
        id: '9',
        name: 'CO₂ Tracker',
        description: 'Track any amount of CO₂ impact',
        icon: '💚',
        color: '#8BC34A',
        category: 'milestone',
        difficulty: 'easy',
        unlockedAt: totalCO2 > 0 ? new Date() : undefined,
        progress: totalCO2 > 0 ? 1 : 0,
        maxProgress: 1,
        xpReward: 15,
        requirements: 'Track CO₂ impact'
      },

      // CATEGORY MASTERY ACHIEVEMENTS  
      {
        id: '10',
        name: 'Transport Expert',
        description: 'Master of mobility! Log 15 transport activities',
        icon: '�',
        color: '#FF6B6B',
        category: 'mastery',
        difficulty: 'medium',
        unlockedAt: transportCount >= 15 ? new Date() : undefined,
        progress: Math.min(transportCount, 15),
        maxProgress: 15,
        xpReward: 60,
        requirements: '15 transport activities'
      },
      {
        id: '11',
        name: 'Food Conscious',
        description: 'Mindful eating! Log 10 food activities',
        icon: '🍽️',
        color: '#4ECDC4',
        category: 'mastery',
        difficulty: 'medium',
        unlockedAt: foodCount >= 10 ? new Date() : undefined,
        progress: Math.min(foodCount, 10),
        maxProgress: 10,
        xpReward: 50,
        requirements: '10 food activities'
      },
      {
        id: '12',
        name: 'Energy Saver',
        description: 'Power awareness! Log 10 energy activities',
        icon: '⚡',
        color: '#45B7D1',
        category: 'mastery',
        difficulty: 'medium',
        unlockedAt: energyCount >= 10 ? new Date() : undefined,
        progress: Math.min(energyCount, 10),
        maxProgress: 10,
        xpReward: 50,
        requirements: '10 energy activities'
      },

      // SPECIAL ACHIEVEMENTS
      {
        id: '13',
        name: 'Eco Champion',
        description: 'Environmental hero! Log 25 low-impact activities',
        icon: '🌍',
        color: '#2196F3',
        category: 'special',
        difficulty: 'hard',
        unlockedAt: ecoFriendlyCount >= 25 ? new Date() : undefined,
        progress: Math.min(ecoFriendlyCount, 25),
        maxProgress: 25,
        xpReward: 150,
        requirements: '25 eco-friendly activities'
      },
      {
        id: '14',
        name: 'Impact Aware',
        description: 'Understanding footprint! Track 5 high-impact activities',
        icon: '⚠️',
        color: '#FF9800',
        category: 'special',
        difficulty: 'medium',
        unlockedAt: highImpactCount >= 5 ? new Date() : undefined,
        progress: Math.min(highImpactCount, 5),
        maxProgress: 5,
        xpReward: 40,
        requirements: '5 high-impact activities'
      },
      {
        id: '15',
        name: 'Data Master',
        description: 'Track activities across all 4+ categories',
        icon: '�',
        color: '#6A1B9A',
        category: 'special',
        difficulty: 'hard',
        unlockedAt: Object.keys(categoryStats).length >= 4 ? new Date() : undefined,
        progress: Math.min(Object.keys(categoryStats).length, 4),
        maxProgress: 4,
        xpReward: 100,
        requirements: 'Use 4+ categories'
      }
    ];
  };

  // Load user data from API
  useEffect(() => {
    loadUserData();
  }, []);

  // Update goals, achievements, and challenges when data changes
  useEffect(() => {
    if (todayData && userStats) {
      setGoals(getDefaultGoals());
      setAchievements(calculateAchievements());
      loadUserChallenges(); // Load challenges from database
      updateAllChallengeProgress(); // Update progress for all active challenges
      setLoading(false);
    }
  }, [todayData, userStats]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load today's data
      const todayResponse = await habitAPI.getTodayImpact(userId);
      if (todayResponse.success && todayResponse.data) {
        setTodayData(todayResponse.data);
      }

      // Load filtered habit logs to get comprehensive stats
      const habitLogsResponse = await habitAPI.getFilteredHabitLogs(userId);
      if (habitLogsResponse.success && habitLogsResponse.data) {
        const { habitLogs, totalCO2, activityCount } = habitLogsResponse.data;
        
        // Calculate days active (unique dates)
        const uniqueDates = new Set(habitLogs.map(log => 
          new Date(log.date).toDateString()
        ));
        const daysActive = uniqueDates.size;

        // Get weekly and monthly stats
        const weeklyResponse = await habitAPI.getWeeklyStats(userId);
        const monthlyResponse = await habitAPI.getMonthlyStats(userId);

        setUserStats({
          totalCO2,
          activityCount,
          daysActive,
          weeklyStats: weeklyResponse.data,
          monthlyStats: monthlyResponse.data,
          allTimeHabits: habitLogs
        });
      } else {
        // No data yet, set empty stats
        setUserStats({
          totalCO2: 0,
          activityCount: 0,
          daysActive: 0,
          weeklyStats: null,
          monthlyStats: null,
          allTimeHabits: []
        });
        setTodayData({
          todayTotal: 0,
          weeklyGoal: 50,
          weeklyProgress: 0,
          activities: [],
          activityCount: 0
        });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      Alert.alert('Error', 'Failed to load your activity data. Please check your connection.');
      setLoading(false);
    }
  };

  // Load challenges from database
  const loadUserChallenges = async () => {
    try {
      const response = await habitAPI.getUserChallenges(getCurrentUserId());
      if (response.success && response.data) {
        const activeChallenges = response.data.active || [];
        const completedChallenges = response.data.completed || [];
        
        // Convert database challenges to frontend format
        const frontendChallenges: Challenge[] = activeChallenges.map(dbChallenge => ({
          id: dbChallenge.challengeId,
          name: dbChallenge.challengeName,
          description: dbChallenge.challengeDescription,
          participants: Math.floor(Math.random() * 500) + 200, // Still simulated for now
          duration: dbChallenge.type === 'weekly' ? '7 days' : dbChallenge.type === 'monthly' ? '30 days' : '14 days',
          reward: dbChallenge.reward,
          icon: dbChallenge.icon,
          color: dbChallenge.color,
          joined: true, // Already joined if in database
          target: dbChallenge.target,
          userProgress: dbChallenge.currentProgress,
          category: dbChallenge.category,
          type: dbChallenge.type,
          endDate: new Date(dbChallenge.endDate),
          targetMetric: dbChallenge.targetMetric,
          completed: dbChallenge.status === 'completed',
          completedAt: dbChallenge.completedAt ? new Date(dbChallenge.completedAt) : undefined,
          globalRank: dbChallenge.globalRank,
          co2Saved: dbChallenge.co2Saved
        }));

        // Also include available challenges that user hasn't joined yet
        const generatedChallenges = generateChallenges();
        const joinedChallengeIds = new Set(activeChallenges.map(c => c.challengeId));
        const availableChallenges = generatedChallenges.filter(c => !joinedChallengeIds.has(c.id));

        setChallenges([...frontendChallenges, ...availableChallenges]);
        
        // Check for newly completed challenges
        checkForNewCompletions(activeChallenges);
      }
    } catch (error) {
      console.error('Failed to load challenges:', error);
      // Fallback to generated challenges if API fails
      setChallenges(generateChallenges());
    }
  };

  // Check for newly completed challenges and show completion modal
  const checkForNewCompletions = async (dbChallenges: any[]) => {
    for (const challenge of dbChallenges) {
      // Check if challenge was just completed (progress >= target and status is active)
      if (challenge.currentProgress >= challenge.target && challenge.status === 'active') {
        // Show completion modal for newly completed challenge
        setTimeout(() => {
          showChallengeCompletionModal(challenge);
        }, 500);
      }
      // Also check for challenges that are marked as completed but haven't been shared yet
      else if (challenge.status === 'completed' && !challenge.shared) {
        // Optionally show a less intrusive notification for unshared completed challenges
        console.log(`Challenge ${challenge.challengeName} is completed but not shared yet`);
      }
    }
  };

  // Join a challenge in the database
  const joinChallengeInDB = async (challenge: Challenge) => {
    try {
      const challengeData = {
        challengeId: challenge.id,
        challengeName: challenge.name,
        challengeDescription: challenge.description,
        category: challenge.category,
        type: challenge.type,
        target: challenge.target,
        targetMetric: challenge.targetMetric,
        endDate: challenge.endDate.toISOString(),
        reward: challenge.reward,
        icon: challenge.icon,
        color: challenge.color
      };

      const response = await habitAPI.joinChallenge(getCurrentUserId(), challengeData);
      if (response.success) {
        // Reload challenges to get updated data
        await loadUserChallenges();
        Alert.alert('Challenge Joined!', `You've joined the ${challenge.name} challenge. Good luck!`);
      }
    } catch (error) {
      console.error('Failed to join challenge:', error);
      Alert.alert('Error', 'Failed to join challenge. Please try again.');
    }
  };

  // Update challenge progress for all active challenges
  const updateAllChallengeProgress = async () => {
    try {
      const response = await habitAPI.getUserChallenges(getCurrentUserId());
      if (response.success && response.data?.active) {
        for (const challenge of response.data.active) {
          await habitAPI.updateChallengeProgress(getCurrentUserId(), challenge.challengeId);
        }
        // Reload challenges after updating progress
        await loadUserChallenges();
      }
    } catch (error) {
      console.error('Failed to update challenge progress:', error);
    }
  };

  // Show challenge completion modal with sharing options
  const showChallengeCompletionModal = (challenge: any) => {
    Alert.alert(
      '🎉 Challenge Completed!',
      `Congratulations! You've completed the ${challenge.challengeName}!\n\n${challenge.reward}`,
      [
        {
          text: 'Share Achievement',
          onPress: () => openSharingModal(challenge)
        },
        {
          text: 'Continue',
          style: 'default'
        }
      ]
    );
  };

  // Get current user ID (this should be replaced with actual auth)
  const getCurrentUserId = () => {
    return 'testuser'; // Replace with actual user ID from authentication
  };

  // Open sharing modal for completed challenge
  const openSharingModal = (challenge: Challenge | any) => {
    // Convert database challenge format to frontend format if needed
    const normalizedChallenge: Challenge = {
      id: challenge.challengeId || challenge.id,
      name: challenge.challengeName || challenge.name,
      description: challenge.challengeDescription || challenge.description,
      participants: challenge.participants || 0,
      duration: challenge.duration || '',
      reward: challenge.reward,
      icon: challenge.icon,
      color: challenge.color,
      joined: challenge.joined || true,
      target: challenge.target,
      userProgress: challenge.currentProgress || challenge.userProgress,
      category: challenge.category,
      type: challenge.type,
      endDate: challenge.endDate ? new Date(challenge.endDate) : new Date(),
      targetMetric: challenge.targetMetric,
      completed: challenge.status === 'completed' || challenge.completed,
      completedAt: challenge.completedAt ? new Date(challenge.completedAt) : undefined,
      globalRank: challenge.globalRank,
      co2Saved: challenge.co2Saved
    };
    
    setSelectedChallenge(normalizedChallenge);
    setShowSharingModal(true);
    setSharingOptions({
      includeRank: false,
      includeCO2: false,
      platform: null
    });
  };

  // Generate sharing message
  const generateSharingMessage = (challenge: Challenge, options: SharingOptions): string => {
    let message = `🎉 I completed the ${challenge.name} Challenge! ${challenge.reward}`;
    
    if (options.includeRank && challenge.globalRank) {
      message += `\n🏆 Ranked #${challenge.globalRank} globally!`;
    }
    
    if (options.includeCO2 && challenge.co2Saved) {
      message += `\n🌱 Saved ${challenge.co2Saved.toFixed(2)}kg CO₂`;
    }
    
    message += '\n\n#EcoTrack #SustainableLiving #ClimateAction';
    
    return message;
  };

  // Handle social sharing
  const handleShare = async (platform: 'instagram' | 'whatsapp' | 'facebook') => {
    if (!selectedChallenge) return;

    const message = generateSharingMessage(selectedChallenge, {
      ...sharingOptions,
      platform
    });

    try {
      // Only try to mark challenge as shared in database if it's a real challenge (not a test)
      if (selectedChallenge.id && !selectedChallenge.id.startsWith('test-')) {
        try {
          await habitAPI.markChallengeShared(getCurrentUserId(), selectedChallenge.id, platform);
          console.log(`Successfully marked challenge ${selectedChallenge.id} as shared to ${platform}`);
        } catch (dbError) {
          // If database update fails, continue with sharing but log the error
          console.warn('Failed to mark challenge as shared in database:', dbError);
          // Don't stop the sharing process for database errors
        }
      } else {
        console.log(`Skipping database update for test challenge: ${selectedChallenge.id}`);
      }
      
      const shareOptions = {
        message: message,
        title: `${selectedChallenge.name} Challenge Completed!`,
        ...(platform === 'instagram' && { url: 'https://instagram.com' }), // Optional: deep link
        ...(platform === 'whatsapp' && { url: 'whatsapp://send?text=' + encodeURIComponent(message) }), // WhatsApp deep link
        ...(platform === 'facebook' && { url: 'https://facebook.com/sharer.php?u=' + encodeURIComponent(message) }) // Facebook share
      };

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        setShowSharingModal(false);
        const isTestChallenge = selectedChallenge.id?.startsWith('test-');
        Alert.alert(
          'Shared Successfully! 🎉', 
          isTestChallenge 
            ? `Test sharing completed! In a real app, your ${selectedChallenge.name} achievement would be shared to ${platform}.`
            : `Your ${selectedChallenge.name} achievement has been shared to ${platform}!`
        );
      } else if (result.action === Share.dismissedAction) {
        console.log('Share was dismissed');
        // Don't show an error for dismissal - this is normal user behavior
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      Alert.alert('Sharing Error', 'Failed to share your achievement. Please try again.');
    }
  };

  // Generate real challenges based on user activity data
  const generateChallenges = (): Challenge[] => {
    const allTimeHabits = userStats?.allTimeHabits || [];
    const activityCount = userStats?.activityCount || 0;
    const daysActive = userStats?.daysActive || 0;
    
    // Calculate user's category activity counts
    const categoryStats = allTimeHabits.reduce((acc, log) => {
      const categoryName = log.category.name;
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const transportCount = categoryStats['Transport'] || 0;
    const foodCount = categoryStats['Food'] || 0;
    const energyCount = categoryStats['Energy'] || 0;
    const wasteCount = categoryStats['Waste'] || 0;
    
    // Calculate this week's activities
    const thisWeekActivities = allTimeHabits.filter(log => {
      const logDate = new Date(log.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    }).length;
    
    // Calculate low CO2 activities this month
    const thisMonthEcoActivities = allTimeHabits.filter(log => {
      const logDate = new Date(log.date);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return logDate >= monthAgo && log.co2Impact < 2;
    }).length;
    
    const currentDate = new Date();
    
    return [
      // Weekly Activity Challenge
      {
        id: '1',
        name: 'Weekly Sprint',
        description: 'Log 10 activities this week',
        participants: Math.floor(Math.random() * 500) + 200, // Simulated participants
        duration: '7 days',
        reward: '�‍♂️ Sprint Champion Badge',
        icon: '📈',
        color: '#4CAF50',
        joined: thisWeekActivities >= 5, // Auto-join if user is active
        target: 10,
        userProgress: thisWeekActivities,
        category: 'general',
        type: 'weekly',
        endDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        targetMetric: 'activities'
      },
      
      // Transport Challenge
      {
        id: '2',
        name: 'Green Transport',
        description: 'Log 15 eco-friendly transport activities',
        participants: Math.floor(Math.random() * 300) + 150,
        duration: '30 days',
        reward: '� Eco Commuter Badge',
        icon: '�',
        color: '#2196F3',
        joined: transportCount >= 5,
        target: 15,
        userProgress: Math.min(transportCount, 15),
        category: 'Transport',
        type: 'monthly',
        endDate: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        targetMetric: 'categorySpecific'
      },
      
      // Low Carbon Challenge
      {
        id: '3',
        name: 'Carbon Hero',
        description: 'Log 20 low-impact activities (< 2kg CO₂)',
        participants: Math.floor(Math.random() * 800) + 400,
        duration: '30 days',
        reward: '🌍 Carbon Hero Badge',
        icon: '💚',
        color: '#8BC34A',
        joined: thisMonthEcoActivities >= 8,
        target: 20,
        userProgress: thisMonthEcoActivities,
        category: 'eco-friendly',
        type: 'monthly',
        endDate: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        targetMetric: 'co2Reduction'
      },
      
      // Consistency Challenge
      {
        id: '4',
        name: 'Streak Master',
        description: 'Track activities for 14 consecutive days',
        participants: Math.floor(Math.random() * 600) + 300,
        duration: '14 days',
        reward: '🔥 Streak Master Badge',
        icon: '📅',
        color: '#FF9800',
        joined: daysActive >= 7,
        target: 14,
        userProgress: Math.min(daysActive, 14),
        category: 'consistency',
        type: 'streak',
        endDate: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        targetMetric: 'consistency'
      },
      
      // Food Challenge
      {
        id: '5',
        name: 'Mindful Eating',
        description: 'Log 12 food-related activities',
        participants: Math.floor(Math.random() * 400) + 200,
        duration: '21 days',
        reward: '🥗 Mindful Eater Badge',
        icon: '🍽️',
        color: '#4ECDC4',
        joined: foodCount >= 3,
        target: 12,
        userProgress: Math.min(foodCount, 12),
        category: 'Food',
        type: 'monthly',
        endDate: new Date(currentDate.getTime() + 21 * 24 * 60 * 60 * 1000),
        targetMetric: 'categorySpecific'
      },
      
      // Energy Challenge
      {
        id: '6',
        name: 'Energy Saver',
        description: 'Log 8 energy-related activities',
        participants: Math.floor(Math.random() * 350) + 180,
        duration: '7 days',
        reward: '⚡ Energy Guardian Badge',
        icon: '💡',
        color: '#FFC107',
        joined: energyCount >= 2,
        target: 8,
        userProgress: Math.min(energyCount, 8),
        category: 'Energy',
        type: 'weekly',
        endDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        targetMetric: 'categorySpecific'
      }
    ];
  };

  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Sharing state
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [sharingOptions, setSharingOptions] = useState<SharingOptions>({
    includeRank: false,
    includeCO2: false,
    platform: null
  });

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleCreateGoal = () => {
    if (!newGoal.name || !newGoal.target) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      type: newGoal.type,
      target: parseFloat(newGoal.target),
      current: 0,
      unit: newGoal.unit,
      icon: newGoal.icon,
      color: '#4CAF50',
      description: newGoal.description
    };

    setGoals([...goals, goal]);
    setNewGoal({
      name: '',
      type: 'weekly',
      target: '',
      unit: 'kg CO₂',
      icon: '🎯',
      description: ''
    });
    setShowCreateGoal(false);
    Alert.alert('Success', 'Goal created successfully!');
  };

  const joinChallenge = async (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    if (!challenge.joined) {
      // Join challenge in database
      await joinChallengeInDB(challenge);
    } else {
      // Already joined - for now just update local state
      setChallenges(challenges.map(c => 
        c.id === challengeId 
          ? { ...c, joined: !c.joined, participants: c.joined ? c.participants - 1 : c.participants + 1 }
          : c
      ));
    }
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'goals', label: 'Goals', icon: '🎯' },
        { key: 'achievements', label: 'Badges', icon: '🏆' },
        { key: 'challenges', label: 'Social', icon: '👥' },
        { key: 'reports', label: 'Reports', icon: '📊' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tabItem, activeTab === tab.key && styles.activeTabItem]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderGoalsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Goals</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateGoal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Goal</Text>
        </TouchableOpacity>
      </View>

      {goals.map((goal) => (
        <View key={goal.id} style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalIcon}>{goal.icon}</Text>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>{goal.name}</Text>
              <Text style={styles.goalStatus}>
                {goal.current} / {goal.target} {goal.unit}
              </Text>
            </View>
            <Text style={styles.goalProgress}>
              {Math.round(calculateProgress(goal.current, goal.target))}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill, 
              { 
                width: `${calculateProgress(goal.current, goal.target)}%`,
                backgroundColor: goal.color 
              }
            ]} />
          </View>
          <Text style={styles.goalDescription}>{goal.description}</Text>
        </View>
      ))}
    </View>
  );

  const renderAchievementsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Achievement Badges</Text>
      <Text style={styles.sectionSubtitle}>
        Unlock badges by completing milestones and challenges
      </Text>

      <View style={styles.achievementGrid}>
        {achievements.map((achievement) => (
          <TouchableOpacity
            key={achievement.id}
            style={[
              styles.achievementBadge,
              achievement.unlockedAt && styles.unlockedBadge,
              {
                borderColor: achievement.unlockedAt ? achievement.color : '#e0e0e0',
                backgroundColor: achievement.unlockedAt ? achievement.color + '10' : '#f8f8f8'
              }
            ]}
            onPress={() => setShowAchievementDetail(achievement)}
          >
            {/* Category and Difficulty Tags */}
            <View style={styles.achievementTags}>
              <View style={[
                styles.categoryTag,
                { backgroundColor: achievement.unlockedAt ? achievement.color : '#ccc' }
              ]}>
                <Text style={styles.categoryTagText}>
                  {achievement.category.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Achievement Icon */}
            <Text style={[
              styles.achievementBadgeIcon,
              !achievement.unlockedAt && styles.lockedIcon
            ]}>
              {achievement.unlockedAt ? achievement.icon : '🔒'}
            </Text>

            {/* Achievement Name */}
            <Text style={[
              styles.achievementBadgeName,
              !achievement.unlockedAt && styles.lockedText,
              { color: achievement.unlockedAt ? achievement.color : '#666' }
            ]}>
              {achievement.name}
            </Text>

            {/* XP Reward */}
            {achievement.unlockedAt && (
              <View style={styles.xpRewardBadge}>
                <Text style={styles.xpRewardText}>+{achievement.xpReward} XP</Text>
              </View>
            )}

            {/* Progress Bar */}
            {!achievement.unlockedAt && (
              <View style={styles.achievementProgress}>
                <View style={styles.achievementProgressBar}>
                  <View style={[
                    styles.achievementProgressFill,
                    { 
                      width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                      backgroundColor: achievement.color
                    }
                  ]} />
                </View>
                <Text style={styles.achievementProgressText}>
                  {achievement.progress}/{achievement.maxProgress}
                </Text>
              </View>
            )}

            {/* Requirements */}
            <Text style={styles.achievementRequirements}>
              {achievement.requirements}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderChallengesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Social Challenges</Text>
      <Text style={styles.sectionSubtitle}>
        Join challenges and track your progress
      </Text>

      {challenges.map((challenge) => {
        const progressPercentage = Math.min((challenge.userProgress / challenge.target) * 100, 100);
        const isCompleted = challenge.userProgress >= challenge.target;
        const timeLeft = Math.ceil((challenge.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <View key={challenge.id} style={[
            styles.challengeCard,
            {
              borderColor: challenge.joined ? challenge.color : '#e0e0e0',
              backgroundColor: challenge.joined ? challenge.color + '08' : '#fff'
            }
          ]}>
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeIcon}>{challenge.icon}</Text>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeName}>{challenge.name}</Text>
                <Text style={styles.challengeDesc}>{challenge.description}</Text>
                
                {/* Simplified Progress */}
                <View style={styles.challengeProgress}>
                  <View style={styles.challengeProgressHeader}>
                    <Text style={styles.challengeProgressText}>
                      {challenge.userProgress}/{challenge.target}
                    </Text>
                    <Text style={[
                      styles.challengeProgressPercentage,
                      { color: challenge.color }
                    ]}>
                      {Math.round(progressPercentage)}%
                    </Text>
                  </View>
                  
                  <View style={styles.challengeProgressBar}>
                    <View style={[
                      styles.challengeProgressFill,
                      {
                        width: `${progressPercentage}%`,
                        backgroundColor: challenge.color
                      }
                    ]} />
                  </View>
                </View>
                
                {/* Simplified Meta Info */}
                <View style={styles.challengeMeta}>
                  <Text style={styles.challengeMetaText}>
                    👥 {challenge.participants}
                  </Text>
                  <Text style={styles.challengeMetaText}>
                    ⏱️ {timeLeft > 0 ? `${timeLeft}d left` : 'Expired'}
                  </Text>
                  {isCompleted && (
                    <Text style={styles.challengeCompletedBadge}>
                      � Done!
                    </Text>
                  )}
                </View>
              </View>
            </View>
            
            {isCompleted ? (
              <View style={styles.challengeCompletedActions}>
                <TouchableOpacity
                  style={[styles.challengeButton, styles.challengeButtonCompleted]}
                  disabled={true}
                >
                  <Text style={[styles.challengeButtonText, styles.challengeButtonTextCompleted]}>
                    ✅ Completed
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.challengeButton, styles.challengeShareButton]}
                  onPress={() => openSharingModal(challenge)}
                >
                  <Text style={[styles.challengeButtonText, styles.challengeShareButtonText]}>
                    📤 Share
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.challengeButton,
                  challenge.joined && styles.challengeButtonJoined
                ]}
                onPress={() => joinChallenge(challenge.id)}
              >
                <Text style={[
                  styles.challengeButtonText,
                  challenge.joined && styles.challengeButtonTextJoined
                ]}>
                  {challenge.joined ? '✓ Joined' : 'Join'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );

  const renderReportsTab = () => {
    // Calculate real statistics from user data
    const allTimeHabits = userStats?.allTimeHabits || [];
    const activityCount = userStats?.activityCount || 0;
    const totalCO2 = userStats?.totalCO2 || 0;
    const daysActive = userStats?.daysActive || 0;
    
    // Calculate goals progress
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => 
      calculateProgress(goal.current, goal.target) >= 100
    ).length;
    const goalAchievementRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    // Calculate achievements progress
    const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;
    const totalAchievements = achievements.length;
    const achievementRate = totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0;
    
    // Category breakdown
    const categoryStats = allTimeHabits.reduce((acc, log) => {
      const categoryName = log.category.name;
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const transportCount = categoryStats['Transport'] || 0;
    const foodCount = categoryStats['Food'] || 0;
    const energyCount = categoryStats['Energy'] || 0;
    const wasteCount = categoryStats['Waste'] || 0;
    
    // Time-based analysis
    const thisWeekActivities = allTimeHabits.filter(log => {
      const logDate = new Date(log.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    }).length;
    
    const thisMonthActivities = allTimeHabits.filter(log => {
      const logDate = new Date(log.date);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return logDate >= monthAgo;
    }).length;
    
    // CO2 Analysis
    const ecoFriendlyActivities = allTimeHabits.filter(log => log.co2Impact < 2).length;
    const averageCO2 = activityCount > 0 ? (totalCO2 / activityCount) : 0;
    
    // Find most active category
    const topCategory = Object.entries(categoryStats).sort(([,a], [,b]) => b - a)[0];
    
    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Analytics Dashboard</Text>
        <Text style={styles.sectionSubtitle}>
          Your eco-tracking journey insights and progress
        </Text>

        <View style={styles.reportCard}>
          <Text style={styles.reportCardTitle}>📊 Activity Overview</Text>
          <View style={styles.reportStats}>
            <View style={styles.reportStat}>
              <Text style={styles.reportStatValue}>{activityCount}</Text>
              <Text style={styles.reportStatLabel}>Total Activities</Text>
            </View>
            <View style={styles.reportStat}>
              <Text style={styles.reportStatValue}>{totalCO2.toFixed(1)}kg</Text>
              <Text style={styles.reportStatLabel}>CO₂ Tracked</Text>
            </View>
            <View style={styles.reportStat}>
              <Text style={styles.reportStatValue}>{daysActive}</Text>
              <Text style={styles.reportStatLabel}>Days Active</Text>
            </View>
          </View>
        </View>

        <View style={styles.reportCard}>
          <Text style={styles.reportCardTitle}>� Progress Summary</Text>
          <View style={styles.reportProgressSection}>
            <View style={styles.reportProgressItem}>
              <Text style={styles.reportProgressLabel}>Goals Completed</Text>
              <View style={styles.reportProgressBar}>
                <View style={[
                  styles.reportProgressFill,
                  { width: `${goalAchievementRate}%`, backgroundColor: '#4CAF50' }
                ]} />
              </View>
              <Text style={styles.reportProgressText}>{completedGoals}/{totalGoals} ({goalAchievementRate}%)</Text>
            </View>
            
            <View style={styles.reportProgressItem}>
              <Text style={styles.reportProgressLabel}>Achievements Unlocked</Text>
              <View style={styles.reportProgressBar}>
                <View style={[
                  styles.reportProgressFill,
                  { width: `${achievementRate}%`, backgroundColor: '#FF9800' }
                ]} />
              </View>
              <Text style={styles.reportProgressText}>{unlockedAchievements}/{totalAchievements} ({achievementRate}%)</Text>
            </View>
          </View>
        </View>

        <View style={styles.reportCard}>
          <Text style={styles.reportCardTitle}>� Smart Insights</Text>
          {totalCO2 > 0 ? (
            <>
              <Text style={styles.reportInsight}>
                🌱 You've tracked {totalCO2.toFixed(1)}kg of CO₂ across all activities!
              </Text>
              <Text style={styles.reportInsight}>
                � You've been active for {daysActive} day{daysActive !== 1 ? 's' : ''} so far.
              </Text>
              <Text style={styles.reportInsight}>
                🎯 You have {completedGoals} of {totalGoals} goals completed.
              </Text>
            </>
          ) : (
            <Text style={styles.reportInsight}>
              🌟 Start logging activities to see personalized insights about your eco journey!
            </Text>
          )}
        </View>

        <View style={styles.reportCard}>
          <Text style={styles.reportCardTitle}>🚀 Recommendations</Text>
          <View style={styles.reportRecommendations}>
            {activityCount === 0 ? (
              <>
                <Text style={styles.reportRecommendation}>
                  🎯 Log your first activity to start tracking
                </Text>
                <Text style={styles.reportRecommendation}>
                  🌱 Try starting with transport or food activities
                </Text>
                <Text style={styles.reportRecommendation}>
                  📊 Set your first weekly goal
                </Text>
              </>
            ) : (
              <>
                {thisWeekActivities < 3 && (
                  <Text style={styles.reportRecommendation}>
                    📈 Try logging {3 - thisWeekActivities} more activities this week
                  </Text>
                )}
                {transportCount === 0 && (
                  <Text style={styles.reportRecommendation}>
                    🚲 Consider tracking transport activities
                  </Text>
                )}
                {ecoFriendlyActivities < activityCount * 0.5 && (
                  <Text style={styles.reportRecommendation}>
                    🌿 Focus on more low-carbon activities
                  </Text>
                )}
                {unlockedAchievements < 3 && (
                  <Text style={styles.reportRecommendation}>
                    🏆 Work towards unlocking more achievements
                  </Text>
                )}
                <Text style={styles.reportRecommendation}>
                  👥 Join challenges to stay motivated
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>🎯 Goals & Achievements</Text>
          <Text style={styles.subtitle}>
            Set targets and track your progress towards a greener lifestyle
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your progress...</Text>
            </View>
          ) : (
            <>
              {renderTabBar()}

              {activeTab === 'goals' && renderGoalsTab()}
              {activeTab === 'achievements' && renderAchievementsTab()}
              {activeTab === 'challenges' && renderChallengesTab()}
              {activeTab === 'reports' && renderReportsTab()}
            </>
          )}
        </View>
      </ScrollView>

      {/* Create Goal Modal */}
      <Modal
        visible={showCreateGoal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateGoal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Goal</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal Name</Text>
              <TextInput
                style={styles.input}
                value={newGoal.name}
                onChangeText={(text) => setNewGoal({...newGoal, name: text})}
                placeholder="e.g., Weekly Cycling Goal"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Goal Type</Text>
              <View style={styles.goalTypeButtons}>
                {['weekly', 'monthly', 'yearly', 'custom'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.goalTypeButton,
                      newGoal.type === type && styles.selectedGoalType
                    ]}
                    onPress={() => setNewGoal({...newGoal, type: type as any})}
                  >
                    <Text style={[
                      styles.goalTypeText,
                      newGoal.type === type && styles.selectedGoalTypeText
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, {flex: 1, marginRight: 8}]}>
                <Text style={styles.inputLabel}>Target</Text>
                <TextInput
                  style={styles.input}
                  value={newGoal.target}
                  onChangeText={(text) => setNewGoal({...newGoal, target: text})}
                  placeholder="50"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, {flex: 1, marginLeft: 8}]}>
                <Text style={styles.inputLabel}>Unit</Text>
                <TextInput
                  style={styles.input}
                  value={newGoal.unit}
                  onChangeText={(text) => setNewGoal({...newGoal, unit: text})}
                  placeholder="kg CO₂"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newGoal.description}
                onChangeText={(text) => setNewGoal({...newGoal, description: text})}
                placeholder="Describe your goal..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateGoal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateGoal}
              >
                <Text style={styles.createButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Achievement Detail Modal */}
      <Modal
        visible={!!showAchievementDetail}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAchievementDetail(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAchievementDetail(null)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {showAchievementDetail && (
              <>
                {/* Achievement Icon */}
                <Text style={styles.achievementDetailIcon}>
                  {showAchievementDetail.unlockedAt ? showAchievementDetail.icon : '🔒'}
                </Text>

                {/* Category and Difficulty */}
                <View style={styles.achievementDetailMeta}>
                  <View style={[
                    styles.categoryTag,
                    { backgroundColor: showAchievementDetail.color }
                  ]}>
                    <Text style={styles.categoryTagText}>
                      {showAchievementDetail.category.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.achievementDetailDifficulty}>
                    {showAchievementDetail.difficulty === 'easy' ? 'Easy' : 
                     showAchievementDetail.difficulty === 'medium' ? 'Medium' : 'Hard'}
                  </Text>
                </View>

                {/* Achievement Name */}
                <Text style={[
                  styles.achievementDetailName,
                  { color: showAchievementDetail.color }
                ]}>
                  {showAchievementDetail.name}
                </Text>

                {/* Description */}
                <Text style={styles.achievementDetailDesc}>
                  {showAchievementDetail.description}
                </Text>

                {/* Requirements */}
                <Text style={styles.achievementDetailRequirements}>
                  Requirements: {showAchievementDetail.requirements}
                </Text>

                {/* XP Reward */}
                {showAchievementDetail.unlockedAt && (
                  <View style={styles.xpRewardBadge}>
                    <Text style={styles.xpRewardText}>
                      Earned: +{showAchievementDetail.xpReward} XP
                    </Text>
                  </View>
                )}
                
                {/* Status */}
                {showAchievementDetail.unlockedAt ? (
                  <Text style={styles.achievementUnlockedDate}>
                    🎉 Unlocked on {showAchievementDetail.unlockedAt.toLocaleDateString()}
                  </Text>
                ) : (
                  <View style={styles.achievementDetailProgress}>
                    <Text style={styles.achievementDetailProgressText}>
                      Progress: {showAchievementDetail.progress} / {showAchievementDetail.maxProgress} 
                      ({Math.round((showAchievementDetail.progress / showAchievementDetail.maxProgress) * 100)}%)
                    </Text>
                    <View style={styles.achievementDetailProgressBar}>
                      <View style={[
                        styles.achievementDetailProgressFill,
                        { 
                          width: `${(showAchievementDetail.progress / showAchievementDetail.maxProgress) * 100}%`,
                          backgroundColor: showAchievementDetail.color
                        }
                      ]} />
                    </View>
                    <Text style={styles.achievementDetailRemaining}>
                      {showAchievementDetail.maxProgress - showAchievementDetail.progress} more to unlock!
                    </Text>
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Challenge Sharing Modal */}
      <Modal
        visible={showSharingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSharingModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSharingModal(false)}
        >
          <TouchableOpacity 
            style={styles.sharingModalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedChallenge && (
              <>
                {/* Badge Preview */}
                <View style={[styles.sharingBadgePreview, { backgroundColor: selectedChallenge.color }]}>
                  <Text style={styles.sharingBadgeIcon}>{selectedChallenge.icon}</Text>
                  <Text style={styles.sharingBadgeTitle}>{selectedChallenge.name}</Text>
                  <Text style={styles.sharingBadgeReward}>{selectedChallenge.reward}</Text>
                </View>

                <Text style={styles.sharingTitle}>Share Your Achievement! 🎉</Text>
                
                {/* Message Preview */}
                <View style={styles.messagePreview}>
                  <Text style={styles.messagePreviewLabel}>Your message:</Text>
                  <Text style={styles.messagePreviewText}>
                    {generateSharingMessage(selectedChallenge, sharingOptions)}
                  </Text>
                </View>

                {/* Sharing Options */}
                <View style={styles.sharingOptions}>
                  <Text style={styles.sharingOptionsTitle}>Include additional info:</Text>
                  
                  <TouchableOpacity 
                    style={styles.sharingOption}
                    onPress={() => setSharingOptions({...sharingOptions, includeRank: !sharingOptions.includeRank})}
                  >
                    <View style={[styles.checkbox, sharingOptions.includeRank && styles.checkboxChecked]}>
                      {sharingOptions.includeRank && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.sharingOptionText}>
                      Include leaderboard rank {selectedChallenge.globalRank ? `(#${selectedChallenge.globalRank})` : ''}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.sharingOption}
                    onPress={() => setSharingOptions({...sharingOptions, includeCO2: !sharingOptions.includeCO2})}
                  >
                    <View style={[styles.checkbox, sharingOptions.includeCO2 && styles.checkboxChecked]}>
                      {sharingOptions.includeCO2 && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.sharingOptionText}>
                      Include CO₂ saved {selectedChallenge.co2Saved ? `(${selectedChallenge.co2Saved.toFixed(2)}kg)` : ''}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Platform Selection */}
                <View style={styles.platformSelection}>
                  <Text style={styles.platformSelectionTitle}>Choose platform:</Text>
                  <View style={styles.platformButtons}>
                    <TouchableOpacity 
                      style={styles.platformButton}
                      onPress={() => handleShare('instagram')}
                    >
                      <Text style={styles.platformIcon}>📷</Text>
                      <Text style={styles.platformText}>Instagram</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.platformButton}
                      onPress={() => handleShare('whatsapp')}
                    >
                      <Text style={styles.platformIcon}>💬</Text>
                      <Text style={styles.platformText}>WhatsApp</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.platformButton}
                      onPress={() => handleShare('facebook')}
                    >
                      <Text style={styles.platformIcon}>👥</Text>
                      <Text style={styles.platformText}>Facebook</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Close Button */}
                <TouchableOpacity 
                  style={styles.sharingCloseButton}
                  onPress={() => setShowSharingModal(false)}
                >
                  <Text style={styles.sharingCloseButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  
  // Tab Bar Styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTabItem: {
    backgroundColor: '#4CAF50',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeTabLabel: {
    color: '#FFFFFF',
  },
  
  // Tab Content
  tabContent: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Goal Card Styles
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  goalStatus: {
    fontSize: 14,
    color: '#666',
  },
  goalProgress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  goalDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  
  // Achievement Styles
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: (screenWidth - 56) / 2,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    opacity: 0.5,
  },
  unlockedBadge: {
    opacity: 1,
  },
  achievementBadgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  lockedIcon: {
    opacity: 0.3,
  },
  achievementBadgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 8,
  },
  lockedText: {
    color: '#999',
  },
  achievementProgress: {
    width: '100%',
    alignItems: 'center',
  },
  achievementProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 4,
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 10,
    color: '#666',
  },
  
  // Challenge Styles
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    borderWidth: 1,
  },
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  challengeIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 3,
  },
  challengeDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  challengeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  challengeMetaText: {
    fontSize: 11,
    color: '#888',
    marginRight: 12,
  },
  challengeReward: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  challengeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  challengeButtonJoined: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  challengeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  challengeButtonTextJoined: {
    color: '#4CAF50',
  },
  
  // New Challenge Progress Styles
  challengeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 50,
  },
  challengeTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  challengeProgress: {
    marginVertical: 8,
  },
  challengeProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  challengeProgressText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  challengeProgressPercentage: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  challengeProgressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  challengeCompleted: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  challengeCompletedBadge: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  challengeButtonCompleted: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  challengeButtonTextCompleted: {
    color: '#4CAF50',
  },
  challengeCompletedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  challengeShareButton: {
    backgroundColor: '#2196F3',
    flex: 1,
  },
  challengeShareButtonText: {
    color: 'white',
  },
  
  // Report Styles
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reportStat: {
    alignItems: 'center',
  },
  reportStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  reportStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  reportAchievements: {
    paddingLeft: 8,
  },
  reportAchievementText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  reportInsight: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
    paddingLeft: 8,
  },
  reportRecommendation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  
  // Progress Section Styles
  reportProgressSection: {
    marginTop: 8,
  },
  reportProgressItem: {
    marginBottom: 16,
  },
  reportProgressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  reportProgressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  reportProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  reportProgressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  reportRecommendations: {
    marginTop: 8,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#212121',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
  },
  goalTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  selectedGoalType: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  goalTypeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedGoalTypeText: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Achievement Detail Modal
  achievementDetailIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  achievementDetailName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementDetailDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  achievementUnlockedDate: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  achievementDetailProgress: {
    marginBottom: 20,
  },
  achievementDetailProgressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementDetailProgressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  achievementDetailProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  
  // New Achievement UI Styles
  achievementTags: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  categoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 50,
  },
  categoryTagText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  xpRewardBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  xpRewardText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  achievementRequirements: {
    fontSize: 9,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  // Achievement Detail Modal Styles
  achievementDetailMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  achievementDetailDifficulty: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  achievementDetailRequirements: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 8,
    fontStyle: 'italic',
  },
  achievementDetailRemaining: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Sharing Modal Styles
  sharingModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sharingBadgePreview: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 15,
    marginBottom: 16,
  },
  sharingBadgeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  sharingBadgeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  sharingBadgeReward: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  sharingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  messagePreview: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  messagePreviewLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 6,
  },
  messagePreviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  sharingOptions: {
    marginBottom: 16,
  },
  sharingOptionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sharingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sharingOptionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  platformSelection: {
    marginBottom: 16,
  },
  platformSelectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  platformButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  platformButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  platformIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  sharingCloseButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 8,
  },
  sharingCloseButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },

});

export default GoalsScreen;