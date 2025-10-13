import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { notificationAPI, type Notification } from '@/services/notificationAPI';

const NotificationsScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({
    dailyReminders: true,
    achievements: true,
    ecoTips: true,
    goalAlerts: true,
  });

  useEffect(() => {
    loadNotifications();
    // Generate daily notifications when the app opens
    generateDailyNotifications();
  }, []);

  const loadNotifications = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await notificationAPI.getNotifications(1, 50);
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateDailyNotifications = async () => {
    try {
      // Generate daily notifications for all users
      await notificationAPI.generateDailyNotifications();
      console.log('Daily notifications generated');
    } catch (error) {
      console.error('Error generating daily notifications:', error);
      // Don't show error to user as this is background operation
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await notificationAPI.markAsRead(id);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === id ? { ...notification, read: true } : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await notificationAPI.deleteNotification(id);
      if (response.success) {
        setNotifications(prev => prev.filter(notification => notification._id !== id));
        // Update unread count if the deleted notification was unread
        const deletedNotification = notifications.find(n => n._id === id);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const clearAllNotifications = async () => {
    try {
      Alert.alert(
        'Clear All Notifications',
        'Are you sure you want to clear all notifications?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: async () => {
              // Mark all as read first, then clear local state
              await notificationAPI.markAllAsRead();
              setNotifications([]);
              setUnreadCount(0);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error clearing notifications:', error);
      Alert.alert('Error', 'Failed to clear notifications');
    }
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

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
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

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadNotifications(true)}
            colors={['#4CAF50']}
            tintColor={'#4CAF50'}
          />
        }
      >
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
          <Text style={styles.sectionTitle}>
            Recent Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>
                You'll see your activity reminders and achievements here
              </Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification._id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadNotification,
                ]}
                onPress={() => markAsRead(notification._id)}
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
                      {getTimeAgo(notification.createdAt)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteNotification(notification._id)}
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
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
});

export default NotificationsScreen;