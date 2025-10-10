import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const SettingsScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [carbonTracking, setCarbonTracking] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const goBack = () => {
    router.back();
  };

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🔔</Text>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Push Notifications</Text>
                  <Text style={styles.settingDesc}>Receive habit reminders and updates</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🌍</Text>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Carbon Tracking</Text>
                  <Text style={styles.settingDesc}>Track your carbon footprint automatically</Text>
                </View>
              </View>
              <Switch
                value={carbonTracking}
                onValueChange={setCarbonTracking}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={carbonTracking ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🌙</Text>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Dark Mode</Text>
                  <Text style={styles.settingDesc}>Use dark theme</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>📍</Text>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Location Services</Text>
                  <Text style={styles.settingDesc}>For transport tracking and local suggestions</Text>
                </View>
              </View>
              <Switch
                value={locationServices}
                onValueChange={setLocationServices}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={locationServices ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/edit-profile')}
            >
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuText}>Edit Profile</Text>
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
              onPress={() => router.push('/privacy-security')}
            >
              <Text style={styles.menuIcon}>🔒</Text>
              <Text style={styles.menuText}>Privacy & Security</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/export-data')}
            >
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={styles.menuText}>Export Data</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Climate Action Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Climate Action</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/carbon-offset-program')}
            >
              <Text style={styles.menuIcon}>🌳</Text>
              <Text style={styles.menuText}>Carbon Offset Program</Text>
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
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/help-support')}
            >
              <Text style={styles.menuIcon}>❓</Text>
              <Text style={styles.menuText}>Help & Support</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/send-feedback')}
            >
              <Text style={styles.menuIcon}>💬</Text>
              <Text style={styles.menuText}>Send Feedback</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/terms-of-service')}
            >
              <Text style={styles.menuIcon}>📄</Text>
              <Text style={styles.menuText}>Terms of Service</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/privacy-policy')}
            >
              <Text style={styles.menuIcon}>🛡️</Text>
              <Text style={styles.menuText}>Privacy Policy</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            
            <View style={styles.aboutCard}>
              <Text style={styles.appName}>EcoTrack</Text>
              <Text style={styles.version}>Version 1.0.0</Text>
              <Text style={styles.description}>
                Making the world greener, one habit at a time 🌱
              </Text>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 15,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    paddingLeft: 5,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 14,
    color: '#666666',
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 16,
    color: '#999999',
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  version: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SettingsScreen;