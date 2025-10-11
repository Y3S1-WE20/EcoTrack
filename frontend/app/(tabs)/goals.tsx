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