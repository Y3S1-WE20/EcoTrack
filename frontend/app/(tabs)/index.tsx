import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

interface UserItem {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
}

export default function HomeScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserItems = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/api/protected/user-items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      Alert.alert('Error', 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserItems();
    }
  }, [user]);

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Welcome to EcoTrack!</ThemedText>
        <ThemedText style={styles.subtitle}>Please sign in to continue</ThemedText>
        <View style={styles.authButtons}>
          <Link href="/sign-in" asChild>
            <TouchableOpacity style={styles.button}>
              <ThemedText style={styles.buttonText}>Sign In</ThemedText>
            </TouchableOpacity>
          </Link>
          <Link href="/sign-up" asChild>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
              <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}!</ThemedText>
      <ThemedText style={styles.subtitle}>Your EcoTrack Items</ThemedText>
      
      {loading ? (
        <ThemedText>Loading...</ThemedText>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <ThemedText style={styles.itemName}>{item.name}</ThemedText>
              <ThemedText style={styles.itemDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </ThemedText>
            </View>
          )}
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>No items yet. Add some items to get started!</ThemedText>
          }
        />
      )}
      
      <TouchableOpacity style={styles.addButton} onPress={() => Alert.alert('Add Item', 'Feature coming soon!')}>
        <ThemedText style={styles.buttonText}>Add Item</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  authButtons: {
    gap: 15,
    marginTop: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  itemContainer: {
    backgroundColor: '#F2F2F7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 50,
  },
  addButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
});