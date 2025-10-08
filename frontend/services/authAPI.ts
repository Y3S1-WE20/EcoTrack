import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseURL = () => {
  // Web (local development)
  if (Platform.OS === 'web') {
    return 'http://localhost:4000/api/v1';
  }

  // First try localhost for adb reverse
  const localhostUrl = 'http://localhost:4000/api/v1';
  console.log('[AuthAPI] using localhost URL (for adb reverse):', localhostUrl);
  return localhostUrl;
};

const API_BASE_URL = getBaseURL();
const TOKEN_KEY = 'ecotrack_auth_token';
const USER_KEY = 'ecotrack_user_data';

export interface User {
  _id: string;
  name: string;
  email: string;
  completedOnboarding: boolean;
  carbonProfile?: {
    lifestyle: string;
    baselineCO2: number;
    goals: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    preferences: Record<string, any>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

class AuthService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Auth API request failed:', error);
      
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
      
      throw new Error(errorMessage);
    }
  }

  // Token management
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  }

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // User data management
  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user data:', error);
      throw error;
    }
  }

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  }

  // Authentication methods
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.success && response.data) {
        await this.setToken(response.data.token);
        await this.setUser(response.data.user);
      }

      return response;
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.data) {
        await this.setToken(response.data.token);
        await this.setUser(response.data.user);
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.removeToken();
      await this.removeUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<{ success: boolean; data?: { user: User }; error?: string }> {
    try {
      const response = await this.request<{ success: boolean; data?: { user: User }; error?: string }>('/auth/me');
      
      if (response.success && response.data) {
        await this.setUser(response.data.user);
      }
      
      return response;
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user data'
      };
    }
  }

  async updateOnboarding(data: {
    completedOnboarding?: boolean;
    carbonProfile?: Partial<User['carbonProfile']>;
  }): Promise<{ success: boolean; data?: { user: User }; error?: string }> {
    try {
      const response = await this.request<{ success: boolean; data?: { user: User }; error?: string }>('/auth/onboarding', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (response.success && response.data) {
        await this.setUser(response.data.user);
      }

      return response;
    } catch (error) {
      console.error('Update onboarding error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update onboarding'
      };
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    const user = await this.getUser();
    return !!(token && user);
  }

  async refreshUserData(): Promise<User | null> {
    try {
      const response = await this.getCurrentUser();
      return response.success && response.data ? response.data.user : null;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  }
}

export const authService = new AuthService();