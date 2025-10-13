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

const { width } = Dimensions.get('window');

const HabitsScreen = () => {
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // For demo purposes, using a fixed user ID
  const userId = 'testuser';

  // Calculate if stats should be in compact mode
  const isCompactMode = scrollY > 50;

  // Half circle progress component
  const HalfCircleProgress = ({ percentage, size = 180 }: { percentage: number; size?: number }) => {
    const radius = size / 2 - 10;
    const circumference = Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={{ width: size, height: size / 2 + 20, alignItems: 'center' }}>
        <Svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
          {/* Background arc */}
          <Path
            d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <Path
            d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(180 ${size / 2} ${size / 2})`}
          />
          <Defs>
            <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#00E676" />
              <Stop offset="50%" stopColor="#4CAF50" />
              <Stop offset="100%" stopColor="#2E7D32" />
            </SvgLinearGradient>
          </Defs>
        </Svg>
        <View style={styles.progressCenter}>
          <Text style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
          <Text style={styles.progressLabel}>Daily Goal</Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const response = await habitAPI.getTodayImpact(userId);
      if (response.success && response.data) {
        setTodayData(response.data);
      } else {
        // Fallback data when API is not available
        console.warn('API not available, using fallback data');
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#00E676', '#4CAF50', '#2E7D32']}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading your impact...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const weeklyProgressPercentage = todayData ? 
    Math.min((todayData.weeklyProgress / 100) * 100, 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with Gradient Background */}
      <LinearGradient
        colors={['#00E676', '#4CAF50', '#2E7D32']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>EcoTracker</Text>
            <Text style={styles.headerSubtitle}>Track your carbon footprint</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.notificationButton}>
              <IconSymbol size={24} name="bell.fill" color="rgba(255, 255, 255, 0.9)" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton}>
              <IconSymbol size={28} name="person.circle.fill" color="rgba(255, 255, 255, 0.9)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* CO2 Impact Section with Half Circle */}
        <View style={styles.impactSection}>
          <View style={styles.impactHeader}>
            <View style={styles.impactBadge}>
              <IconSymbol size={16} name="checkmark.circle.fill" color="#00E676" />
              <Text style={styles.impactBadgeText}>CO₂ Impact Today</Text>
            </View>
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>Day 23</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <HalfCircleProgress percentage={weeklyProgressPercentage} size={200} />
          </View>
        </View>
      </LinearGradient>

      {/* Sticky Stats Cards */}
      <View style={[
        styles.statsContainer, 
        isCompactMode && styles.statsContainerCompact
      ]}>
        <View style={[
          styles.statsCard,
          isCompactMode && styles.statsCardCompact
        ]}>
          <View style={[
            styles.todayStats,
            isCompactMode && styles.todayStatsCompact
          ]}>
            <Text style={[
              styles.todayLabel,
              isCompactMode && styles.todayLabelCompact
            ]}>
              Today
            </Text>
            <Text style={[
              styles.todayAmount,
              isCompactMode && styles.todayAmountCompact
            ]}>
              {todayData?.todayTotal?.toFixed(1) || '0.0'}
              <Text style={[styles.unit, isCompactMode && styles.unitCompact]}>kg CO₂</Text>
            </Text>
            {!isCompactMode && (
              <Text style={styles.encouragement}>
                {(todayData?.todayTotal ?? 0) < 5 ? '🎉 Great job!' : '💪 Keep improving!'}
              </Text>
            )}
          </View>

          <View style={[
            styles.goalStats,
            isCompactMode && styles.goalStatsCompact
          ]}>
            <Text style={[
              styles.goalLabel,
              isCompactMode && styles.goalLabelCompact
            ]}>
              Weekly Goal
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
        userId={userId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFFE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  headerGradient: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
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
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
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
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  todayAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  unit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
  },
  encouragement: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  goalStats: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  goalProgress: {
    marginBottom: 8,
  },
  goalPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: '#E8F5E8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  goalTarget: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  scrollViewExpanded: {
    marginTop: 10, // Reduced margin when stats are compact
  },
  scrollContent: {
    paddingBottom: 100, // Space for floating button
  },
  // Compact Mode Styles
  statsContainerCompact: {
    marginTop: -10,
    paddingHorizontal: 16,
  },
  statsCardCompact: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  todayStatsCompact: {
    marginBottom: 0,
  },
  todayLabelCompact: {
    fontSize: 12,
    marginBottom: 4,
  },
  todayAmountCompact: {
    fontSize: 18,
    marginBottom: 0,
  },
  unitCompact: {
    fontSize: 12,
  },
  goalStatsCompact: {
    marginBottom: 0,
  },
  goalLabelCompact: {
    fontSize: 12,
    marginBottom: 4,
  },
  goalPercentageCompact: {
    fontSize: 18,
    marginBottom: 4,
  },
  goalProgressBarCompact: {
    height: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
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