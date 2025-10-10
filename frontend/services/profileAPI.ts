import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Define fallback URLs for different environments
const API_URLS = [
  'http://localhost:4000/api/v1',     // For adb reverse tunnel
  'http://10.0.2.2:4000/api/v1',     // Android emulator
  'http://192.168.1.10:4000/api/v1', // Local network IP
  'http://192.168.56.1:4000/api/v1', // VirtualBox/VMware
];

console.log('[ProfileAPI] Will try URLs in order:', API_URLS);

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

  for (const baseUrl of API_URLS) {
    try {
      const url = `${baseUrl}${endpoint}`;
      console.log(`[ProfileAPI] Trying: ${url}`);
      
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log(`[ProfileAPI] Success with: ${baseUrl}`);
      return data;
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
};