// API service for habit tracking
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { authService } from './authAPI';
import { apiConfig } from './apiConfig';

console.log('[HabitAPI] Initializing with smart URL fallback');

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

export interface UserChallenge {
  _id: string;
  userId: string;
  challengeId: string;
  challengeName: string;
  challengeDescription: string;
  category: string;
  type: 'weekly' | 'monthly' | 'streak';
  target: number;
  targetMetric: 'activities' | 'categorySpecific' | 'co2Reduction' | 'consistency';
  currentProgress: number;
  status: 'active' | 'completed' | 'failed' | 'abandoned';
  joinedAt: string;
  completedAt?: string;
  endDate: string;
  reward: string;
  icon: string;
  color: string;
  shared: boolean;
  sharedAt?: string;
  sharedPlatforms: Array<{
    platform: 'instagram' | 'whatsapp' | 'facebook';
    sharedAt: string;
  }>;
  globalRank?: number;
  co2Saved: number;
}

export interface ChallengeShareData {
  challengeName: string;
  reward: string;
  icon: string;
  color: string;
  completedAt: string;
  globalRank?: number;
  totalParticipants: number;
  co2Saved: number;
  progress: number;
  target: number;
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

    // Get URLs in smart order (cached working URL first)
    const orderedUrls = await apiConfig.getOrderedUrls();

    for (const baseUrl of orderedUrls) {
      try {
        const url = `${baseUrl}${endpoint}`;
        console.log(`[HabitAPI] Trying: ${url}`);
        
        // Add faster timeout for quicker fallback
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), apiConfig.getTimeout());
        
        try {
          const response = await fetch(url, {
            ...requestOptions,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            console.log(`[HabitAPI] Success with: ${baseUrl}`);
            // Cache this working URL for faster future requests
            await apiConfig.setWorkingUrl(baseUrl);
            return response;
          } else {
            console.log(`[HabitAPI] Failed with ${baseUrl}: HTTP ${response.status}`);
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
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

  // Get filtered habit logs with statistics
  async getFilteredHabitLogs(
    userId: string, 
    filters?: { date?: string; categoryId?: string }
  ): Promise<ApiResponse<{
    habitLogs: HabitLog[];
    totalCO2: number;
    activityCount: number;
    pieChartData: Array<{
      name: string;
      value: number;
      color: string;
      icon: string;
    }>;
    barChartData: Array<{
      date?: string;
      hour?: string;
      co2: number;
    }>;
    selectedDate: string | null;
    selectedCategory: string;
  }>> {
    const searchParams = new URLSearchParams();
    
    if (filters?.date) {
      searchParams.append('date', filters.date);
    }
    if (filters?.categoryId) {
      searchParams.append('categoryId', filters.categoryId);
    }

    const queryString = searchParams.toString();
    return this.request(`/habits/filtered/${userId}${queryString ? `?${queryString}` : ''}`);
  }

  // Challenge API methods
  async getUserChallenges(userId: string): Promise<ApiResponse<{
    active: UserChallenge[];
    completed: UserChallenge[];
  }>> {
    return this.request(`/challenges/user/${userId}`);
  }

  async joinChallenge(userId: string, challengeData: {
    challengeId: string;
    challengeName: string;
    challengeDescription: string;
    category: string;
    type: 'weekly' | 'monthly' | 'streak';
    target: number;
    targetMetric: 'activities' | 'categorySpecific' | 'co2Reduction' | 'consistency';
    endDate: string;
    reward: string;
    icon: string;
    color: string;
  }): Promise<ApiResponse<UserChallenge>> {
    return this.request(`/challenges/user/${userId}/join`, {
      method: 'POST',
      body: JSON.stringify(challengeData),
    });
  }

  async updateChallengeProgress(userId: string, challengeId: string): Promise<ApiResponse<UserChallenge>> {
    return this.request(`/challenges/user/${userId}/${challengeId}/progress`, {
      method: 'PUT',
    });
  }

  async getChallengeLeaderboard(challengeId: string, limit = 50): Promise<ApiResponse<UserChallenge[]>> {
    return this.request(`/challenges/${challengeId}/leaderboard?limit=${limit}`);
  }

  async markChallengeShared(userId: string, challengeId: string, platform: 'instagram' | 'whatsapp' | 'facebook'): Promise<ApiResponse<UserChallenge>> {
    return this.request(`/challenges/user/${userId}/${challengeId}/share`, {
      method: 'POST',
      body: JSON.stringify({ platform }),
    });
  }

  async getChallengeShareData(userId: string, challengeId: string): Promise<ApiResponse<ChallengeShareData>> {
    return this.request(`/challenges/user/${userId}/${challengeId}/share-data`);
  }
}

export const habitAPI = new HabitAPI();