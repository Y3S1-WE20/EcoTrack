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
  Dimensions,
  TextInput,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/services/profileAPI';
import { getCommunityPosts, CommunityPost } from '@/services/motivationAPI';
import { habitAPI } from '@/services/habitAPI';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { INITIAL_BADGES } from '@/data/quizData';

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
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('goals');
  const [badges, setBadges] = useState<any[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [reports, setReports] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState<number>(50);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalInput, setNewGoalInput] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      // Mock data matching the screenshot
      const mockGoals: Goal[] = [
        {
          id: '1',
          title: 'Weekly CO₂ Target',
          description: 'Keep weekly carbon emissions under your goal',
          targetValue: weeklyGoal,
          currentValue: 22.91,
          unit: 'kg CO₂',
          deadline: '2024-12-31',
          category: 'carbon',
          progress: Math.round((22.91 / weeklyGoal) * 100),
        },
        {
          id: '2',
          title: 'Monthly Activity Goal',
          description: 'Log 100 eco-friendly activities per month',
          targetValue: 100,
          currentValue: 19,
          unit: 'activities',
          deadline: '2024-12-31',
          category: 'activity',
          progress: 19,
        },
        {
          id: '3',
          title: 'Daily Eco Actions',
          description: 'Complete daily sustainable actions',
          targetValue: 21,
          currentValue: 19,
          unit: 'actions',
          deadline: '2024-12-31',
          category: 'daily',
          progress: 90,
        },
      ];
      
      setGoals(mockGoals);

      // Load user profile and badges
      try {
        const profileResp = await profileAPI.getProfile();
        if (profileResp && profileResp.success && profileResp.data) {
          const profile = profileResp.data;
          if (profile.user && profile.user.badges) {
            setBadges(profile.user.badges);
          } else if (profile.badges) {
            setBadges(profile.badges);
          } else {
            setBadges(INITIAL_BADGES || []);
          }
          
          // Get weekly goal from profile
          if (profile.user && profile.user.carbonProfile && profile.user.carbonProfile.goals) {
            setWeeklyGoal(profile.user.carbonProfile.goals.weekly || 50);
          }
        }
      } catch (e) {
        setBadges(INITIAL_BADGES || []);
      }

      // Load leaderboard
      try {
        const leaderboardResp = await profileAPI.getLeaderboard();
        if (leaderboardResp && leaderboardResp.success && leaderboardResp.data) {
          setLeaderboard(leaderboardResp.data);
        }
      } catch (e) {
        console.log('Failed to load leaderboard:', e);
      }

      // Load community posts
      try {
        const postsResp: any = await getCommunityPosts(1, 10);
        if (postsResp && postsResp.success && postsResp.data) {
          setPosts(postsResp.data.posts || postsResp.data);
        }
      } catch (e) {}

      // Load weekly report
      try {
        const reportResp = await profileAPI.getWeeklyReport();
        if (reportResp && reportResp.success && reportResp.data) {
          setReports(reportResp.data);
        }
      } catch (e) {}

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

  const handleSetWeeklyGoal = async () => {
    const target = parseFloat(newGoalInput);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid number greater than 0');
      return;
    }

    try {
      const response = await profileAPI.setWeeklyGoal(target);
      if (response.success) {
        setWeeklyGoal(target);
        setShowGoalModal(false);
        setNewGoalInput('');
        Alert.alert('Success', `Weekly goal set to ${target} kg CO₂`);
        await loadGoals(); // Refresh to update progress
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to set weekly goal');
    }
  };

  const handleShareBadge = async (badgeId: string) => {
    try {
      const response = await profileAPI.shareAchievement(badgeId);
      if (response.success && response.data) {
        const shareText = `${response.data.title}\n\n${response.data.subtitle}\n\nShared from EcoTracker`;
        await Share.share({
          message: shareText,
          title: response.data.title,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to prepare share content');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'carbon': return '�';
      case 'activity': return '�';
      case 'daily': return '⭐';
      default: return '🎯';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 50) return '#FF9800';
    return '#2196F3';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'badges':
        return (
          <ScrollView style={styles.goalsScrollView} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Your Badges</Text>
            {badges && badges.length > 0 ? (
              <View style={styles.badgeGrid}>
                {badges.map((badge: any) => (
                  <View key={badge.id || badge._id || badge.name} style={styles.badgeCard}>
                    <Text style={styles.badgeIcon}>{badge.icon || '🏆'}</Text>
                    <Text style={styles.badgeName}>{badge.name || badge.title}</Text>
                    <Text style={styles.badgeDescription}>{badge.description}</Text>
                    {badge.earnedAt && (
                      <Text style={styles.badgeDate}>
                        Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                      </Text>
                    )}
                    <TouchableOpacity 
                      style={styles.shareButton}
                      onPress={() => handleShareBadge(badge.id || badge._id || badge.name)}
                    >
                      <IconSymbol name="square.and.arrow.up" size={16} color="white" />
                      <Text style={styles.shareButtonText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.comingSoonContainer}>
                <Text style={styles.comingSoonText}>🏆</Text>
                <Text style={styles.comingSoonTitle}>No badges yet</Text>
                <Text style={styles.comingSoonSubtitle}>Earn badges by logging activities</Text>
              </View>
            )}
            
            {/* Leaderboard section */}
            <Text style={[styles.sectionTitle, {marginTop: 30}]}>Leaderboard</Text>
            {leaderboard && leaderboard.length > 0 ? (
              leaderboard.map((user, index) => (
                <View key={index} style={styles.leaderboardItem}>
                  <Text style={styles.leaderboardRank}>#{index + 1}</Text>
                  <Text style={styles.leaderboardName}>{user.name}</Text>
                  <Text style={styles.leaderboardStats}>
                    {user.activitiesLogged} activities • {user.badges} badges
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No leaderboard data available</Text>
            )}
          </ScrollView>
        );
      case 'social':
        return (
          <ScrollView style={styles.goalsScrollView} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Community</Text>
            {posts && posts.length > 0 ? (
              posts.map(p => (
                <View key={p._id} style={styles.goalCard}>
                  <Text style={{fontWeight: '700'}}>{p.author || 'Someone'}</Text>
                  <Text style={{marginTop: 6}}>{p.content}</Text>
                  {p.impactData && (
                    <Text style={{marginTop: 8, color: '#4CAF50'}}>Impact: {p.impactData.co2Saved || 0} kg CO₂</Text>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.comingSoonContainer}>
                <Text style={styles.comingSoonText}>👥</Text>
                <Text style={styles.comingSoonTitle}>No posts yet</Text>
                <Text style={styles.comingSoonSubtitle}>Share achievements to connect</Text>
              </View>
            )}
          </ScrollView>
        );
      case 'reports':
        return (
          <ScrollView style={styles.goalsScrollView} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Reports</Text>
            {reports ? (
              <View style={styles.goalCard}>
                <Text style={{fontWeight: '700'}}>Weekly Summary</Text>
                <Text style={{marginTop: 8}}>Period: {new Date(reports.period.start).toLocaleDateString()} - {new Date(reports.period.end).toLocaleDateString()}</Text>
                <Text style={{marginTop: 8}}>Daily stats count: {reports.dailyStats ? reports.dailyStats.length : 0}</Text>
              </View>
            ) : (
              <View style={styles.comingSoonContainer}>
                <Text style={styles.comingSoonText}>📈</Text>
                <Text style={styles.comingSoonTitle}>No reports yet</Text>
                <Text style={styles.comingSoonSubtitle}>Start logging activities to see reports</Text>
              </View>
            )}
          </ScrollView>
        );
      default:
        return (
          <ScrollView
            style={styles.goalsScrollView}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.addGoalContainer}>
              <TouchableOpacity 
                style={styles.addGoalButton}
                onPress={() => setShowGoalModal(true)}
              >
                <IconSymbol name="target" size={16} color="white" />
                <Text style={styles.addGoalText}>Set Weekly Goal</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Your Goals</Text>

            {goals.map((goal) => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalTitleContainer}>
                    <Text style={styles.goalIcon}>{getCategoryIcon(goal.category)}</Text>
                    <View style={styles.goalTitleSection}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalProgress}>
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressContainer}>
                    <Text style={[styles.progressPercentage, { color: getProgressColor(goal.progress) }]}>
                      {goal.progress}%
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBg}>
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

                <Text style={styles.goalDescription}>{goal.description}</Text>
              </View>
            ))}
          </ScrollView>
        );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your goals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Goals & Achievements" subtitle="Track your progress towards a greener lifestyle" rightIcon="target" />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'goals' && styles.activeTab]}
          onPress={() => setActiveTab('goals')}
        >
          <IconSymbol name="target" size={20} color={activeTab === 'goals' ? 'white' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>
            Goals
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'badges' && styles.activeTab]}
          onPress={() => setActiveTab('badges')}
        >
          <IconSymbol name="star" size={20} color={activeTab === 'badges' ? 'white' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'badges' && styles.activeTabText]}>
            Badges
          </Text>
        </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'social' && styles.activeTab]}
            onPress={() => {
              // prefer navigating to full Motivation screen
              try {
                router.push('/motivation');
              } catch (e) {
                setActiveTab('social');
              }
            }}
          >
            <IconSymbol name="person.2" size={20} color={activeTab === 'social' ? 'white' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'social' && styles.activeTabText]}>
              Social
            </Text>
          </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <IconSymbol name="chart.bar" size={20} color={activeTab === 'reports' ? 'white' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
            Reports
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Weekly Goal Setting Modal */}
      <Modal
        visible={showGoalModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Weekly CO₂ Goal</Text>
            <Text style={styles.modalSubtitle}>
              Set your target weekly carbon emissions (kg CO₂)
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={newGoalInput}
              onChangeText={setNewGoalInput}
              placeholder={`Current: ${weeklyGoal} kg`}
              keyboardType="numeric"
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowGoalModal(false);
                  setNewGoalInput('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSetWeeklyGoal}
              >
                <Text style={styles.confirmButtonText}>Set Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
    color: '#333',
  },
  headerGradient: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 38,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    lineHeight: 22,
  },
  headerIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 12,
    padding: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  activeTabText: {
    color: 'white',
  },
  contentContainer: {
    flex: 1,
    marginTop: 20,
  },
  goalsScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addGoalContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addGoalText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
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
    backgroundColor: 'white',
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
    color: '#333',
    marginBottom: 4,
  },
  goalProgress: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    alignItems: 'flex-end',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalDescription: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  comingSoonText: {
    fontSize: 64,
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  comingSoonSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  badgeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (Dimensions.get('window').width - 60) / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDate: {
    fontSize: 10,
    color: '#999',
    marginBottom: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  leaderboardItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    width: 40,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  leaderboardStats: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
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
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
