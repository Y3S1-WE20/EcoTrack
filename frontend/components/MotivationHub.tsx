import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/services/profileAPI';

interface ProfileData {
  user: any;
  needsOnboarding: boolean;
  profile: {
    co2Baseline: number;
    totalCo2Saved: number;
    streakDays: number;
    activitiesLogged: number;
  };
  currentChallenge?: {
    id: string;
    title: string;
    description: string;
    category: string;
    targetReduction: number;
    progress: number;
    startDate: string;
    endDate: string;
    completed: boolean;
    badge?: string;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    earnedAt: string;
  }>;
  recentCompletedChallenges: Array<{
    challengeId: string;
    completedAt: string;
    co2Saved: number;
  }>;
}

interface MotivationHubProps {
  onChallengePress?: () => void;
}

export default function MotivationHub({ onChallengePress }: MotivationHubProps) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to load profile data:', error);
      Alert.alert('Error', 'Failed to load your profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProfileData();
    setIsRefreshing(false);
  };

  const handleChallengeProgress = async (progressUpdate: number) => {
    try {
      const response = await profileAPI.updateChallengeProgress(progressUpdate);
      
      // Show new badges if any were earned
      if (response.data.newBadges && response.data.newBadges.length > 0) {
        const badgeNames = response.data.newBadges.map((badge: any) => badge.name).join(', ');
        Alert.alert('🎉 New Badge Earned!', `Congratulations! You earned: ${badgeNames}`);
      }
      
      // Reload profile data to get updated stats
      await loadProfileData();
    } catch (error) {
      console.error('Failed to update challenge progress:', error);
      Alert.alert('Error', 'Failed to update your progress. Please try again.');
    }
  };

  const formatCO2 = (amount: number): string => {
    return `${amount.toFixed(1)} kg`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your eco journey...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load profile data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfileData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const daysUntilChallengeEnd = profileData.currentChallenge 
    ? Math.ceil((new Date(profileData.currentChallenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name || 'Eco Warrior'}! 👋</Text>
          <Text style={styles.subtitle}>Ready to make a difference today?</Text>
        </View>

        {/* Carbon Profile Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 Your Carbon Profile</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatCO2(profileData.profile.co2Baseline)}</Text>
              <Text style={styles.statLabel}>Weekly Baseline</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatCO2(profileData.profile.totalCo2Saved)}</Text>
              <Text style={styles.statLabel}>CO₂ Saved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{profileData.profile.streakDays}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Current Challenge */}
        {profileData.currentChallenge && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 This Week's Challenge</Text>
            <View style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeTitle}>{profileData.currentChallenge.title}</Text>
                <Text style={styles.challengeDays}>
                  {daysUntilChallengeEnd > 0 ? `${daysUntilChallengeEnd} days left` : 'Ends today!'}
                </Text>
              </View>
              <Text style={styles.challengeDescription}>
                {profileData.currentChallenge.description}
              </Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(profileData.currentChallenge.progress)}%
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${profileData.currentChallenge.progress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressTarget}>
                  Target: {formatCO2(profileData.currentChallenge.targetReduction)} CO₂ reduction
                </Text>
              </View>

              {!profileData.currentChallenge.completed && (
                <View style={styles.challengeActions}>
                  <TouchableOpacity
                    style={styles.progressButton}
                    onPress={() => handleChallengeProgress(profileData.currentChallenge!.progress + 25)}
                  >
                    <Text style={styles.progressButtonText}>+25% Progress</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.progressButton, styles.completeButton]}
                    onPress={() => handleChallengeProgress(100)}
                  >
                    <Text style={styles.progressButtonText}>Mark Complete</Text>
                  </TouchableOpacity>
                </View>
              )}

              {profileData.currentChallenge.completed && (
                <View style={styles.completedBanner}>
                  <Text style={styles.completedText}>🎉 Challenge Completed!</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Badges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Your Badges</Text>
          {profileData.badges && profileData.badges.length > 0 ? (
            <View style={styles.badgesGrid}>
              {profileData.badges.map((badge: any, index: number) => (
                <View key={index} style={styles.badgeCard}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDescription}>{badge.description}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noBadgesContainer}>
              <Text style={styles.noBadgesText}>Complete challenges to earn your first badges!</Text>
            </View>
          )}
        </View>

        {/* Recent Achievements */}
        {profileData.recentCompletedChallenges && profileData.recentCompletedChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Recent Achievements</Text>
            {profileData.recentCompletedChallenges.map((challenge: any, index: number) => (
              <View key={index} style={styles.achievementCard}>
                <Text style={styles.achievementTitle}>{challenge.challengeId}</Text>
                <Text style={styles.achievementDetails}>
                  Completed {new Date(challenge.completedAt).toLocaleDateString()} • 
                  Saved {formatCO2(challenge.co2Saved)} CO₂
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Motivational Quote */}
        <View style={styles.section}>
          <View style={styles.quoteCard}>
            <Text style={styles.quote}>
              "The best time to plant a tree was 20 years ago. The second best time is now."
            </Text>
            <Text style={styles.quoteAuthor}>— Chinese Proverb</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  challengeDays: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e1e1e1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressTarget: {
    fontSize: 12,
    color: '#666',
  },
  challengeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  progressButton: {
    flex: 1,
    backgroundColor: '#f1f8e9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  progressButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  completedBanner: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    backgroundColor: '#fff',
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  noBadgesContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  noBadgesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  achievementCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  achievementDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quoteCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});