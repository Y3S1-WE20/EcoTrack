import AsyncStorage from '@react-native-async-storage/async-storage';

// Define fallback URLs for different environments
const API_URLS = [
  'http://localhost:4000/api/v1',     // For adb reverse tunnel and web (PRIORITY)
  'http://192.168.1.10:4000/api/v1', // Working local network IP
  'http://10.0.2.2:4000/api/v1',     // Android emulator
  'http://192.168.56.1:4000/api/v1', // VirtualBox/VMware  
  'http://192.168.1.1:4000/api/v1',  // Common router IP
];

const WORKING_URL_KEY = 'ecotrack_working_api_url';
const URL_TEST_TIMEOUT = 10000; // 10 seconds timeout for general requests
const CHAT_TIMEOUT = 30000; // 30 seconds for AI chat requests

class APIConfig {
  private workingUrl: string | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Try to load previously working URL
      const savedUrl = await AsyncStorage.getItem(WORKING_URL_KEY);
      if (savedUrl && API_URLS.includes(savedUrl)) {
        this.workingUrl = savedUrl;
        console.log('[APIConfig] Loaded cached working URL:', savedUrl);
      }
    } catch (error) {
      console.log('[APIConfig] Could not load cached URL:', error);
    }
    
    this.isInitialized = true;
  }

  async getOrderedUrls(): Promise<string[]> {
    await this.initialize();
    
    if (this.workingUrl) {
      // Put the working URL first, then the rest
      const otherUrls = API_URLS.filter(url => url !== this.workingUrl);
      return [this.workingUrl, ...otherUrls];
    }
    
    return [...API_URLS];
  }

  async setWorkingUrl(url: string): Promise<void> {
    if (this.workingUrl !== url) {
      this.workingUrl = url;
      try {
        await AsyncStorage.setItem(WORKING_URL_KEY, url);
        console.log('[APIConfig] Cached working URL:', url);
      } catch (error) {
        console.log('[APIConfig] Could not cache URL:', error);
      }
    }
  }

  getTimeout(): number {
    return URL_TEST_TIMEOUT;
  }

  getChatTimeout(): number {
    return CHAT_TIMEOUT;
  }
}

export const apiConfig = new APIConfig();
export { API_URLS };