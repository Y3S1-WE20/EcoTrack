import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { IconSymbol } from '../components/ui/icon-symbol';
import { HabitLog, habitAPI } from '../services/habitAPI';
import HistoryTab from './HistoryTab';

interface ActivityListProps {
  activities: HabitLog[];
  onRefresh: () => void;
  userId: string;
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, onRefresh, userId }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getActivityIcon = (activityName: string) => {
    const name = activityName.toLowerCase();
    if (name.includes('heating') || name.includes('oil')) return 'flame.fill';
    if (name.includes('gas') || name.includes('natural')) return 'flame';
    if (name.includes('car') || name.includes('gasoline') || name.includes('transport')) return 'car.fill';
    if (name.includes('electricity') || name.includes('electric')) return 'bolt.fill';
    if (name.includes('water')) return 'drop.fill';
    if (name.includes('waste') || name.includes('trash')) return 'trash.fill';
    return 'leaf.fill';
  };

  const getActivityColor = (activityName: string) => {
    const name = activityName.toLowerCase();
    if (name.includes('heating') || name.includes('oil')) return '#FF6B35';
    if (name.includes('gas') || name.includes('natural')) return '#FFA726';
    if (name.includes('car') || name.includes('gasoline') || name.includes('transport')) return '#EF5350';
    if (name.includes('electricity') || name.includes('electric')) return '#42A5F5';
    if (name.includes('water')) return '#26C6DA';
    if (name.includes('waste') || name.includes('trash')) return '#AB47BC';
    return '#66BB6A';
  };

  const getCategoryName = (category: any) => {
    if (!category) return 'General';
    if (typeof category === 'string') return category;
    if (category.name) return category.name;
    if (category._id) return 'Category';
    return String(category);
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

  const renderActivityItem = (activity: HabitLog) => {
    // Safety check for missing activity data
    if (!activity.activity) {
      console.warn('Activity data is missing for habit log:', activity._id);
      return (
        <View key={activity._id} style={styles.activityCard}>
          <View style={styles.activityMain}>
            <View style={[styles.activityIconContainer, { backgroundColor: '#E0E0E0' }]}>
              <IconSymbol size={20} name="questionmark" color="#757575" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityName}>Unknown Activity</Text>
              <Text style={styles.activityDetails}>
                {activity.quantity} units • {formatTime(activity.date)}
              </Text>
              {activity.notes && (
                <Text style={styles.activityNotes}>{activity.notes}</Text>
              )}
            </View>
            <View style={styles.activityImpact}>
              <Text style={styles.impactValue}>
                {activity.co2Impact?.toFixed(1) || '0.0'}
              </Text>
              <Text style={styles.impactUnit}>kg CO₂</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteActivity(activity._id)}
          >
            <IconSymbol size={16} name="trash.fill" color="#EF5350" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View key={activity._id} style={styles.activityCard}>
        <View style={styles.activityMain}>
          <View style={[styles.activityIconContainer, { backgroundColor: getActivityColor(activity.activity.name) + '20' }]}>
            <IconSymbol 
              size={20} 
              name={getActivityIcon(activity.activity.name) as any} 
              color={getActivityColor(activity.activity.name)} 
            />
          </View>
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
              {activity.co2Impact.toFixed(1)}
            </Text>
            <Text style={styles.impactUnit}>kg CO₂</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteActivity(activity._id)}
        >
          <IconSymbol size={16} name="trash.fill" color="#EF5350" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Header */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'today' && styles.activeTab]}
          onPress={() => setActiveTab('today')}
        >
          <IconSymbol 
            size={16} 
            name="calendar" 
            color={activeTab === 'today' ? '#FFFFFF' : '#666'} 
          />
          <Text
            style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}
          >
            Today's Activities
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <IconSymbol 
            size={16} 
            name="chart.bar.fill" 
            color={activeTab === 'history' ? '#FFFFFF' : '#666'} 
          />
          <Text
            style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

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
          <HistoryTab userId={userId} />
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    minHeight: 200,
  },
  activityCard: {
    backgroundColor: 'rgba(146, 146, 146, 0.14)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  activityMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  activityDetails: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
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
    color: '#EF5350',
  },
  impactUnit: {
    fontSize: 10,
    color: '#666',
    marginTop: 1,
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityCategory: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(239, 83, 80, 0.08)',
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#EF5350',
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