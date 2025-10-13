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
import AddActivityModal from './AddActivityModal';
import ProgressCard from './ProgressCard';
import ActivityList from './ActivityList';
import { habitAPI, TodayData } from '../services/habitAPI';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from './ui/icon-symbol';

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.gradientContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.leafIcon}>
              <Text style={styles.leafEmoji}>🌿</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>EcoTracker</Text>
              <Text style={styles.headerSubtitle}>Track your carbon footprint</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationIcon}>
              <IconSymbol name="bell" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileIcon}>
              <IconSymbol name="person" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* CO2 Impact Badge and Day Counter */}
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
            <View style={styles.encouragementContainer}>
              <Text style={styles.encouragementIcon}>💪</Text>
              <Text style={styles.encouragementText}>Keep improving!</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Weekly Goal</Text>
            <Text style={styles.statValue}>{todayData?.weeklyProgress || 46}%</Text>
            <Text style={styles.targetText}>{todayData?.weeklyGoal || 50} kg target</Text>
            <View style={styles.streakContainer}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakText}>7 day streak!</Text>
            </View>
          </View>
        </View>

        {/* Activity Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'today' && styles.activeTab]}
            onPress={() => setActiveTab('today')}
          >
            <IconSymbol name="calendar" size={20} color={activeTab === 'today' ? 'white' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>
              Today's Activities
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <IconSymbol name="chart.bar" size={20} color={activeTab === 'history' ? 'white' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Activity List */}
        <ScrollView
          style={styles.activityScrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {todayData?.activities?.map((activity, index) => (
            <View key={activity._id || index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>
                  {activity.activity.name === 'Walking' ? '🚶' : '🚗'}
                </Text>
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityType}>{activity.activity.name}</Text>
                <Text style={styles.activityAmount}>
                  {activity.quantity} {activity.activity.unit} • {new Date(activity.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.activityImpact}>
                <Text style={styles.impactValue}>
                  {activity.co2Impact.toFixed(1)}
                </Text>
                <Text style={styles.impactUnit}>kg CO₂</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton}>
                <IconSymbol name="trash" size={20} color="#FF5252" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Add Activity Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeIcon: {
    marginRight: 8,
  },
  co2Icon: {
    fontSize: 16,
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  dayCounter: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dayCounterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  progressSection: {
    alignItems: 'center',
    marginTop: 30,
  },
  circularProgressContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 160,
    height: 160,
  },
  circularProgressBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'absolute',
  },
  circularProgressFill: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: '#00E676',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    position: 'absolute',
  },
  circularProgressText: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  bottomContent: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    marginTop: -20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statUnit: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'normal',
  },
  encouragementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  encouragementIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  encouragementText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  targetText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  streakText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
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
    color: '#666',
    marginLeft: 8,
  },
  activeTabText: {
    color: 'white',
  },
  activityScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityDetails: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HabitsScreen;