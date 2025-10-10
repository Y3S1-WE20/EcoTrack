import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileAPI } from '../../services/profileAPI';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Profile {
  totalCo2Saved: number;
  streakDays: number;
  activitiesLogged: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  badge: string;
  completed?: boolean;
}

interface Badge {
  name: string;
  icon?: string;
  earnedAt: string;
}

export default function MotivationHubScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      
      if (response.success && response.data) {
        setProfile(response.data.profile);
        setCurrentChallenge(response.data.currentChallenge);
        setBadges(response.data.badges || []);
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
      Alert.alert('Error', 'Failed to load your profile data');
    } finally {
      setLoading(false);
    }
  };

  const updateChallengeProgress = async (progressIncrease: number) => {
    try {
      if (!currentChallenge) return;
      
      const newProgress = Math.min(currentChallenge.progress + progressIncrease, 100);
      const completed = newProgress >= 100;
      
      const response = await profileAPI.updateChallengeProgress(newProgress, completed);
      
      if (response.success) {
        setCurrentChallenge({
          ...currentChallenge,
          progress: newProgress,
          completed: completed
        });
        
        if (completed) {
          Alert.alert(
            '🎉 Challenge Completed!',
            `Congratulations! You've completed the "${currentChallenge.title}" challenge!`,
            [{ text: 'Awesome!', style: 'default' }]
          );
        }
      }
    } catch (error) {
      console.error('Failed to update challenge progress:', error);
    }
  };

  const renderChallengeCard = () => {
    if (!currentChallenge) {
      return (
        <View style={styles.challengeCard}>
          <Text style={styles.challengeTitle}>No Active Challenge</Text>
          <Text style={styles.challengeDescription}>
            Complete your onboarding to get your first challenge!
          </Text>
        </View>
      );
    }

    const progressPercentage = (currentChallenge.progress / 100) * 100;
    
    return (
      <View style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeTitle}>{currentChallenge.title}</Text>
          <Text style={styles.challengeCategory}>{currentChallenge.category}</Text>
        </View>
        
        <Text style={styles.challengeDescription}>
          {currentChallenge.description}
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
            />
          </View>
          <Text style={styles.progressText}>{currentChallenge.progress}%</Text>
        </View>
        
        <View style={styles.challengeActions}>
          <TouchableOpacity
            style={styles.progressButton}
            onPress={() => updateChallengeProgress(25)}
          >
            <Text style={styles.progressButtonText}>Log Progress (+25%)</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.challengeReward}>
          🏆 Reward: {currentChallenge.badge} badge
        </Text>
      </View>
    );
  };

  const renderBadgeGrid = () => {
    if (badges.length === 0) {
      return (
        <View style={styles.emptyBadges}>
          <Ionicons name="medal-outline" size={48} color="#ccc" />
          <Text style={styles.emptyBadgesText}>
            No badges earned yet. Complete challenges to earn your first badge!
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.badgeGrid}>
        {badges.map((badge, index) => (
          <View key={index} style={styles.badgeItem}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeEmoji}>{badge.icon || '🏆'}</Text>
            </View>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgeDate}>
              {new Date(badge.earnedAt).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderStatsOverview = () => {
    if (!profile) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="leaf-outline" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{profile.totalCo2Saved || 0} kg</Text>
          <Text style={styles.statLabel}>CO₂ Saved</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="flame-outline" size={24} color="#FF5722" />
          <Text style={styles.statValue}>{profile.streakDays || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#2196F3" />
          <Text style={styles.statValue}>{profile.activitiesLogged || 0}</Text>
          <Text style={styles.statLabel}>Activities</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your motivation hub...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🌟 Motivation Hub</Text>
          <Text style={styles.subtitle}>
            Stay motivated on your eco-journey!
          </Text>
        </View>

        {/* Stats Overview */}
        {renderStatsOverview()}

        {/* Current Challenge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Current Challenge</Text>
          {renderChallengeCard()}
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Your Badges</Text>
          {renderBadgeGrid()}
        </View>

        {/* Motivational Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Daily Tip</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              Small changes make a big difference! Every eco-friendly action counts towards a sustainable future.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#c8e6c9',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  challengeCategory: {
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'uppercase',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  challengeActions: {
    marginBottom: 12,
  },
  progressButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  progressButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  challengeReward: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: (width - 60) / 3,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDate: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  emptyBadges: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyBadgesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});