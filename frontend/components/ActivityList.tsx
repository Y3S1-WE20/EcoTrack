import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { HabitLog, habitAPI } from '../services/habitAPI';

interface ActivityListProps {
  activities: HabitLog[];
  onRefresh: () => void;
  // optional controlled tab: 'today' or 'history'
  activeTab?: 'today' | 'history';
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, onRefresh, activeTab: controlledTab }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'history'>(controlledTab || 'today');
  const { theme } = useAppTheme();

  // keep in sync when parent controls the tab
  useEffect(() => {
    if (controlledTab) setActiveTab(controlledTab);
  }, [controlledTab]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleDeleteActivity = async (logId: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await habitAPI.deleteHabitLog(logId);
              if (response.success) {
                onRefresh();
                Alert.alert('Success', 'Activity deleted successfully');
              } else {
                Alert.alert('Error', response.error || 'Failed to delete activity');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete activity');
            }
          },
        },
      ]
    );
  };

  const renderActivityItem = (activity: HabitLog) => (
    <View key={activity._id} style={styles.activityCard}>
      <View style={styles.activityMain}>
        <Text style={styles.activityIcon}>{activity.activity.icon}</Text>
        <View style={styles.activityInfo}>
          <Text style={styles.activityName}>{activity.activity.name}</Text>
          <Text style={styles.activityDetails}>
            {activity.quantity} {activity.activity.unit} • {formatTime(activity.date)}
          </Text>
          {activity.notes && (
            <Text style={styles.activityNotes}>{activity.notes}</Text>
          )}
        </View>
        <View style={styles.activityImpact}>
          <Text style={styles.impactValue}>
            {activity.co2Impact.toFixed(1)} kg CO₂
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteActivity(activity._id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Tab Header (only when not controlled by parent) */}
      {!controlledTab && (
        <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            style={[
              styles.tab, 
              { backgroundColor: activeTab === 'today' ? theme.primary : 'transparent' }
            ]}
            onPress={() => setActiveTab('today')}
          >
            <Text style={styles.tabIcon}>📅</Text>
            <Text
              style={[
                styles.tabText, 
                { color: activeTab === 'today' ? '#fff' : theme.textSecondary }
              ]}
            >
              Today's Activities
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab, 
              { backgroundColor: activeTab === 'history' ? theme.primary : 'transparent' }
            ]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={styles.tabIcon}>📈</Text>
            <Text
              style={[
                styles.tabText, 
                { color: activeTab === 'history' ? '#fff' : theme.textSecondary }
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'today' && (
          <>
            {activities.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {activities.map(renderActivityItem)}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🌱</Text>
                <Text style={styles.emptyTitle}>No activities yet</Text>
                <Text style={styles.emptyMessage}>
                  Start tracking your daily habits to see your carbon impact
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>History Coming Soon</Text>
            <Text style={styles.emptyMessage}>
              Weekly and monthly statistics will be available here
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 100, // Space for floating action button
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    elevation: 2,
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
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#212121',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    minHeight: 200,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  activityDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  activityNotes: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  activityImpact: {
    alignItems: 'flex-end',
  },
  impactValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default ActivityList;