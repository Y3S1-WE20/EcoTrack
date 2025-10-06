import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SignUp } from '@clerk/clerk-expo';

export default function SignUpPage() {
  return (
    <View style={styles.container}>
      <SignUp />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});