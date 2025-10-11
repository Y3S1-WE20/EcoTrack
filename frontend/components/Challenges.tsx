import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getPersonalizedChallenges, joinChallenge, Challenge } from '../services/motivationAPI';

interface ChallengesProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function Challenges({ onRefresh, refreshing = false }: ChallengesProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedChallenges, setJoinedChallenges] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      console.log('[Challenges] Loading challenges...');
      const response = await getPersonalizedChallenges();
      console.log('[Challenges] Challenges response:', response);
      if (response.success) {
        setChallenges(response.challenges);
      } else {
        console.warn('[Challenges] Challenges API returned success=false');
        setChallenges([]);
      }
    } catch (error) {
      console.error('[Challenges] Error loading challenges:', error);
      setChallenges([]); // Show empty state instead of immediate error
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadChallenges();
    if (onRefresh) onRefresh();
  };

  const handleJoinChallenge = async (challengeId: number) => {
    try {
      const response = await joinChallenge(challengeId.toString());
      if (response.success) {
        setJoinedChallenges(prev => new Set([...prev, challengeId]));
        Alert.alert('Success', 'You have joined the challenge! Good luck! 🎯');
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      Alert.alert('Error', 'Failed to join challenge');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'waste reduction':
        return '♻️';
      case 'transportation':
        return '🚌';
      case 'diet':
        return '🌱';
      case 'energy':
        return '💡';
      case 'water':
        return '💧';
      default:
        return '🌍';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Smart Challenges</Text>
        <Text style={styles.sectionSubtitle}>
          AI-personalized challenges based on your progress and interests
        </Text>

        {/* Progress Overview */}
        <View style={styles.progressOverview}>
          <Text style={styles.progressTitle}>Your Challenge Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{joinedChallenges.size}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>125</Text>
              <Text style={styles.statLabel}>kg CO₂ Saved</Text>
            </View>
          </View>
        </View>

        {/* Current Active Challenge */}
        {joinedChallenges.size > 0 && (
          <View style={styles.activeChallenge}>
            <Text style={styles.activeChallengeTitle}>🔥 Active Challenge</Text>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>👟</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Daily Walking Goal</Text>
                  <Text style={styles.progressText}>3/7 days completed</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>
                Walk at least 8,000 steps per day for the next 7 days
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '43%' }]} />
              </View>
              <View style={styles.progressNumbers}>
                <Text style={styles.progressLabel}>Progress: 43%</Text>
                <Text style={styles.progressLabel}>4 days left</Text>
              </View>
            </View>
          </View>
        )}

        {/* Available Challenges */}
        <Text style={styles.sectionTitle}>🚀 Recommended for You</Text>
        
        {challenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeIconSection}>
                <Text style={styles.challengeIcon}>{challenge.icon}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{challenge.category}</Text>
                </View>
              </View>
              <View style={styles.difficultyBadge}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(challenge.difficulty) }]}>
                  {challenge.difficulty}
                </Text>
              </View>
            </View>

            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>

            <View style={styles.challengeDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>⏱️</Text>
                <Text style={styles.detailText}>{challenge.duration}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>🌍</Text>
                <Text style={styles.detailText}>{challenge.impact}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>👥</Text>
                <Text style={styles.detailText}>{challenge.participants.toLocaleString()} joined</Text>
              </View>
            </View>

            <View style={styles.challengeActions}>
              {joinedChallenges.has(challenge.id) ? (
                <View style={styles.joinedButton}>
                  <Text style={styles.joinedButtonText}>✅ Joined</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleJoinChallenge(challenge.id)}
                >
                  <Text style={styles.joinButtonText}>Join Challenge</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.learnMoreButton}>
                <Text style={styles.learnMoreText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Daily Challenge Spotlight */}
        <View style={styles.spotlightSection}>
          <Text style={styles.spotlightTitle}>⭐ Daily Challenge Spotlight</Text>
          <View style={styles.spotlightCard}>
            <Text style={styles.spotlightIcon}>💡</Text>
            <Text style={styles.spotlightChallengeTitle}>Lights Out Hour</Text>
            <Text style={styles.spotlightDescription}>
              Turn off all non-essential lights and electronics for one hour today. 
              Experience mindfulness while saving energy!
            </Text>
            <View style={styles.spotlightImpact}>
              <Text style={styles.impactText}>Potential impact: 0.5kg CO₂ saved</Text>
            </View>
            <TouchableOpacity style={styles.quickJoinButton}>
              <Text style={styles.quickJoinText}>⚡ Quick Join</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Challenge Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>🏷️ Browse by Category</Text>
          <View style={styles.categoriesGrid}>
            {[
              { name: 'Energy', icon: '💡', count: 12 },
              { name: 'Transport', icon: '🚲', count: 8 },
              { name: 'Waste', icon: '♻️', count: 15 },
              { name: 'Water', icon: '💧', count: 6 },
              { name: 'Food', icon: '🌱', count: 10 },
              { name: 'Lifestyle', icon: '🏡', count: 9 },
            ].map((category) => (
              <TouchableOpacity key={category.name} style={styles.categoryItem}>
                <Text style={styles.categoryItemIcon}>{category.icon}</Text>
                <Text style={styles.categoryItemName}>{category.name}</Text>
                <Text style={styles.categoryItemCount}>{category.count} challenges</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  progressOverview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  activeChallenge: {
    marginBottom: 24,
  },
  activeChallengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 4,
  },
  progressNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeIconSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  difficultyBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  challengeDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  challengeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 12,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  joinedButton: {
    backgroundColor: '#E8F5E8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 12,
  },
  joinedButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  learnMoreButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  learnMoreText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  spotlightSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  spotlightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  spotlightCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  spotlightIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  spotlightChallengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  spotlightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  spotlightImpact: {
    marginBottom: 16,
  },
  impactText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  quickJoinButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  quickJoinText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  categoriesSection: {
    marginTop: 24,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryItemIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  categoryItemCount: {
    fontSize: 12,
    color: '#666',
  },
});