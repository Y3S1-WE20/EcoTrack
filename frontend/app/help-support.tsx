import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Linking 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const HelpSupportScreen = () => {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    email: '',
  });

  const goBack = () => {
    router.back();
  };

  const faqData = [
    {
      question: "How do I track my carbon footprint?",
      answer: "You can track your carbon footprint by logging daily activities in the app. Use the AI Assistant to tell us about your activities like 'I drove 10 miles today' or 'I took public transport for 30 minutes', and we'll automatically calculate your CO2 emissions."
    },
    {
      question: "How accurate are the CO2 calculations?",
      answer: "Our CO2 calculations are based on widely accepted emission factors from environmental agencies and research institutions. While they provide good estimates, actual emissions may vary based on specific circumstances like vehicle efficiency, energy sources, etc."
    },
    {
      question: "Can I set custom goals?",
      answer: "Yes! Go to the Goals section to set personalized carbon reduction targets. You can set daily, weekly, or monthly goals based on your lifestyle and environmental objectives."
    },
    {
      question: "How do I earn badges?",
      answer: "Badges are earned automatically when you reach certain milestones, like logging activities for consecutive days, reducing your carbon footprint, or completing challenges. Check the Motivation Hub to see available badges."
    },
    {
      question: "Is my data private and secure?",
      answer: "Absolutely. We take privacy seriously and don't share your personal data with third parties. All data is encrypted and stored securely. You can review our Privacy Policy for detailed information."
    },
    {
      question: "How do I export my data?",
      answer: "You can export your data from Settings > Privacy & Security > Export My Data. We'll prepare a comprehensive report and send it to your email within 24 hours."
    },
    {
      question: "What if I want to delete my account?",
      answer: "You can delete your account from Settings > Edit Profile > Danger Zone. Please note that this action is irreversible and will permanently delete all your data."
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const openEmail = () => {
    Linking.openURL('mailto:support@ecotrack.app');
  };

  const openWebsite = () => {
    Linking.openURL('https://www.ecotrack.app');
  };

  const submitContactForm = () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim() || !contactForm.email.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!contactForm.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // TODO: Implement API call to submit support ticket
    Alert.alert(
      'Support Request Sent',
      'Thank you for contacting us! We\'ll get back to you within 24 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            setContactForm({ subject: '', message: '', email: '' });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={openEmail}>
              <Text style={styles.actionIcon}>📧</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Email Support</Text>
                <Text style={styles.actionDesc}>Send us an email at support@ecotrack.app</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={openWebsite}>
              <Text style={styles.actionIcon}>🌐</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Visit Website</Text>
                <Text style={styles.actionDesc}>Browse our help center and documentation</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Live Chat', 'Live chat feature coming soon!')}
            >
              <Text style={styles.actionIcon}>💬</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Live Chat</Text>
                <Text style={styles.actionDesc}>Chat with our support team (Coming soon)</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Frequently Asked Questions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            {faqData.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(index)}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Text style={styles.faqArrow}>
                    {expandedFAQ === index ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>
                
                {expandedFAQ === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Contact Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.sectionDescription}>
              Can't find what you're looking for? Send us a message and we'll help you out.
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Your Email</Text>
              <TextInput
                style={styles.formInput}
                value={contactForm.email}
                onChangeText={(text) => setContactForm(prev => ({ ...prev, email: text }))}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Subject</Text>
              <TextInput
                style={styles.formInput}
                value={contactForm.subject}
                onChangeText={(text) => setContactForm(prev => ({ ...prev, subject: text }))}
                placeholder="What can we help you with?"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Message</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={contactForm.message}
                onChangeText={(text) => setContactForm(prev => ({ ...prev, message: text }))}
                placeholder="Describe your issue or question in detail..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={submitContactForm}>
              <Text style={styles.submitButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>

          {/* App Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version:</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build:</Text>
              <Text style={styles.infoValue}>2025.10.10</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Support Email:</Text>
              <Text style={styles.infoValue}>support@ecotrack.app</Text>
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
    marginBottom: 15,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
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
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 10,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 10,
  },
  faqArrow: {
    fontSize: 14,
    color: '#666666',
  },
  faqAnswer: {
    paddingBottom: 15,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
});

export default HelpSupportScreen;