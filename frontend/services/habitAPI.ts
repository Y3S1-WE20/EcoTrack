// API service for habit tracking
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Determine API base URL with fallbacks ordered by most reliable in dev:
 * 1. Explicit environment variable (process.env.API_URL)
 * 2. Expo debugger host (when running in Expo/Expo Go)
 * 3. Android emulator loopback (10.0.2.2)
 * 4. Default local LAN IP fallback used previously
 *
 * This reduces "Network request failed" errors when running on emulators,
 * physical devices, or web. It also logs the chosen URL to help debugging.
 */
const getBaseURL = () => {
  // Web (local development)
  if (Platform.OS === 'web') {
    return 'http://localhost:4000/api/v1';
  }

  // First try localhost. This allows `adb reverse tcp:4000 tcp:4000` to work
  // even when the device is on mobile data or a different network.
  const localhostUrl = 'http://localhost:4000/api/v1';
  console.log('[HabitAPI] trying localhost URL (for adb reverse):', localhostUrl);
  return localhostUrl;

  // 1) Allow explicit override via environment variable for CI or custom setups
  // (e.g. API_URL=http://10.0.2.2:4000)
  // Note: when using Expo, you can add this to metro/webpack env or use a .env
  // If not present, continue to intelligent detection.
  // @ts-ignore - process.env typings in RN
  const envUrl = (process.env && (process.env.API_URL || (process.env as any).REACT_APP_API_URL)) as string | undefined;
  if (envUrl) return envUrl.replace(/\/+$/, '') + '/api/v1';

  // 2) Try to infer host from Expo Constants (works in Expo Go / dev client)
  try {
    const manifest: any = Constants.manifest || (Constants as any).exp?.manifest;
    const debuggerHost = manifest && (manifest.debuggerHost || manifest.packagerOpts?.devClientHost);
    if (typeof debuggerHost === 'string') {
      const host = debuggerHost.split(':')[0];
      const url = `http://${host}:4000/api/v1`;
      console.log('[HabitAPI] inferred API URL from Expo Constants:', url);
      return url;
    }
  } catch (e) {
    // ignore and continue
  }

  // 3) Android emulator (default Android emulator maps 10.0.2.2 to host's localhost)
  if (Platform.OS === 'android') {
    const url = 'http://10.0.2.2:4000/api/v1';
    console.log('[HabitAPI] using Android emulator loopback URL:', url);
    return url;
  }

  // 4) Fallback: local LAN IP used previously (physical device on same Wi-Fi must use host IP)
  // Updated to the current machine's Wi-Fi IPv4 address discovered via ipconfig
  const fallback = 'http://192.168.1.10:4000/api/v1';
  console.log('[HabitAPI] falling back to LAN IP URL:', fallback);
  return fallback;
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