import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import EcoTrackLogo from '@/components/EcoTrackLogo';
import { IconSymbol } from '@/components/ui/icon-symbol';

const ProfileScreen = () => {
  const { user, signOut, isAuthenticated } = useAuth();
  const { theme, themeMode, toggleTheme } = useAppTheme();
  const router = useRouter();

  const getThemeDisplayText = () => {
    switch (themeMode) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System Default';
      default:
        return 'System Default';
    }
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return 'sun.max.fill';
      case 'dark':
        return 'moon.fill';
      case 'system':
        return 'gearshape.fill';
      default:
        return 'gearshape.fill';
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Please sign in to view your profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Profile Header with Logo */}
          <View style={[styles.profileHeader, { backgroundColor: theme.surface }]}>
            <EcoTrackLogo size="header" showText={true} style={styles.headerLogo} />
            <View style={styles.avatar}>
              {user.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
              ) : (
                <Text style={[styles.avatarText, { color: theme.text }]}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
            <Text style={[styles.email, { color: theme.textSecondary }]}>{user.email}</Text>
            {user.completedOnboarding && (
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Text style={styles.badgeText}>✓ Onboarded</Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {user.carbonProfile?.baselineCO2?.toFixed(1) || '0.0'}
              </Text>
              <Text style={styles.statLabel}>Baseline CO₂</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {user.carbonProfile?.goals?.daily?.toFixed(1) || '7.1'}
              </Text>
              <Text style={styles.statLabel}>Daily Goal</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {user.carbonProfile?.lifestyle || 'moderate'}
              </Text>
              <Text style={styles.statLabel}>Lifestyle</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/carbon-report')}
            >
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={styles.menuText}>Carbon Footprint Report</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/personal-goals')}
            >
              <Text style={styles.menuIcon}>🎯</Text>
              <Text style={styles.menuText}>Personal Goals</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/motivation')}
            >
              <Text style={styles.menuIcon}>⭐</Text>
              <Text style={styles.menuText}>Motivation Hub</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/notifications')}
            >
              <Text style={styles.menuIcon}>🔔</Text>
              <Text style={styles.menuText}>Notifications</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/carbon-offset-program')}
            >
              <Text style={styles.menuIcon}>🌍</Text>
              <Text style={styles.menuText}>Carbon Offset Programs</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/learn-sustainability')}
            >
              <Text style={styles.menuIcon}>📚</Text>
              <Text style={styles.menuText}>Learn About Sustainability</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.menuIcon}>⚙️</Text>
              <Text style={styles.menuText}>Settings</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>

            {/* Theme Toggle */}
            <TouchableOpacity 
              style={[styles.menuItem, { backgroundColor: theme.surface }]}
              onPress={toggleTheme}
            >
              <View style={styles.themeIconContainer}>
                <IconSymbol 
                  name={getThemeIcon()} 
                  size={20} 
                  color={theme.primary} 
                />
              </View>
              <View style={styles.themeTextContainer}>
                <Text style={[styles.menuText, { color: theme.text }]}>Appearance</Text>
                <Text style={[styles.themeSubtext, { color: theme.textSecondary }]}>
                  {getThemeDisplayText()}
                </Text>
              </View>
              <IconSymbol 
                name="chevron.right" 
                size={16} 
                color={theme.textTertiary} 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
              <Text style={styles.menuIcon}>🚪</Text>
              <Text style={styles.logoutText}>Sign Out</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appVersion}>EcoTrack v1.0.0</Text>
            <Text style={styles.appDescription}>
              Making the world greener, one habit at a time 🌱
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  menuSection: {
    marginBottom: 32,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  menuArrow: {
    fontSize: 16,
    color: '#666',
  },
  badge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutItem: {
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#dc2626',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: '500',
  },
  headerLogo: {
    marginBottom: 16,
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  themeTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  themeSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default ProfileScreen;