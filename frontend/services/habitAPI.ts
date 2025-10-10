// API service for habit tracking
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { authService } from './authAPI';

// Define fallback URLs for different environments
const API_URLS = [
  'http://localhost:4000/api/v1',     // For adb reverse tunnel
  'http://10.0.2.2:4000/api/v1',     // Android emulator
  'http://192.168.1.10:4000/api/v1', // Local network IP
  'http://192.168.56.1:4000/api/v1', // VirtualBox/VMware
];

console.log('[HabitAPI] Will try URLs in order:', API_URLS);

export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  isActive: boolean;
}

export interface Activity {
  _id: string;
  name: string;
  category: string | Category;
  icon: string;
  description: string;
  co2PerUnit: number;
  unit: string;
  unitLabel: string;
  isActive: boolean;
  priority: number;
}

export interface HabitLog {
  _id: string;
  userId: string;
  activity: Activity;
  category: Category;
  quantity: number;
  co2Impact: number;
  date: string;
  notes?: string;
  voiceNote?: string;
  photo?: string;
}

export interface TodayData {
  todayTotal: number;
  weeklyGoal: number;
  weeklyProgress: number;
  activities: HabitLog[];
  activityCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class HabitAPI {
  // Helper function to try multiple URLs until one works
  private async tryRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await authService.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const requestOptions = {
      ...options,
      headers,
    };

    for (const baseUrl of API_URLS) {
      try {
        const url = `${baseUrl}${endpoint}`;
        console.log(`[HabitAPI] Trying: ${url}`);
        
        const response = await fetch(url, requestOptions);
        
        if (response.ok) {
          console.log(`[HabitAPI] Success with: ${baseUrl}`);
          return response;
        } else {
          console.log(`[HabitAPI] Failed with ${baseUrl}: HTTP ${response.status}`);
        }
      } catch (error) {
        console.log(`[HabitAPI] Failed with ${baseUrl}:`, error);
        // Continue to next URL
      }
    }

    throw new Error('All API endpoints failed');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.tryRequest(endpoint, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          errorMessage = 'Cannot connect to server. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Get today's impact data for current user (authenticated)
  async getTodayImpact(): Promise<ApiResponse<TodayData>> {
    return this.request<TodayData>('/habits/today');
  }

  // Add a new habit log (authenticated)
  async addHabitLog(habitData: {
    activityId: string;
    quantity: number;
    notes?: string;
    voiceNote?: string;
    photo?: string;
  }): Promise<ApiResponse<HabitLog>> {
    return this.request<HabitLog>('/habits/log', {
      method: 'POST',
      body: JSON.stringify(habitData),
    });
  }

  // Get all categories (public)
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>('/habits/categories');
  }

  // Get activities by category (public)
  async getActivitiesByCategory(categoryId: string): Promise<ApiResponse<Activity[]>> {
    return this.request<Activity[]>(`/habits/activities/${categoryId}`);
  }

  // Get current user's activity history (authenticated)
  async getActivityHistory(
    params?: {
      page?: number;
      limit?: number;
      category?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ApiResponse<{ activities: HabitLog[]; pagination: any }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    return this.request<{ activities: HabitLog[]; pagination: any }>(
      `/habits/history${queryString ? `?${queryString}` : ''}`
    );
  }

  // Get weekly statistics for current user (authenticated)
  async getWeeklyStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/habits/stats/weekly');
  }

  // Update habit log
  async updateHabitLog(
    logId: string,
    updates: { quantity?: number; notes?: string }
  ): Promise<ApiResponse<HabitLog>> {
    return this.request<HabitLog>(`/habits/log/${logId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Delete habit log
  async deleteHabitLog(logId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/habits/log/${logId}`, {
      method: 'DELETE',
    });
  }
}

export const habitAPI = new HabitAPI();