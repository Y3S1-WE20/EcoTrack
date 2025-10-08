import AsyncStorage from '@react-native-async-storage/async-storage';

// Get the base URL for API requests
const getBaseUrl = () => {
  // Use localhost for development
  return 'http://localhost:4000';
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${getBaseUrl()}${url}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
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
      
      const response = await makeAuthenticatedRequest('/api/v1/profile/quiz', {
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
      
      const response = await makeAuthenticatedRequest('/api/v1/profile');
      
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
      
      const response = await makeAuthenticatedRequest('/api/v1/profile/challenge', {
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