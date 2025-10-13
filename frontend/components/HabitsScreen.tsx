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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { IconSymbol } from '../components/ui/icon-symbol';
import AddActivityModal from './AddActivityModal';
import ProgressCard from './ProgressCard';
import ActivityList from './ActivityList';
import { habitAPI, TodayData } from '../services/habitAPI';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

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

  const weeklyProgressPercentage = todayData ? 
    Math.min((todayData.weeklyProgress / 100) * 100, 100) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Today's Impact</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Track your carbon footprint</Text>
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
            {!isCompactMode && (
              <Text style={styles.encouragement}>
                {(todayData?.todayTotal ?? 0) < 5 ? '🎉 Great job!' : '💪 Keep improving!'}
              </Text>
            )}
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
            <View style={styles.goalProgress}>
              <Text style={[
                styles.goalPercentage,
                isCompactMode && styles.goalPercentageCompact
              ]}>
                {Math.round(weeklyProgressPercentage)}%
              </Text>
              <View style={[
                styles.goalProgressBar,
                isCompactMode && styles.goalProgressBarCompact
              ]}>
                <View 
                  style={[
                    styles.goalProgressFill, 
                    { width: `${Math.min(weeklyProgressPercentage, 100)}%` }
                  ]} 
                />
              </View>
            </View>
            {!isCompactMode && (
              <>
                <Text style={styles.goalTarget}>
                  {todayData?.weeklyGoal || 50} kg target
                </Text>
                <View style={styles.streakContainer}>
                  <IconSymbol size={16} name="flame.fill" color="#FF6B35" />
                  <Text style={styles.streakText}>7 day streak!</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Main Content with Dynamic Height */}
      <ScrollView
        style={[
          styles.scrollView,
          isCompactMode && styles.scrollViewExpanded
        ]}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          setScrollY(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
      >
        {/* Activity List with History Tab */}
        <ActivityList
          activities={todayData?.activities || []}
          onRefresh={loadTodayData}
          userId={userId}
        />
      </ScrollView>

      {/* Modern Add Activity Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => setIsAddModalVisible(true)}
      >
        <LinearGradient
          colors={['#00E676', '#4CAF50']}
          style={styles.addButtonGradient}
        >
          <IconSymbol size={28} name="plus" color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Activity Modal */}
      <AddActivityModal
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
  },
  profileButton: {
    padding: 4,
  },
  impactSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  impactBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dayBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dayBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  progressCenter: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  todayCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 20,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
    }),
  },
  todayStats: {
    flex: 1,
  },
  todayLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  todayAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  unit: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  encouragement: {
    fontSize: 12,
    fontWeight: '500',
  },
  goalStats: {
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
    marginBottom: 8,
  },
  goalProgress: {
    marginBottom: 8,
  },
  goalPercentage: {
    fontSize: 24,
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
        boxShadow: '0px 4px 20px rgba(0, 230, 118, 0.4)',
      },
      default: {
        elevation: 12,
        shadowColor: '#00E676',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
    }),
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default HabitsScreen;