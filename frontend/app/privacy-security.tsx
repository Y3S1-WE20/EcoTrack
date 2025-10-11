import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const PrivacySecurityScreen = () => {
  const router = useRouter();
  const [settings, setSettings] = useState({
    dataCollection: true,
    locationTracking: true,
    analyticsSharing: false,
    personalizedAds: false,
    activitySharing: true,
    publicProfile: false,
    twoFactorAuth: false,
    biometricAuth: true,
    loginAlerts: true,
    dataDownloadRequests: true,
  });

  const goBack = () => {
    router.back();
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const exportMyData = () => {
    Alert.alert(
      'Export Personal Data',
      'We will prepare your data export and send it to your email within 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request Export', onPress: () => Alert.alert('Export Requested', 'You will receive an email when your data is ready.') }
      ]
    );
  };

  const deleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data including habits, goals, and profile information. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: () => Alert.alert('Data Deletion', 'Your request has been received. All data will be deleted within 30 days.')
        }
      ]
    );
  };

  const viewPrivacyPolicy = () => {
    router.push('/privacy-policy');
  };

  const viewTermsOfService = () => {
    router.push('/terms-of-service');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Security</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Data Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Privacy</Text>
            <Text style={styles.sectionDescription}>
              Control how your data is collected and used
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Data Collection</Text>
                <Text style={styles.settingDesc}>Allow collection of usage data for app improvement</Text>
              </View>
              <Switch
                value={settings.dataCollection}
                onValueChange={() => toggleSetting('dataCollection')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.dataCollection ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Location Tracking</Text>
                <Text style={styles.settingDesc}>Allow location access for transport tracking</Text>
              </View>
              <Switch
                value={settings.locationTracking}
                onValueChange={() => toggleSetting('locationTracking')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.locationTracking ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Analytics Sharing</Text>
                <Text style={styles.settingDesc}>Share anonymized analytics with third parties</Text>
              </View>
              <Switch
                value={settings.analyticsSharing}
                onValueChange={() => toggleSetting('analyticsSharing')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.analyticsSharing ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Personalized Ads</Text>
                <Text style={styles.settingDesc}>Show ads based on your interests and activity</Text>
              </View>
              <Switch
                value={settings.personalizedAds}
                onValueChange={() => toggleSetting('personalizedAds')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.personalizedAds ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Social Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Privacy</Text>
            <Text style={styles.sectionDescription}>
              Manage your social sharing preferences
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Activity Sharing</Text>
                <Text style={styles.settingDesc}>Allow sharing achievements with friends</Text>
              </View>
              <Switch
                value={settings.activitySharing}
                onValueChange={() => toggleSetting('activitySharing')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.activitySharing ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Public Profile</Text>
                <Text style={styles.settingDesc}>Make your profile visible to other users</Text>
              </View>
              <Switch
                value={settings.publicProfile}
                onValueChange={() => toggleSetting('publicProfile')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.publicProfile ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            <Text style={styles.sectionDescription}>
              Protect your account with additional security measures
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                <Text style={styles.settingDesc}>Add an extra layer of security to your account</Text>
              </View>
              <Switch
                value={settings.twoFactorAuth}
                onValueChange={() => toggleSetting('twoFactorAuth')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.twoFactorAuth ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Biometric Authentication</Text>
                <Text style={styles.settingDesc}>Use fingerprint or face ID to unlock the app</Text>
              </View>
              <Switch
                value={settings.biometricAuth}
                onValueChange={() => toggleSetting('biometricAuth')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.biometricAuth ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Login Alerts</Text>
                <Text style={styles.settingDesc}>Get notified of new device logins</Text>
              </View>
              <Switch
                value={settings.loginAlerts}
                onValueChange={() => toggleSetting('loginAlerts')}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={settings.loginAlerts ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Data Management Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            <Text style={styles.sectionDescription}>
              Manage your personal data and account
            </Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={exportMyData}>
              <Text style={styles.actionIcon}>📄</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Export My Data</Text>
                <Text style={styles.actionDesc}>Download a copy of your personal data</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={viewPrivacyPolicy}>
              <Text style={styles.actionIcon}>🛡️</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Privacy Policy</Text>
                <Text style={styles.actionDesc}>Read our privacy policy</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={viewTermsOfService}>
              <Text style={styles.actionIcon}>📋</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Terms of Service</Text>
                <Text style={styles.actionDesc}>Read our terms and conditions</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <Text style={styles.sectionDescription}>
              Irreversible actions that affect your account
            </Text>
            
            <TouchableOpacity style={styles.dangerButton} onPress={deleteAllData}>
              <Text style={styles.dangerIcon}>🗑️</Text>
              <View style={styles.actionContent}>
                <Text style={styles.dangerTitle}>Delete All My Data</Text>
                <Text style={styles.dangerDesc}>Permanently delete all your data and account</Text>
              </View>
            </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 14,
    color: '#666666',
  },
  actionArrow: {
    fontSize: 16,
    color: '#999999',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 15,
  },
  dangerIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 2,
  },
  dangerDesc: {
    fontSize: 14,
    color: '#FF6B6B',
  },
});

export default PrivacySecurityScreen;