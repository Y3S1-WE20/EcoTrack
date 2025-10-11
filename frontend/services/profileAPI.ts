import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { apiConfig } from './apiConfig';

console.log('[ProfileAPI] Initializing with smart URL fallback');

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
      console.log(`[ProfileAPI] Trying: ${url}`);
      
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

        console.log(`[ProfileAPI] Success with: ${baseUrl}`);
        // Cache this working URL for faster future requests
        await apiConfig.setWorkingUrl(baseUrl);
        return data;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.log(`[ProfileAPI] Failed with ${baseUrl}:`, error);
      // Continue to next URL
    }
  }

  throw new Error('All API endpoints failed');
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const token = await AsyncStorage.getItem('ecotrack_auth_token');
    console.log('Token available:', !!token);
    
    return await tryRequest(url, options);
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

export const profileAPI = {
  // Submit onboarding quiz results
  submitQuiz: async (answers: { questionId: string; selectedOptions: string[] }[]) => {
    try {
      console.log('Submitting quiz answers:', answers);
      
      const response = await makeAuthenticatedRequest('/profile/quiz', {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });

      console.log('Quiz submission response:', response);
      return response;
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      throw error;
    }
  },

  // Get complete user profile
  getProfile: async () => {
    try {
      console.log('Fetching user profile...');
      
      const response = await makeAuthenticatedRequest('/profile');
      
      console.log('Profile response:', response);
      return response;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  },

  // Update challenge progress
  updateChallengeProgress: async (progress: number, completed?: boolean) => {
    try {
      console.log('Updating challenge progress:', { progress, completed });
      
      const response = await makeAuthenticatedRequest('/profile/challenge', {
        method: 'PUT',
        body: JSON.stringify({ progress, completed }),
      });

      console.log('Challenge progress response:', response);
      return response;
    } catch (error) {
      console.error('Failed to update challenge progress:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData: {
    name: string;
    email?: string;
    phone?: string;
    bio?: string;
    profileImage?: string | null;
  }) => {
    try {
      console.log('Updating profile:', profileData);
      
      const response = await makeAuthenticatedRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      console.log('Profile update response:', response);
      return response;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },
};