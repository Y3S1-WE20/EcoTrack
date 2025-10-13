/**
 * EcoTrack App Theme System
 * Comprehensive theme configuration with light and dark mode support
 */

import { Platform, useColorScheme } from 'react-native';

const tintColorLight = '#4CAF50'; // EcoTrack green
const tintColorDark = '#66BB69';  // Lighter green for dark mode

export interface Theme {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Border and divider colors
  border: string;
  divider: string;
  
  // Component specific
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  
  // Input colors
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
  
  // Shadow and overlay
  shadow: string;
  overlay: string;
  
  // Legacy compatibility
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
}

export const lightTheme: Theme = {
  // Background colors
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  
  // Text colors
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  
  // Primary colors (EcoTrack green)
  primary: '#4CAF50',
  primaryLight: '#66BB69',
  primaryDark: '#388E3C',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Border and divider colors
  border: '#E0E0E0',
  divider: '#F0F0F0',
  
  // Component specific
  tabBar: '#FFFFFF',
  tabBarActive: '#4CAF50',
  tabBarInactive: '#666666',
  
  // Input colors
  inputBackground: '#F8F9FA',
  inputBorder: '#E0E0E0',
  inputText: '#1A1A1A',
  placeholder: '#999999',
  
  // Shadow and overlay
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Legacy compatibility
  tint: tintColorLight,
  icon: '#687076',
  tabIconDefault: '#687076',
  tabIconSelected: tintColorLight,
};

export const darkTheme: Theme = {
  // Background colors
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2C2C2C',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#808080',
  
  // Primary colors (EcoTrack green - adjusted for dark mode)
  primary: '#66BB69',
  primaryLight: '#81C784',
  primaryDark: '#4CAF50',
  
  // Status colors
  success: '#66BB69',
  warning: '#FFB74D',
  error: '#EF5350',
  info: '#42A5F5',
  
  // Border and divider colors
  border: '#404040',
  divider: '#2C2C2C',
  
  // Component specific
  tabBar: '#1E1E1E',
  tabBarActive: '#66BB69',
  tabBarInactive: '#808080',
  
  // Input colors
  inputBackground: '#2C2C2C',
  inputBorder: '#404040',
  inputText: '#FFFFFF',
  placeholder: '#808080',
  
  // Shadow and overlay
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Legacy compatibility
  tint: tintColorDark,
  icon: '#9BA1A6',
  tabIconDefault: '#9BA1A6',
  tabIconSelected: tintColorDark,
};

// Legacy Colors object for backward compatibility
export const Colors = {
  light: lightTheme,
  dark: darkTheme,
};

// Hook to get current theme based on system preference
export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}

// Function to get theme by preference
export function getTheme(isDark: boolean): Theme {
  return isDark ? darkTheme : lightTheme;
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
