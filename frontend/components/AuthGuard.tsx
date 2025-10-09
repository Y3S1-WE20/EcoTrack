import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    const inMainApp = segments[0] === '(tabs)';

    if (!user) {
      // User is not authenticated
      if (!inAuthGroup) {
        router.replace('/auth');
      }
    } else {
      // User is authenticated
      const needsOnboarding = !user.completedOnboarding;
      
      if (needsOnboarding && !inOnboarding) {
        // User needs onboarding, redirect to onboarding
        router.replace('/onboarding');
      } else if (!needsOnboarding && (inAuthGroup || inOnboarding)) {
        // User completed onboarding but is on auth/onboarding screen
        router.replace('/(tabs)');
      } else if (needsOnboarding && inMainApp) {
        // User somehow reached main app without completing onboarding
        router.replace('/onboarding');
      }
    }
  }, [user, isLoading, segments]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});