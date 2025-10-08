import { Platform } from 'react-native';

/**
 * Determine API base URL with fallbacks ordered by most reliable in dev:
 * 1. Web platform: localhost
 * 2. Mobile: localhost (for adb reverse)
 */
const getBaseURL = () => {
  // Web (local development)
  if (Platform.OS === 'web') {
    return 'http://localhost:4000/api/v1';
  }

  // First try localhost. This allows `adb reverse tcp:4000 tcp:4000` to work
  // even when the device is on mobile data or a different network.
  const localhostUrl = 'http://localhost:4000/api/v1';
  console.log('[ChatAPI] trying localhost URL (for adb reverse):', localhostUrl);
  return localhostUrl;
};

const API_BASE_URL = getBaseURL();

export interface ChatResponse {
  message: string;
  parsed?: {
    activity: string;
    amount: number;
    unit: string;
    activityType: string;
  };
  co2Data?: {
    activity: string;
    amount: number;
    unit: string;
    co2Saved?: number;
    co2Emitted?: number;
  };
  suggestion?: string;
  habitLogId?: string;
  success: boolean;
}

class ChatAPI {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
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
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('ChatAPI request failed:', error);
      throw error;
    }
  }

  async sendMessage(message: string, userToken?: string): Promise<ChatResponse> {
    const headers: Record<string, string> = {};
    if (userToken) {
      headers.Authorization = `Bearer ${userToken}`;
    }

    return this.request('/chat/message', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
    });
  }

  async getChatHistory(userToken: string): Promise<any[]> {
    return this.request('/chat/history', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
  }
}

export default new ChatAPI();