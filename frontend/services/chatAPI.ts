import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiConfig } from './apiConfig';

/**
 * Chat API service with intelligent URL fallback and caching
 */

console.log('[ChatAPI] Initializing with smart URL fallback');

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
  private async tryRequest(url: string, endpoint: string, options: RequestInit = {}): Promise<any> {
    console.log(`[ChatAPI] Trying: ${url}${endpoint}`);
    
    // Add faster timeout for quicker fallback
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.getTimeout());
    
    try {
      const response = await fetch(`${url}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    let lastError: Error | null = null;
    
    // On web, just use localhost
    if (Platform.OS === 'web') {
      return this.tryRequest('http://localhost:4000/api/v1', endpoint, options);
    }

    // On mobile, try URLs in smart order (cached working URL first)
    const orderedUrls = await apiConfig.getOrderedUrls();
    
    for (const baseUrl of orderedUrls) {
      try {
        const result = await this.tryRequest(baseUrl, endpoint, options);
        console.log(`[ChatAPI] Success with: ${baseUrl}`);
        
        // Cache this working URL for faster future requests
        await apiConfig.setWorkingUrl(baseUrl);
        
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
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