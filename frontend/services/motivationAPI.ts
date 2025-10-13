import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiConfig } from './apiConfig';

console.log('[MotivationAPI] Initializing with smart URL fallback');

// Helper function to handle API requests with URL fallback
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  await apiConfig.initialize();
  const urls = await apiConfig.getOrderedUrls();
  
  console.log(`[MotivationAPI] Will try URLs in order:`, urls);
  
  for (const baseUrl of urls) {
    try {
      console.log(`[MotivationAPI] Trying: ${baseUrl}/motivation${endpoint}`);
      
      const token = await AsyncStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${baseUrl}/motivation${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`[MotivationAPI] Success with: ${baseUrl}`);
      await apiConfig.setWorkingUrl(baseUrl);
      
      return await response.json();
    } catch (error) {
      console.log(`[MotivationAPI] Failed with ${baseUrl}:`, error instanceof Error ? error.message : error);
      continue;
    }
  }
  
  throw new Error('All motivation API URLs failed');
};

// AI Quotes
export const getMotivationalQuotes = async () => {
  console.log('[MotivationAPI] Getting motivational quotes...');
  return apiRequest('/quotes');
};

export const generateNewQuote = async () => {
  console.log('[MotivationAPI] Generating new quote...');
  return apiRequest('/quotes/generate', {
    method: 'POST',
  });
};

// Test health endpoint
export const testMotivationHealth = async () => {
  console.log('[MotivationAPI] Testing health endpoint...');
  return apiRequest('/health');
};

// Community Forum
export const getCommunityPosts = async (page = 1, limit = 10) => {
  return apiRequest(`/community/posts?page=${page}&limit=${limit}`);
};

export const createCommunityPost = async (postData: {
  content: string;
  achievement?: string;
  impactData?: {
    co2Saved?: number;
    wasteReduced?: number;
    energySaved?: number;
    unit?: string;
  };
}) => {
  return apiRequest('/community/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

export const likeCommunityPost = async (postId: string, userId: string) => {
  return apiRequest(`/community/posts/${postId}/like`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
};

export const addComment = async (postId: string, content: string, author: string) => {
  return apiRequest(`/community/posts/${postId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ content, author }),
  });
};

// Featured Articles
export const getFeaturedArticles = async () => {
  return apiRequest('/articles');
};

// Challenges
export const getPersonalizedChallenges = async () => {
  return apiRequest('/challenges');
};

export const joinChallenge = async (challengeId: string) => {
  return apiRequest(`/challenges/${challengeId}/join`, {
    method: 'POST',
  });
};

// Types
export interface Quote {
  id: number;
  text: string;
  author: string;
  category: string;
  createdAt: string;
}

export interface CommunityPost {
  _id: string;
  author: string;
  content: string;
  achievement?: string;
  impactData?: {
    co2Saved: number;
    wasteReduced: number;
    energySaved: number;
    unit: string;
  };
  likes: string[];
  comments: Array<{
    author: string;
    content: string;
    createdAt: string;
  }>;
  category: string;
  createdAt: string;
}

export interface Article {
  id: number;
  title: string;
  author: string;
  readTime: string;
  description: string;
  url: string;
  category: string;
  icon: string;
  publishedAt: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  impact: string;
  icon: string;
  participants: number;
  progress: number;
  category: string;
}