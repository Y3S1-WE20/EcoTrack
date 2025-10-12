import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/services/profileAPI';
import { Goal, Badge, UserStats, smartGoalRecommendations, calculateUserLevel, checkBadgeProgress } from '@/types/gamification';

const { width } = Dimensions.get('window');

export default function GoalsScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [activeTab, setActiveTab] = useState<'goals' | 'progress' | 'badges'>('goals');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - replace with actual API calls
      const mockUserStats: UserStats = {
        totalCarbonSaved: 45.2,
        activitiesLogged: 28,
        currentStreak: 7,
        longestStreak: 15,
        level: 3,
        xp: 850,
        nextLevelXp: 1000,
        badgesEarned: 4,
        goalsCompleted: 2,
        rank: {
          global: 1250,
          friends: 3,
          community: 15,
        },
      };

      const mockGoals: Goal[] = [
        {
          id: '1',
          title: 'Reduce Weekly CO₂',
          description: 'Lower your weekly carbon footprint by 30%',
          category: 'carbon',
          type: 'reduction',
          targetValue: 30,
          currentValue: 18,
          unit: 'kg CO₂',
          period: 'weekly',
          startDate: '2024-12-01',
          endDate: '2024-12-31',
          status: 'active',
          progress: 60,
          difficulty: 'medium',
          points: 100,
          milestones: [
            { percentage: 25, reward: '🌱 Eco Starter', achieved: true },
            { percentage: 50, reward: '🌿 Green Warrior', achieved: true },
            { percentage: 75, reward: '🌳 Earth Guardian', achieved: false },
            { percentage: 100, reward: '🌍 Planet Hero', achieved: false },
          ],
        },
        {
          id: '2',
          title: 'Public Transport Challenge',
          description: 'Use public transport 15 times this month',
          category: 'transport',
          type: 'target',
          targetValue: 15,
          currentValue: 8,
          unit: 'trips',
          period: 'monthly',
          startDate: '2024-12-01',
          endDate: '2024-12-31',
          status: 'active',
          progress: 53,
          difficulty: 'easy',
          points: 75,
          isSmartRecommended: true,
        },
        {
          id: '3',
          title: 'Energy Saving Month',
          description: 'Reduce home energy consumption by 25%',
          category: 'energy',
          type: 'reduction',
          targetValue: 25,
          currentValue: 25,
          unit: '% reduction',
          period: 'monthly',
          startDate: '2024-11-01',
          endDate: '2024-11-30',
          status: 'completed',
          progress: 100,
          difficulty: 'hard',
          points: 150,
        },
      ];

      setUserStats(mockUserStats);
      setGoals(mockGoals);
      
      // Calculate badge progress
      const badgeProgress = checkBadgeProgress(mockUserStats, []);
      setBadges(badgeProgress);
      
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load your goals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      carbon: '🌍',
      transport: '🚌',
      energy: '⚡',
      waste: '♻️',
      food: '🍽️',
      custom: '🎯',
    };
    return icons[category as keyof typeof icons] || '🎯';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: theme.success,
      medium: theme.warning,
      hard: theme.error,
      expert: '#9C27B0',
    };
    return colors[difficulty as keyof typeof colors] || theme.primary;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return theme.success;
    if (progress >= 50) return theme.warning;
    return theme.error;
  };

  const earnedBadges = badges.filter(badge => badge.earnedAt);
  const availableBadges = badges.filter(badge => !badge.earnedAt);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderStatsHeader = () => (
    <View style={[styles.statsHeader, { backgroundColor: theme.surface }]}>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.primary }]}>{userStats?.level}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Level</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.success }]}>
            {userStats?.totalCarbonSaved.toFixed(1)}kg
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>CO₂ Saved</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.warning }]}>{userStats?.currentStreak}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.error }]}>{userStats?.badgesEarned}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Badges</Text>
        </View>
      </View>
      
      {/* XP Progress Bar */}
      <View style={styles.xpContainer}>
        <View style={styles.xpHeader}>
          <Text style={[styles.xpLabel, { color: theme.text }]}>
            Level {userStats?.level} Progress
          </Text>
          <Text style={[styles.xpText, { color: theme.textSecondary }]}>
            {userStats?.xp}/{userStats?.nextLevelXp} XP
          </Text>
        </View>
        <View style={[styles.xpBarBg, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.xpBarFill,
              {
                width: `${((userStats?.xp || 0) / (userStats?.nextLevelXp || 1)) * 100}%`,
                backgroundColor: theme.primary,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );

  const renderTabNavigation = () => (
    <View style={[styles.tabNavigation, { backgroundColor: theme.surface }]}>
      {[
        { key: 'goals', label: 'Goals', icon: '🎯' },
        { key: 'progress', label: 'Progress', icon: '📊' },
        { key: 'badges', label: 'Badges', icon: '🏆' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabItem,
            { backgroundColor: activeTab === tab.key ? theme.primary : 'transparent' }
          ]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === tab.key ? '#fff' : theme.textSecondary }
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderGoals = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Smart Recommendations */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          🤖 Smart Recommendations
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Goals suggested based on your activity
        </Text>
        
        {goals.filter(goal => goal.isSmartRecommended).map((goal) => (
          <View key={goal.id} style={[styles.goalCard, { backgroundColor: theme.surface }]}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleContainer}>
                <Text style={styles.goalIcon}>{getCategoryIcon(goal.category)}</Text>
                <View style={styles.goalTitleSection}>
                  <Text style={[styles.goalTitle, { color: theme.text }]}>{goal.title}</Text>
                  <Text style={[styles.goalDescription, { color: theme.textSecondary }]}>
                    {goal.description}
                  </Text>
                </View>
              </View>
              <View style={[styles.smartBadge, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.smartBadgeText, { color: theme.primary }]}>SMART</Text>
              </View>
            </View>

            <View style={styles.goalProgress}>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressText, { color: theme.text }]}>
                  {goal.currentValue}/{goal.targetValue} {goal.unit}
                </Text>
                <Text style={[styles.progressPercentage, { color: getProgressColor(goal.progress) }]}>
                  {goal.progress}%
                </Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${goal.progress}%`,
                      backgroundColor: getProgressColor(goal.progress),
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Active Goals */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Goals</Text>
        
        {goals.filter(goal => goal.status === 'active' && !goal.isSmartRecommended).map((goal) => (
          <View key={goal.id} style={[styles.goalCard, { backgroundColor: theme.surface }]}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleContainer}>
                <Text style={styles.goalIcon}>{getCategoryIcon(goal.category)}</Text>
                <View style={styles.goalTitleSection}>
                  <Text style={[styles.goalTitle, { color: theme.text }]}>{goal.title}</Text>
                  <Text style={[styles.goalDescription, { color: theme.textSecondary }]}>
                    {goal.description}
                  </Text>
                </View>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(goal.difficulty) + '20' }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(goal.difficulty) }]}>
                  {goal.difficulty.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.goalProgress}>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressText, { color: theme.text }]}>
                  {goal.currentValue}/{goal.targetValue} {goal.unit}
                </Text>
                <Text style={[styles.progressPercentage, { color: getProgressColor(goal.progress) }]}>
                  {goal.progress}%
                </Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${goal.progress}%`,
                      backgroundColor: getProgressColor(goal.progress),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Milestones */}
            {goal.milestones && (
              <View style={styles.milestonesContainer}>
                <Text style={[styles.milestonesTitle, { color: theme.text }]}>Milestones</Text>
                <View style={styles.milestonesList}>
                  {goal.milestones.map((milestone, index) => (
                    <View
                      key={index}
                      style={[
                        styles.milestoneItem,
                        { 
                          backgroundColor: milestone.achieved ? theme.success + '20' : theme.border + '40',
                        }
                      ]}
                    >
                      <Text style={styles.milestoneIcon}>
                        {milestone.achieved ? '✅' : '⭕'}
                      </Text>
                      <Text style={[
                        styles.milestoneText,
                        { color: milestone.achieved ? theme.success : theme.textSecondary }
                      ]}>
                        {milestone.percentage}% - {milestone.reward}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.updateButton, { backgroundColor: theme.primary }]}
              onPress={() => Alert.alert('Update Progress', 'Feature coming soon!')}
            >
              <Text style={styles.updateButtonText}>Update Progress</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Completed Goals */}
      {goals.some(goal => goal.status === 'completed') && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Completed Goals 🎉</Text>
          
          {goals.filter(goal => goal.status === 'completed').map((goal) => (
            <View key={goal.id} style={[styles.completedGoalCard, { backgroundColor: theme.success + '10' }]}>
              <View style={styles.goalHeader}>
                <View style={styles.goalTitleContainer}>
                  <Text style={styles.goalIcon}>{getCategoryIcon(goal.category)}</Text>
                  <View style={styles.goalTitleSection}>
                    <Text style={[styles.goalTitle, { color: theme.text }]}>{goal.title}</Text>
                    <Text style={[styles.completedText, { color: theme.success }]}>
                      Completed! +{goal.points} XP
                    </Text>
                  </View>
                </View>
                <Text style={styles.completedIcon}>🏆</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Add New Goal Button */}
      <TouchableOpacity
        style={[styles.addGoalButton, { borderColor: theme.border }]}
        onPress={() => setShowAddGoal(true)}
      >
        <Text style={styles.addGoalIcon}>➕</Text>
        <Text style={[styles.addGoalText, { color: theme.text }]}>Create Custom Goal</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderProgress = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>📈 Your Journey</Text>
        
        {/* Weekly Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.progressCardTitle, { color: theme.text }]}>This Week</Text>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={[styles.progressValue, { color: theme.success }]}>
                {userStats?.totalCarbonSaved.toFixed(1)}kg
              </Text>
              <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>CO₂ Saved</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={[styles.progressValue, { color: theme.primary }]}>
                {goals.filter(g => g.status === 'active').length}
              </Text>
              <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>Active Goals</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={[styles.progressValue, { color: theme.warning }]}>
                {userStats?.currentStreak}
              </Text>
              <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Ranking */}
        {userStats?.rank && (
          <View style={[styles.rankingCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.rankingTitle, { color: theme.text }]}>🏆 Your Ranking</Text>
            <View style={styles.rankingStats}>
              <View style={styles.rankingStat}>
                <Text style={[styles.rankingValue, { color: theme.primary }]}>
                  #{userStats.rank.global}
                </Text>
                <Text style={[styles.rankingLabel, { color: theme.textSecondary }]}>Global</Text>
              </View>
              <View style={styles.rankingStat}>
                <Text style={[styles.rankingValue, { color: theme.success }]}>
                  #{userStats.rank.friends}
                </Text>
                <Text style={[styles.rankingLabel, { color: theme.textSecondary }]}>Friends</Text>
              </View>
              <View style={styles.rankingStat}>
                <Text style={[styles.rankingValue, { color: theme.warning }]}>
                  #{userStats.rank.community}
                </Text>
                <Text style={[styles.rankingLabel, { color: theme.textSecondary }]}>Community</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderBadges = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Earned Badges */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          🏆 Earned Badges ({earnedBadges.length})
        </Text>
        
        <View style={styles.badgesGrid}>
          {earnedBadges.map((badge) => (
            <View key={badge.id} style={[styles.badgeCard, { backgroundColor: theme.surface }]}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text style={[styles.badgeName, { color: theme.text }]}>{badge.name}</Text>
              <Text style={[styles.badgeDescription, { color: theme.textSecondary }]}>
                {badge.description}
              </Text>
              <View style={[styles.rarityBadge, { backgroundColor: theme.success + '20' }]}>
                <Text style={[styles.rarityText, { color: theme.success }]}>
                  {badge.rarity.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Available Badges */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          🎯 Available Badges
        </Text>
        
        <View style={styles.badgesGrid}>
          {availableBadges.slice(0, 6).map((badge) => (
            <View key={badge.id} style={[styles.badgeCard, { backgroundColor: theme.surface, opacity: 0.7 }]}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text style={[styles.badgeName, { color: theme.text }]}>{badge.name}</Text>
              <Text style={[styles.badgeDescription, { color: theme.textSecondary }]}>
                {badge.description}
              </Text>
              
              {/* Progress Bar */}
              <View style={styles.badgeProgress}>
                <Text style={[styles.badgeProgressText, { color: theme.textSecondary }]}>
                  {badge.progress?.toFixed(0)}% complete
                </Text>
                <View style={[styles.badgeProgressBarBg, { backgroundColor: theme.border }]}>
                  <View
                    style={[
                      styles.badgeProgressBarFill,
                      {
                        width: `${badge.progress || 0}%`,
                        backgroundColor: theme.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Goals & Progress 🎯</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Track your sustainability journey
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderStatsHeader()}
        {renderTabNavigation()}
        
        {activeTab === 'goals' && renderGoals()}
        {activeTab === 'progress' && renderProgress()}
        {activeTab === 'badges' && renderBadges()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  statsHeader: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  xpContainer: {
    marginTop: 16,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  xpText: {
    fontSize: 14,
  },
  xpBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tabNavigation: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  goalCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completedGoalCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  goalTitleSection: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  smartBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  smartBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  completedIcon: {
    fontSize: 24,
  },
  goalProgress: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestonesContainer: {
    marginBottom: 16,
  },
  milestonesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  milestonesList: {
    gap: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  milestoneIcon: {
    fontSize: 16,
  },
  milestoneText: {
    fontSize: 14,
    flex: 1,
  },
  updateButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 20,
    gap: 12,
  },
  addGoalIcon: {
    fontSize: 24,
  },
  addGoalText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    alignItems: 'center',
    flex: 1,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  rankingCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rankingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  rankingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rankingStat: {
    alignItems: 'center',
    flex: 1,
  },
  rankingValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rankingLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeProgress: {
    width: '100%',
    marginTop: 8,
  },
  badgeProgressText: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeProgressBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  badgeProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});