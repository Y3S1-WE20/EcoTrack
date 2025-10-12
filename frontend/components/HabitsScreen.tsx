import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import EnhancedAddActivityModal from './EnhancedAddActivityModal';
import ProgressCard from './ProgressCard';
import ActivityList from './ActivityList';
import { habitAPI, TodayData } from '../services/habitAPI';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';

const HabitsScreen = () => {
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { theme } = useAppTheme();

  useEffect(() => {
    if (isAuthenticated) {
      loadTodayData();
    }
  }, [isAuthenticated]);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const response = await habitAPI.getTodayImpact(); // No userId needed - uses JWT
      if (response.success && response.data) {
        setTodayData(response.data);
      } else {
        // Fallback data when API is not available
        console.warn('API not available, using fallback data:', response.error);
        setTodayData({
          todayTotal: 0,
          weeklyGoal: 50,
          weeklyProgress: 0,
          activities: [],
          activityCount: 0
        });
      }
    } catch (error) {
      console.error('Error loading today data:', error);
      // Show fallback data instead of error
      setTodayData({
        todayTotal: 0,
        weeklyGoal: 50,
        weeklyProgress: 0,
        activities: [],
        activityCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTodayData();
    setRefreshing(false);
  };

  const handleActivityAdded = async () => {
    setIsAddModalVisible(false);
    await loadTodayData(); // Refresh data after adding activity
  };

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.text }}>Please sign in to continue</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading your impact...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Today's Impact</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Track your carbon footprint</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.todayCard, { backgroundColor: theme.surface }]}>
            <View style={styles.todayHeader}>
              <Text style={[styles.todayLabel, { color: theme.textSecondary }]}>Today</Text>
              <Text style={styles.trendIcon}>📈</Text>
            </View>
            <Text style={[styles.todayAmount, { color: theme.text }]}>
              {todayData?.todayTotal || 0.0}
              <Text style={[styles.unit, { color: theme.textSecondary }]}> kg CO₂</Text>
            </Text>
            <Text style={[styles.encouragement, { color: theme.primary }]}>
              {(todayData?.todayTotal ?? 0) < 5 ? 'Great job!' : 'Keep improving!'}
            </Text>
          </View>

          <View style={[styles.goalCard, { backgroundColor: theme.surface }]}>
            <View style={styles.goalHeader}>
              <Text style={[styles.goalLabel, { color: theme.textSecondary }]}>Weekly Goal</Text>
              <Text style={styles.goalIcon}>🎯</Text>
            </View>
            <Text style={[styles.goalPercentage, { color: theme.text }]}>
              {todayData?.weeklyProgress || 0}%
            </Text>
            <Text style={[styles.goalTarget, { color: theme.textSecondary }]}>
              {todayData?.weeklyGoal || 50} kg target
            </Text>
          </View>
        </View>

        {/* Progress Card */}
        {todayData && <ProgressCard todayData={todayData} />}

        {/* Activity List */}
        <ActivityList
          activities={todayData?.activities || []}
          onRefresh={loadTodayData}
        />
      </ScrollView>

      {/* Add Activity Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Activity Modal */}
      <EnhancedAddActivityModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onActivityAdded={handleActivityAdded}
      />
    </SafeAreaView>
  );
};

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
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  refreshIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  todayCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  trendIcon: {
    fontSize: 16,
  },
  todayAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  unit: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  encouragement: {
    fontSize: 12,
    fontWeight: '500',
  },
  goalCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  goalIcon: {
    fontSize: 16,
  },
  goalPercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  goalTarget: {
    fontSize: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
      },
      default: {
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  addButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default HabitsScreen;