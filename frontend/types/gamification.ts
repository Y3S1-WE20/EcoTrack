export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'carbon' | 'streak' | 'activity' | 'milestone' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: 'carbon_saved' | 'streak_days' | 'activities_logged' | 'goal_completed' | 'community_action';
    value: number;
    period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  };
  reward?: {
    type: 'xp' | 'title' | 'unlock';
    value: string | number;
  };
  earnedAt?: string;
  progress?: number; // 0-100 percentage towards earning this badge
}

export interface Streak {
  id: string;
  type: 'daily_logging' | 'low_carbon' | 'goal_meeting' | 'community_participation';
  currentStreak: number;
  longestStreak: number;
  lastActivity: string;
  isActive: boolean;
  streakBroken?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'carbon' | 'transport' | 'energy' | 'waste' | 'food' | 'custom';
  type: 'reduction' | 'target' | 'habit' | 'milestone';
  targetValue: number;
  currentValue: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused' | 'failed';
  progress: number; // 0-100 percentage
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  points: number; // XP points for completing this goal
  isSmartRecommended?: boolean;
  reminder?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'custom';
    time?: string;
  };
  milestones?: {
    percentage: number;
    reward: string;
    achieved: boolean;
  }[];
}

export interface UserStats {
  totalCarbonSaved: number;
  activitiesLogged: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  badgesEarned: number;
  goalsCompleted: number;
  rank?: {
    global: number;
    friends: number;
    community: number;
  };
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  carbonFootprint: number;
  carbonSaved: number;
  goalsProgress: Array<{
    goalId: string;
    progress: number;
    status: 'on_track' | 'behind' | 'ahead' | 'completed';
  }>;
  badges: Badge[];
  highlights: string[];
  recommendations: string[];
  shareableCard?: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    stats: Array<{ label: string; value: string }>;
  };
}

export const defaultBadges: Badge[] = [
  // Streak Badges
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Log your first activity',
    icon: '👣',
    category: 'activity',
    rarity: 'common',
    requirements: { type: 'activities_logged', value: 1 },
    reward: { type: 'xp', value: 10 },
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day logging streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    requirements: { type: 'streak_days', value: 7 },
    reward: { type: 'xp', value: 50 },
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Log activities for 30 consecutive days',
    icon: '🏆',
    category: 'streak',
    rarity: 'rare',
    requirements: { type: 'streak_days', value: 30 },
    reward: { type: 'xp', value: 200 },
  },
  {
    id: 'eco_legend',
    name: 'Eco Legend',
    description: 'Maintain a 100-day streak',
    icon: '🌟',
    category: 'streak',
    rarity: 'legendary',
    requirements: { type: 'streak_days', value: 100 },
    reward: { type: 'title', value: 'Eco Legend' },
  },

  // Carbon Saving Badges
  {
    id: 'carbon_saver',
    name: 'Carbon Saver',
    description: 'Save 10kg of CO₂ this month',
    icon: '🌱',
    category: 'carbon',
    rarity: 'common',
    requirements: { type: 'carbon_saved', value: 10, period: 'monthly' },
    reward: { type: 'xp', value: 25 },
  },
  {
    id: 'green_champion',
    name: 'Green Champion',
    description: 'Save 50kg of CO₂ this month',
    icon: '🌿',
    category: 'carbon',
    rarity: 'rare',
    requirements: { type: 'carbon_saved', value: 50, period: 'monthly' },
    reward: { type: 'xp', value: 100 },
  },
  {
    id: 'climate_hero',
    name: 'Climate Hero',
    description: 'Save 100kg of CO₂ this month',
    icon: '🌍',
    category: 'carbon',
    rarity: 'epic',
    requirements: { type: 'carbon_saved', value: 100, period: 'monthly' },
    reward: { type: 'xp', value: 250 },
  },

  // Activity Badges
  {
    id: 'public_transport_fan',
    name: 'Public Transport Fan',
    description: 'Use public transport 10 times',
    icon: '🚌',
    category: 'activity',
    rarity: 'common',
    requirements: { type: 'activities_logged', value: 10 },
    reward: { type: 'xp', value: 30 },
  },
  {
    id: 'cycling_enthusiast',
    name: 'Cycling Enthusiast',
    description: 'Cycle 100km in total',
    icon: '🚲',
    category: 'activity',
    rarity: 'rare',
    requirements: { type: 'activities_logged', value: 100 },
    reward: { type: 'xp', value: 75 },
  },
  {
    id: 'waste_warrior',
    name: 'Waste Warrior',
    description: 'Complete 20 recycling activities',
    icon: '♻️',
    category: 'activity',
    rarity: 'rare',
    requirements: { type: 'activities_logged', value: 20 },
    reward: { type: 'xp', value: 60 },
  },

  // Goal Achievement Badges
  {
    id: 'goal_getter',
    name: 'Goal Getter',
    description: 'Complete your first goal',
    icon: '🎯',
    category: 'milestone',
    rarity: 'common',
    requirements: { type: 'goal_completed', value: 1 },
    reward: { type: 'xp', value: 50 },
  },
  {
    id: 'achievement_ace',
    name: 'Achievement Ace',
    description: 'Complete 5 goals',
    icon: '🏅',
    category: 'milestone',
    rarity: 'rare',
    requirements: { type: 'goal_completed', value: 5 },
    reward: { type: 'xp', value: 150 },
  },

  // Social Badges
  {
    id: 'community_member',
    name: 'Community Member',
    description: 'Join a community challenge',
    icon: '👥',
    category: 'social',
    rarity: 'common',
    requirements: { type: 'community_action', value: 1 },
    reward: { type: 'xp', value: 20 },
  },
  {
    id: 'influencer',
    name: 'Eco Influencer',
    description: 'Share 10 achievements',
    icon: '📢',
    category: 'social',
    rarity: 'rare',
    requirements: { type: 'community_action', value: 10 },
    reward: { type: 'xp', value: 80 },
  },
];

export const smartGoalRecommendations = {
  // Based on user's current carbon footprint
  getPersonalizedGoals: (userStats: UserStats, recentActivities: any[]): Goal[] => {
    const recommendations: Goal[] = [];
    
    // Transport goals
    if (recentActivities.some(a => a.categoryId === 'transport')) {
      recommendations.push({
        id: 'reduce_car_usage',
        title: 'Reduce Car Usage',
        description: 'Use public transport or bike 3 times this week',
        category: 'transport',
        type: 'habit',
        targetValue: 3,
        currentValue: 0,
        unit: 'times',
        period: 'weekly',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        progress: 0,
        difficulty: 'medium',
        points: 100,
        isSmartRecommended: true,
      });
    }

    // Carbon reduction goals
    recommendations.push({
      id: 'weekly_carbon_target',
      title: 'Weekly Carbon Target',
      description: 'Keep your weekly footprint under 25kg CO₂',
      category: 'carbon',
      type: 'target',
      targetValue: 25,
      currentValue: 0,
      unit: 'kg CO₂',
      period: 'weekly',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      progress: 0,
      difficulty: 'medium',
      points: 75,
      isSmartRecommended: true,
    });

    return recommendations;
  },

  // Goals based on difficulty level
  getGoalsByDifficulty: (difficulty: 'easy' | 'medium' | 'hard' | 'expert'): Goal[] => {
    const baseGoals: Record<string, Partial<Goal>[]> = {
      easy: [
        {
          title: 'Log Daily Activities',
          description: 'Track your activities for 3 days',
          targetValue: 3,
          unit: 'days',
          points: 30,
        },
        {
          title: 'Use Reusable Bag',
          description: 'Avoid plastic bags 5 times',
          targetValue: 5,
          unit: 'times',
          points: 25,
        },
      ],
      medium: [
        {
          title: 'Public Transport Week',
          description: 'Use public transport for 5 trips',
          targetValue: 5,
          unit: 'trips',
          points: 75,
        },
        {
          title: 'Energy Saver',
          description: 'Reduce energy usage by 20%',
          targetValue: 20,
          unit: '% reduction',
          points: 100,
        },
      ],
      hard: [
        {
          title: 'Car-Free Month',
          description: 'No car usage for 30 days',
          targetValue: 30,
          unit: 'days',
          points: 200,
        },
        {
          title: 'Zero Waste Week',
          description: 'Generate less than 1kg waste',
          targetValue: 1,
          unit: 'kg',
          points: 150,
        },
      ],
      expert: [
        {
          title: 'Carbon Neutral Month',
          description: 'Offset all emissions for 30 days',
          targetValue: 100,
          unit: '% offset',
          points: 500,
        },
        {
          title: 'Community Leader',
          description: 'Organize 3 eco challenges',
          targetValue: 3,
          unit: 'challenges',
          points: 300,
        },
      ],
    };

    return baseGoals[difficulty].map((goal, index) => ({
      id: `${difficulty}_goal_${index}`,
      category: 'custom' as const,
      type: 'habit' as const,
      currentValue: 0,
      period: 'weekly' as const,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active' as const,
      progress: 0,
      difficulty,
      ...goal,
    })) as Goal[];
  },
};

export const calculateUserLevel = (xp: number): { level: number; nextLevelXp: number } => {
  // Level formula: level = floor(sqrt(xp / 100))
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const nextLevelXp = Math.pow(level, 2) * 100;
  
  return { level, nextLevelXp };
};

export const checkBadgeProgress = (userStats: UserStats, activities: any[]): Badge[] => {
  return defaultBadges.map(badge => {
    let progress = 0;
    
    switch (badge.requirements.type) {
      case 'activities_logged':
        progress = Math.min(100, (userStats.activitiesLogged / badge.requirements.value) * 100);
        break;
      case 'streak_days':
        progress = Math.min(100, (userStats.currentStreak / badge.requirements.value) * 100);
        break;
      case 'carbon_saved':
        progress = Math.min(100, (userStats.totalCarbonSaved / badge.requirements.value) * 100);
        break;
      case 'goal_completed':
        progress = Math.min(100, (userStats.goalsCompleted / badge.requirements.value) * 100);
        break;
      default:
        progress = 0;
    }
    
    return {
      ...badge,
      progress,
      earnedAt: progress >= 100 ? new Date().toISOString() : undefined,
    };
  });
};