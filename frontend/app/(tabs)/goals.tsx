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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/services/profileAPI';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  category: string;
  progress: number;
}

export default function GoalsScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with actual API call
      const mockGoals: Goal[] = [
        {
          id: '1',
          title: 'Reduce Weekly CO₂',
          description: 'Lower your weekly carbon footprint by 30%',
          targetValue: 30,
          currentValue: 18,
          unit: 'kg CO₂',
          deadline: '2024-12-31',
          category: 'carbon',
          progress: 60,
        },
        {
          id: '2',
          title: 'Use Public Transport',
          description: 'Take public transport 3 times per week',
          targetValue: 3,
          currentValue: 1,
          unit: 'times/week',
          deadline: '2024-12-31',
          category: 'transport',
          progress: 33,
        },
        {
          id: '3',
          title: 'Energy Conservation',
          description: 'Reduce home energy consumption by 20%',
          targetValue: 20,
          currentValue: 12,
          unit: '% reduction',
          deadline: '2024-12-31',
          category: 'energy',
          progress: 60,
        },
      ];
      
      setGoals(mockGoals);
    } catch (error) {
      console.error('Failed to load goals:', error);
      Alert.alert('Error', 'Failed to load your goals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadGoals();
    setIsRefreshing(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'carbon': return '🌍';
      case 'transport': return '🚌';
      case 'energy': return '⚡';
      default: return '🎯';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return theme.success;
    if (progress >= 50) return theme.warning;
    return theme.error;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading your goals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Goals 🎯</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Track your sustainability journey
        </Text>
      </View>

      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Goals List */}
        <View style={styles.goalsContainer}>
          {goals.map((goal) => (
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
                <View style={[styles.progressBadge, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.progressText, { color: theme.primary }]}>
                    {goal.progress}%
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
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

              {/* Goal Details */}
              <View style={styles.goalDetails}>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Current</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {goal.currentValue} {goal.unit}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Target</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {goal.targetValue} {goal.unit}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Deadline</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {new Date(goal.deadline).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[styles.updateButton, { backgroundColor: theme.primary }]}
                onPress={() => Alert.alert('Update Progress', 'Feature coming soon!')}
              >
                <Text style={styles.updateButtonText}>Update Progress</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add New Goal Button */}
        <TouchableOpacity
          style={[styles.addGoalButton, { backgroundColor: theme.surface }]}
          onPress={() => Alert.alert('Add Goal', 'Feature coming soon!')}
        >
          <Text style={styles.addGoalIcon}>➕</Text>
          <Text style={[styles.addGoalText, { color: theme.text }]}>Add New Goal</Text>
        </TouchableOpacity>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  goalsContainer: {
    padding: 20,
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
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(76, 175, 80, 0.3)',
      },
      default: {
        elevation: 4,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Goal Card Styles
  goalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 12,
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
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  updateButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addGoalIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  addGoalText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
