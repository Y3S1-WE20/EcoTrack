// API service for habit tracking
import { Platform } from 'react-native';

const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:4000/api/v1';
  }
  // For mobile devices, use the IP address from Metro
  return 'http://192.168.43.8:4000/api/v1';
};

const API_BASE_URL = getBaseURL();

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
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

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

  // Get today's impact data for a user
  async getTodayImpact(userId: string): Promise<ApiResponse<TodayData>> {
    return this.request<TodayData>(`/habits/today/${userId}`);
  }

  // Add a new habit log
  async addHabitLog(habitData: {
    userId: string;
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

  // Get all categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>('/habits/categories');
  }

  // Get activities by category
  async getActivitiesByCategory(categoryId: string): Promise<ApiResponse<Activity[]>> {
    return this.request<Activity[]>(`/habits/activities/${categoryId}`);
  }

  // Get user's activity history
  async getActivityHistory(
    userId: string,
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
      `/habits/history/${userId}${queryString ? `?${queryString}` : ''}`
    );
  }

  // Get weekly statistics
  async getWeeklyStats(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/habits/stats/weekly/${userId}`);
  }

  // Get monthly statistics
  async getMonthlyStats(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/habits/stats/monthly/${userId}`);
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