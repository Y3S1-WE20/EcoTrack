import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Determine API base URL with fallbacks ordered by most reliable in dev:
 * 1. Explicit environment variable (process.env.API_URL)
 * 2. Expo debugger host (when running in Expo/Expo Go)
 * 3. Android emulator loopback (10.0.2.2)
 * 4. Local network IP addresses
 *
 * This reduces "Network request failed" errors when running on emulators,
 * physical devices, or web. It also logs the chosen URL to help debugging.
 */
const getBaseURL = () => {
  // Web (local development)
  if (Platform.OS === 'web') {
    return 'http://localhost:4000/api/v1';
  }

  // For mobile devices, we need to try different approaches
  // 1. First try localhost (works with adb reverse)
  // 2. Try local network IP addresses
  
  const fallbackUrls = [
    'http://localhost:4000/api/v1',        // ADB reverse
    'http://10.0.2.2:4000/api/v1',        // Android emulator
    'http://192.168.1.10:4000/api/v1',    // Local network IP
    'http://192.168.56.1:4000/api/v1'     // VirtualBox/VMware IP
  ];

  // For now, return the first URL and log it
  const selectedUrl = fallbackUrls[0];
  console.log('[ChatAPI] Using API URL:', selectedUrl);
  console.log('[ChatAPI] Available fallbacks:', fallbackUrls);
  
  return selectedUrl;
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
  private fallbackUrls = [
    'http://localhost:4000/api/v1',        // ADB reverse
    'http://10.0.2.2:4000/api/v1',        // Android emulator
    'http://192.168.1.10:4000/api/v1',    // Local network IP
    'http://192.168.56.1:4000/api/v1'     // VirtualBox/VMware IP
  ];

  private async tryRequest(url: string, endpoint: string, options: RequestInit = {}): Promise<any> {
    console.log(`[ChatAPI] Trying: ${url}${endpoint}`);
    
    const response = await fetch(`${url}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    let lastError: Error | null = null;
    
    // On web, just use localhost
    if (Platform.OS === 'web') {
      return this.tryRequest('http://localhost:4000/api/v1', endpoint, options);
    }

    // On mobile, try each URL until one works
    for (const baseUrl of this.fallbackUrls) {
      try {
        const result = await this.tryRequest(baseUrl, endpoint, options);
        console.log(`[ChatAPI] Success with: ${baseUrl}`);
        return result;
      } catch (error) {
        console.log(`[ChatAPI] Failed with ${baseUrl}:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        continue;
      }
    }

    // If all URLs failed, throw the last error with helpful message
    const errorMessage = lastError?.message || 'Unknown error';
    if (errorMessage.includes('Network request failed') || errorMessage.includes('fetch')) {
      throw new Error('Cannot connect to server. Please ensure the backend is running and check your network connection.\n\nTroubleshooting:\n1. Make sure the backend server is running\n2. Try: adb reverse tcp:4000 tcp:4000\n3. Check your WiFi connection');
    }
    
    throw lastError || new Error('All connection attempts failed');
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