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
import { IconSymbol } from './ui/icon-symbol';
import Header from './Header';

const { width } = Dimensions.get('window');

const HabitsScreen = () => {
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const { user, isAuthenticated } = useAuth();
  const { theme } = useAppTheme();

  const screenWidth = Dimensions.get('window').width;
  const circleRadius = 80;

  useEffect(() => {
    if (isAuthenticated) {
      loadTodayData();
    }
  }, [isAuthenticated]);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const response = await habitAPI.getTodayImpact();
      if (response.success && response.data) {
        setTodayData(response.data);
      } else {
        setTodayData({
          todayTotal: 7.0,
          weeklyGoal: 50,
          weeklyProgress: 46,
          activities: [
            {
              _id: '1',
              userId: 'user1',
              activity: { 
                _id: 'act1', 
                name: 'Walking', 
                co2PerUnit: 0, 
                unit: 'km',
                category: 'transport' as any,
                icon: '🚶',
                description: 'Walking activity',
                unitLabel: 'kilometers',
                isActive: true,
                priority: 1
              },
              category: 'transport' as any,
              quantity: 3,
              co2Impact: 0.0,
              date: new Date().toISOString(),
            },
            {
              _id: '2',
              userId: 'user1',
              activity: { 
                _id: 'act2', 
                name: 'Car - Gasoline', 
                co2PerUnit: 2.3, 
                unit: 'km',
                category: 'transport' as any,
                icon: '🚗',
                description: 'Car driving',
                unitLabel: 'kilometers',
                isActive: true,
                priority: 2
              },
              category: 'transport' as any,
              quantity: 1,
              co2Impact: 2.3,
              date: new Date().toISOString(),
            }
          ],
          activityCount: 2
        });
      }
    } catch (error) {
      console.error('Error loading today data:', error);
      setTodayData({
        todayTotal: 7.0,
        weeklyGoal: 50,
        weeklyProgress: 46,
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
    await loadTodayData();
  };

  const CircularProgress = ({ progress }: { progress: number }) => {
    return (
      <View style={styles.circularProgressContainer}>
        <View style={styles.circularProgressBackground}>
          <View style={[
            styles.circularProgressFill,
            { 
              transform: [{ rotate: `${(progress / 100) * 360}deg` }] 
            }
          ]} />
        </View>
        <View style={styles.circularProgressText}>
          <Text style={styles.progressPercentage}>{progress}%</Text>
          <Text style={styles.progressLabel}>Daily Goal</Text>
        </View>
      </View>
    );
  };

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
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading your impact...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const weeklyProgressPercentage = todayData ? 
    Math.min((todayData.weeklyProgress / 100) * 100, 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <Header title="EcoTracker" subtitle="Track your carbon footprint" rightIcon="bell" />

      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.gradientContainer}>
        <View style={styles.badgeContainer}>
          <View style={styles.impactBadge}>
            <View style={styles.badgeIcon}>
              <Text style={styles.co2Icon}>🌍</Text>
            </View>
            <Text style={styles.badgeText}>CO₂ Impact Today</Text>
          </View>
          <View style={styles.dayCounter}>
            <Text style={styles.dayCounterText}>Day 23</Text>
          </View>
        </View>

        {/* Circular Progress */}
        <View style={styles.progressSection}>
          <CircularProgress progress={todayData?.weeklyProgress || 46} />
        </View>
      </LinearGradient>

      {/* Bottom Content */}
      <View style={styles.bottomContent}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today</Text>
            <Text style={styles.statValue}>
              {todayData?.todayTotal || 7.0}
              <Text style={styles.statUnit}>kg CO₂</Text>
            </Text>
            {!isCompactMode && (
              <Text style={styles.encouragement}>
                {(todayData?.todayTotal ?? 0) < 5 ? '🎉 Great job!' : '💪 Keep improving!'}
              </Text>
            )}
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Weekly Goal</Text>
            <Text style={styles.statValue}>{todayData?.weeklyProgress || 46}%</Text>
            <Text style={styles.targetText}>{todayData?.weeklyGoal || 50} kg target</Text>
            <View style={styles.streakContainer}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakText}>7 day streak!</Text>
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
      </View>

      {/* Modern Add Activity Button */}
      <TouchableOpacity
        style={styles.addButton}
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
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  gradientContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leafIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leafEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
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
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  encouragementIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  encouragementText: {
    fontSize: 12,
    color: '#4CAF50',
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
  streakText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  goalStats: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
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
  activityAmount: {
    fontSize: 12,
    color: '#666',
  },
  activityImpact: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5252',
  },
  impactUnit: {
    fontSize: 10,
    color: '#666',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
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
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HabitsScreen;