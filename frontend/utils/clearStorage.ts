/**
 * Development Helper: Clear All Stored Data
 * 
 * This script clears all AsyncStorage data to reset the app state.
 * Useful when JWT secrets change or when you need a clean state.
 * 
 * Run this in Expo dev tools console or add it to your app temporarily.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAllStoredData = async () => {
  try {
    console.log('🧹 Clearing all stored data...');
    
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    console.log('Found keys:', keys);
    
    // Clear all data
    await AsyncStorage.clear();
    
    console.log('✅ All stored data cleared successfully');
    console.log('🔄 Please restart the app for changes to take effect');
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing stored data:', error);
    return false;
  }
};

// For manual execution in console:
// clearAllStoredData();

export default clearAllStoredData;