import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import OnboardingQuiz from '@/components/OnboardingQuiz';

export default function OnboardingScreen() {
  const handleQuizComplete = () => {
    // Navigate to the main app
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <OnboardingQuiz onComplete={handleQuizComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});