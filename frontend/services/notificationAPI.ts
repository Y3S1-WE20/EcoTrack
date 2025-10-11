import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { apiConfig } from './apiConfig';

console.log('[NotificationAPI] Initializing with smart URL fallback');

// Helper function to try multiple URLs until one works
const tryRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem('ecotrack_auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const requestOptions = {
    ...options,
    headers,
  };

  // Get URLs in smart order (cached working URL first)
  const orderedUrls = await apiConfig.getOrderedUrls();

  for (const baseUrl of orderedUrls) {
    try {
      const url = `${baseUrl}${endpoint}`;
      console.log(`[NotificationAPI] Trying: ${url}`);
      
      // Add faster timeout for quicker fallback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), apiConfig.getTimeout());
      
      try {
        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        console.log(`[NotificationAPI] Success with: ${baseUrl}`);
        // Cache this working URL for faster future requests
        await apiConfig.setWorkingUrl(baseUrl);
        return data;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.log(`[NotificationAPI] Request timeout: ${baseUrl}`);
          throw new Error('Request timeout');
        }
        throw fetchError;
      }
    } catch (error) {
      console.log(`[NotificationAPI] Failed with ${baseUrl}:`, error.message);
      
      // If this was the last URL to try, rethrow the error
      if (baseUrl === orderedUrls[orderedUrls.length - 1]) {
        console.error(`[NotificationAPI] All URLs failed. Last error:`, error);
        throw error;
      }
      
      // Continue to next URL
      console.log(`[NotificationAPI] Trying next URL...`);
    }
  }
};

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'tip' | 'alert' | 'challenge' | 'social';
  read: boolean;
  data?: any;
  createdAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      hasMore: boolean;
    };
    unreadCount: number;
  };
  message?: string;
}

export const notificationAPI = {
  // Get user notifications
  getNotifications: async (page = 1, limit = 20, unreadOnly = false): Promise<NotificationResponse> => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(unreadOnly && { unreadOnly: 'true' })
      });
      
      console.log('Fetching notifications:', { page, limit, unreadOnly });
      
      const response = await tryRequest(`/notifications?${queryParams}`);
      console.log('Notifications response:', response);
      return response;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    try {
      console.log('Marking notification as read:', notificationId);
      
      const response = await tryRequest(`/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      console.log('Mark as read response:', response);
      return response;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      console.log('Marking all notifications as read');
      
      const response = await tryRequest('/notifications/read-all', {
        method: 'PUT',
      });

      console.log('Mark all as read response:', response);
      return response;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string) => {
    try {
      console.log('Deleting notification:', notificationId);
      
      const response = await tryRequest(`/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      console.log('Delete notification response:', response);
      return response;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  },

  // Generate daily notifications (admin/cron)
  generateDailyNotifications: async () => {
    try {
      console.log('Generating daily notifications');
      
      const response = await tryRequest('/notifications/generate-daily', {
        method: 'POST',
      });

      console.log('Generate daily notifications response:', response);
      return response;
    } catch (error) {
      console.error('Failed to generate daily notifications:', error);
      throw error;
    }
  },
};