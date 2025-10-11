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
  // Test connection to all URLs and return the first working one
  async testConnection(): Promise<string | null> {
    console.log('[ChatAPI] Testing connections...');
    const urls = await apiConfig.getOrderedUrls();
    
    for (const url of urls) {
      try {
        const result = await this.tryRequest(url, '', { method: 'GET' });
        if (result) {
          console.log(`[ChatAPI] Found working connection: ${url}`);
          await apiConfig.setWorkingUrl(url);
          return url;
        }
      } catch (error) {
        console.log(`[ChatAPI] Connection failed for ${url}:`, error);
      }
    }
    
    console.log('[ChatAPI] No working connections found');
    return null;
  }

  private async tryRequest(url: string, endpoint: string, options: RequestInit = {}): Promise<any> {
    console.log(`[ChatAPI] Trying: ${url}${endpoint}`);
    
    // Add timeout with custom error message
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`[ChatAPI] Request timeout for: ${url}${endpoint}`);
      controller.abort();
    }, apiConfig.getTimeout());
    
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
        console.log(`[ChatAPI] HTTP Error ${response.status}:`, data);
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`[ChatAPI] Success from: ${url}${endpoint}`);
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error?.name === 'AbortError') {
        console.log(`[ChatAPI] Connection timeout to: ${url}${endpoint}`);
        throw new Error(`Connection timeout to ${url}`);
      }
      
      console.log(`[ChatAPI] Request failed to ${url}${endpoint}:`, error?.message || error);
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
    
    throw new Error(`Cannot connect to server. Please ensure the backend is running and check your network connection.

Troubleshooting:
1. Make sure the backend server is running
2. Try: adb reverse tcp:4000 tcp:4000
3. Check your WiFi connection`);
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