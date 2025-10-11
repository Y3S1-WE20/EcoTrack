import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const PrivacyPolicyScreen = () => {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last updated: October 10, 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Introduction</Text>
            <Text style={styles.sectionText}>
              EcoTrack ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information We Collect</Text>
            <Text style={styles.sectionSubtitle}>Personal Information</Text>
            <Text style={styles.sectionText}>
              • Name and email address{'\n'}
              • Profile picture (optional){'\n'}
              • Phone number (optional){'\n'}
              • Carbon footprint data and habits{'\n'}
              • Location data (with your permission)
            </Text>
            
            <Text style={styles.sectionSubtitle}>Usage Data</Text>
            <Text style={styles.sectionText}>
              • App usage patterns{'\n'}
              • Device information{'\n'}
              • Log data and analytics{'\n'}
              • Crash reports
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
            <Text style={styles.sectionText}>
              We use your information to:{'\n\n'}
              • Provide and maintain our service{'\n'}
              • Track your carbon footprint and habits{'\n'}
              • Send you notifications and updates{'\n'}
              • Improve our app's functionality{'\n'}
              • Provide customer support{'\n'}
              • Generate personalized recommendations
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Sharing</Text>
            <Text style={styles.sectionText}>
              We do not sell, trade, or otherwise transfer your personal information to third parties, except:{'\n\n'}
              • To comply with legal obligations{'\n'}
              • To protect our rights and safety{'\n'}
              • With your explicit consent{'\n'}
              • With trusted service providers who assist us (under strict confidentiality agreements)
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Security</Text>
            <Text style={styles.sectionText}>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Rights</Text>
            <Text style={styles.sectionText}>
              You have the right to:{'\n\n'}
              • Access your personal data{'\n'}
              • Correct inaccurate data{'\n'}
              • Delete your data{'\n'}
              • Export your data{'\n'}
              • Withdraw consent{'\n'}
              • File a complaint with supervisory authorities
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Retention</Text>
            <Text style={styles.sectionText}>
              We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Children's Privacy</Text>
            <Text style={styles.sectionText}>
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changes to This Policy</Text>
            <Text style={styles.sectionText}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have any questions about this Privacy Policy, please contact us at:{'\n\n'}
              Email: privacy@ecotrack.app{'\n'}
              Website: www.ecotrack.app{'\n'}
              Address: 123 Green Street, Eco City, EC 12345
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
  lastUpdated: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 5,
    marginTop: 10,
  },
  sectionText: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
  },
});

export default PrivacyPolicyScreen;