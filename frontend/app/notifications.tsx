import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'tip' | 'alert';
  timestamp: Date;
  read: boolean;
}

const NotificationsScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    dailyReminders: true,
    achievements: true,
    ecoTips: true,
    goalAlerts: true,
  });

  useEffect(() => {
    // Load sample notifications
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        title: 'Daily Check-in Reminder',
        message: "Don't forget to log today's activities to track your carbon footprint!",
        type: 'reminder',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
      },
      {
        id: '2',
        title: 'Achievement Unlocked! 🎉',
        message: 'You\'ve successfully reduced your carbon footprint by 15% this week!',
        type: 'achievement',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: false,
      },
      {
        id: '3',
        title: 'Eco Tip of the Day 🌱',
        message: 'Try walking or biking for short trips instead of driving. You could save up to 1.2kg CO₂ per trip!',
        type: 'tip',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: true,
      },
      {
        id: '4',
        title: 'Goal Alert',
        message: 'You\'re 80% towards your weekly carbon reduction goal. Keep it up!',
        type: 'alert',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        read: true,
      },
    ];
    setNotifications(sampleNotifications);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => setNotifications([]),
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return '⏰';
      case 'achievement':
        return '🏆';
      case 'tip':
        return '💡';
      case 'alert':
        return '⚠️';
      default:
        return '📱';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={clearAllNotifications} style={styles.clearButton}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Daily Reminders</Text>
            <Switch
              value={notificationSettings.dailyReminders}
              onValueChange={(value) =>
                setNotificationSettings(prev => ({ ...prev, dailyReminders: value }))
              }
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={notificationSettings.dailyReminders ? '#FFFFFF' : '#F4F4F4'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Achievement Notifications</Text>
            <Switch
              value={notificationSettings.achievements}
              onValueChange={(value) =>
                setNotificationSettings(prev => ({ ...prev, achievements: value }))
              }
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={notificationSettings.achievements ? '#FFFFFF' : '#F4F4F4'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Eco Tips</Text>
            <Switch
              value={notificationSettings.ecoTips}
              onValueChange={(value) =>
                setNotificationSettings(prev => ({ ...prev, ecoTips: value }))
              }
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={notificationSettings.ecoTips ? '#FFFFFF' : '#F4F4F4'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Goal Alerts</Text>
            <Switch
              value={notificationSettings.goalAlerts}
              onValueChange={(value) =>
                setNotificationSettings(prev => ({ ...prev, goalAlerts: value }))
              }
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor={notificationSettings.goalAlerts ? '#FFFFFF' : '#F4F4F4'}
            />
          </View>
        </View>

        {/* Notifications List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>
                You'll see your activity reminders and achievements here
              </Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadNotification,
                ]}
                onPress={() => markAsRead(notification.id)}
              >
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </Text>
                  <View style={styles.notificationContent}>
                    <Text style={[
                      styles.notificationTitle,
                      !notification.read && styles.unreadTitle,
                    ]}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {getTimeAgo(notification.timestamp)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteNotification(notification.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteText}>×</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    fontSize: 16,
    color: '#FF5722',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingText: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  deleteText: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;