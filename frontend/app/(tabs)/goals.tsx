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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/services/profileAPI';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
  const [activeTab, setActiveTab] = useState('goals');

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
          description: 'Keep weekly carbon emissions under 50kg',
          targetValue: 50,
          currentValue: 22.91,
          unit: 'kg CO₂',
          deadline: '2024-12-31',
          category: 'carbon',
          progress: 46,
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
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>🏆</Text>
            <Text style={styles.comingSoonTitle}>Badges</Text>
            <Text style={styles.comingSoonSubtitle}>Coming Soon!</Text>
          </View>
        );
      case 'social':
        return (
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>👥</Text>
            <Text style={styles.comingSoonTitle}>Social</Text>
            <Text style={styles.comingSoonSubtitle}>Connect with eco-warriors</Text>
          </View>
        );
      case 'reports':
        return (
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>📈</Text>
            <Text style={styles.comingSoonTitle}>Reports</Text>
            <Text style={styles.comingSoonSubtitle}>Detailed analytics coming soon</Text>
          </View>
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
              <TouchableOpacity style={styles.addGoalButton}>
                <IconSymbol name="plus" size={20} color="white" />
                <Text style={styles.addGoalText}>Add Goal</Text>
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
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.headerGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Goals &</Text>
            <Text style={styles.headerTitle}>Achievements</Text>
            <Text style={styles.headerSubtitle}>
              Track your progress towards a greener lifestyle
            </Text>
          </View>
          <TouchableOpacity style={styles.headerIcon}>
            <IconSymbol name="target" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

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
          onPress={() => setActiveTab('social')}
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
});