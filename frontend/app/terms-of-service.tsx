import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const TermsOfServiceScreen = () => {
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
        <Text style={styles.title}>Terms of Service</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last updated: October 10, 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
            <Text style={styles.sectionText}>
              By downloading, installing, or using the EcoTrack mobile application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description of Service</Text>
            <Text style={styles.sectionText}>
              EcoTrack is a mobile application designed to help users track their carbon footprint, develop sustainable habits, and contribute to environmental conservation. The service includes features such as:
              {'\n\n'}• Carbon footprint tracking{'\n'}
              • Habit monitoring{'\n'}
              • Goal setting{'\n'}
              • AI-powered recommendations{'\n'}
              • Progress analytics{'\n'}
              • Community challenges
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Accounts</Text>
            <Text style={styles.sectionText}>
              To use certain features of our service, you must create an account. You are responsible for:
              {'\n\n'}• Providing accurate and complete information{'\n'}
              • Maintaining the security of your account{'\n'}
              • All activities that occur under your account{'\n'}
              • Notifying us immediately of any unauthorized use
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acceptable Use</Text>
            <Text style={styles.sectionText}>
              You agree to use EcoTrack only for lawful purposes and in accordance with these Terms. You may not:
              {'\n\n'}• Use the service for any illegal or unauthorized purpose{'\n'}
              • Attempt to gain unauthorized access to our systems{'\n'}
              • Interfere with or disrupt the service{'\n'}
              • Upload or transmit malicious code{'\n'}
              • Harass, abuse, or harm other users{'\n'}
              • Violate any applicable laws or regulations
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content and Data</Text>
            <Text style={styles.sectionText}>
              You retain ownership of any content you submit to EcoTrack. However, you grant us a license to use, modify, and display your content as necessary to provide our services. We reserve the right to remove content that violates these terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            <Text style={styles.sectionText}>
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Intellectual Property</Text>
            <Text style={styles.sectionText}>
              The EcoTrack application and all related content, features, and functionality are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without permission.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disclaimers</Text>
            <Text style={styles.sectionText}>
              EcoTrack is provided "as is" without warranties of any kind. We do not guarantee that:
              {'\n\n'}• The service will be uninterrupted or error-free{'\n'}
              • The results obtained from the service will be accurate{'\n'}
              • Any defects will be corrected{'\n'}
              • The service will meet your specific requirements
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Limitation of Liability</Text>
            <Text style={styles.sectionText}>
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of EcoTrack, even if we have been advised of the possibility of such damages.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Termination</Text>
            <Text style={styles.sectionText}>
              We may terminate or suspend your account and access to the service at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changes to Terms</Text>
            <Text style={styles.sectionText}>
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms in the app and updating the "Last updated" date. Continued use of the service constitutes acceptance of the modified Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Governing Law</Text>
            <Text style={styles.sectionText}>
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in [Your Jurisdiction].
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Text style={styles.sectionText}>
              If you have any questions about these Terms of Service, please contact us at:
              {'\n\n'}Email: legal@ecotrack.app{'\n'}
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
  sectionText: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
  },
});

export default TermsOfServiceScreen;