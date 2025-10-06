import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Profile</ThemedText>
        <ThemedText style={styles.subtitle}>Please sign in to view your profile</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
      
      <View style={styles.profileSection}>
        <ThemedText style={styles.label}>Name</ThemedText>
        <ThemedText style={styles.value}>
          {user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || 'N/A'
          }
        </ThemedText>
      </View>

      <View style={styles.profileSection}>
        <ThemedText style={styles.label}>Email</ThemedText>
        <ThemedText style={styles.value}>
          {user.emailAddresses[0]?.emailAddress || 'N/A'}
        </ThemedText>
      </View>

      <View style={styles.profileSection}>
        <ThemedText style={styles.label}>User ID</ThemedText>
        <ThemedText style={styles.value}>{user.id}</ThemedText>
      </View>

      <View style={styles.profileSection}>
        <ThemedText style={styles.label}>Account Created</ThemedText>
        <ThemedText style={styles.value}>
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
        </ThemedText>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  profileSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});