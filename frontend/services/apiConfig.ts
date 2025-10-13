import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Define fallback URLs for different environments
const STATIC_API_URLS = [
  // Public localtunnel (loca.lt) URL - preferred for mobile testing across networks
  'https://warm-buses-tap.loca.lt/api/v1',
  'http://localhost:4000/api/v1',     // For adb reverse tunnel and web (PRIORITY)
  'http://10.0.2.2:4000/api/v1',     // Android emulator
  'http://192.168.56.1:4000/api/v1', // VirtualBox/VMware  
  'http://192.168.1.1:4000/api/v1',  // Common router IP
];

// Keep a stable exported name `API_URLS` for other modules that expect it.
export const API_URLS = STATIC_API_URLS;

/**
 * Try to derive the developer machine IP from Expo Constants (when running in Expo).
 * This allows the app to automatically target the correct local IP after Wi-Fi changes.
 */
function detectExpoHostApiUrl(): string | null {
  try {
    // debuggerHost looks like '192.168.1.12:19000' or 'localhost:19000'
    const manifest = (Constants as any).manifest || (Constants as any).expoConfig || null;
    const debuggerHost = manifest && (manifest.debuggerHost || manifest.hostUri || manifest.packagerOpts && manifest.packagerOpts.devClient ? null : null);

    // Some SDKs expose manifest.debuggerHost, others use Constants.manifest2 or expoConfig.
    const hostCandidates = [] as string[];
    if ((Constants as any).manifest && (Constants as any).manifest.debuggerHost) hostCandidates.push((Constants as any).manifest.debuggerHost);
    if ((Constants as any).manifest2 && (Constants as any).manifest2.debuggerHost) hostCandidates.push((Constants as any).manifest2.debuggerHost);
    if ((Constants as any).expoConfig && (Constants as any).expoConfig.hostUri) hostCandidates.push((Constants as any).expoConfig.hostUri);

    for (const cand of hostCandidates) {
      if (!cand) continue;
      const parts = String(cand).split(':');
      const ip = parts[0];
      if (ip && ip !== 'localhost') {
        return `http://${ip}:4000/api/v1`;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

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

  /**
   * Build the ordered list of candidate API URLs. We attempt to detect the dev host IP
   * via Expo Constants first, then prefer any cached working URL, then fall back to a
   * static list.
   */
  private buildCandidateUrls(): string[] {
    const detected = detectExpoHostApiUrl();
    const urls: string[] = [];
    if (detected) urls.push(detected);
    urls.push(...STATIC_API_URLS);
    return urls;
  }

  async getOrderedUrls(): Promise<string[]> {
    await this.initialize();
    
    const candidates = this.buildCandidateUrls();

    if (this.workingUrl) {
      // Put the working URL first, then the rest
      const otherUrls = candidates.filter(url => url !== this.workingUrl);
      return [this.workingUrl, ...otherUrls];
    }

    return candidates;
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
