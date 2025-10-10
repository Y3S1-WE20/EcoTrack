import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { apiConfig } from './apiConfig';

/**
 * Authentication service with intelligent URL fallback and caching
 */

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
  private async tryRequest<T>(url: string, endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[AuthAPI] Trying: ${url}${endpoint}`);
    
    // Add faster timeout for quicker fallback
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.getTimeout());
    
    try {
      const response = await fetch(`${url}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      // If server indicates unauthorized, clear local credentials so user is forced to re-authenticate
      if (response.status === 401) {
        console.warn('[AuthAPI] Received 401 Unauthorized - clearing stored token and user data');
        try {
          await this.removeToken();
          await this.removeUser();
        } catch (clearErr) {
          console.error('[AuthAPI] Error clearing credentials after 401:', clearErr);
        }
        throw new Error(data.error || 'Unauthorized');
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: Error | null = null;
    
    // On web, just use localhost
    if (Platform.OS === 'web') {
      return this.tryRequest('http://localhost:4000/api/v1', endpoint, options);
    }

    // On mobile, try URLs in smart order (cached working URL first)
    const orderedUrls = await apiConfig.getOrderedUrls();
    console.log('[AuthAPI] Will try URLs in order:', orderedUrls);
    
    for (const baseUrl of orderedUrls) {
      try {
        const result = await this.tryRequest<T>(baseUrl, endpoint, options);
        console.log(`[AuthAPI] Success with: ${baseUrl}`);
        
        // Cache this working URL for faster future requests
        await apiConfig.setWorkingUrl(baseUrl);
        
        return result;
      } catch (error) {
        console.log(`[AuthAPI] Failed with ${baseUrl}:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        continue;
      }
    }

    // If all URLs failed, provide helpful error message
    const errorMessage = lastError?.message || 'Unknown error';
    if (errorMessage.includes('Network request failed') || errorMessage.includes('fetch')) {
      throw new Error('Cannot connect to server. Please ensure the backend is running and check your network connection.\n\nTroubleshooting:\n1. Make sure the backend server is running\n2. Try: adb reverse tcp:4000 tcp:4000\n3. Check your WiFi connection');
    }
    
    throw lastError || new Error('All connection attempts failed');
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