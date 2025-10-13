import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const SendFeedbackScreen = () => {
  const router = useRouter();
  const [feedbackData, setFeedbackData] = useState({
    type: 'general',
    subject: '',
    message: '',
    email: '',
    includeSystemInfo: true,
    rating: 0,
  });

  const feedbackTypes = [
    { id: 'bug', label: 'Bug Report', icon: '🐛' },
    { id: 'feature', label: 'Feature Request', icon: '💡' },
    { id: 'improvement', label: 'Improvement', icon: '⚡' },
    { id: 'general', label: 'General Feedback', icon: '💬' },
    { id: 'compliment', label: 'Compliment', icon: '❤️' },
  ];

  const goBack = () => {
    router.back();
  };

  const setRating = (rating: number) => {
    setFeedbackData(prev => ({ ...prev, rating }));
  };

  const submitFeedback = () => {
    if (!feedbackData.subject.trim() || !feedbackData.message.trim()) {
      Alert.alert('Error', 'Please fill in the subject and message fields');
      return;
    }

    if (feedbackData.email && !feedbackData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // TODO: Implement API call to submit feedback
    Alert.alert(
      'Feedback Sent',
      'Thank you for your feedback! We really appreciate it and will review it carefully.',
      [
        {
          text: 'OK',
          onPress: () => {
            setFeedbackData({
              type: 'general',
              subject: '',
              message: '',
              email: '',
              includeSystemInfo: true,
              rating: 0,
            });
            router.back();
          }
        }
      ]
    );
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.star}
        >
          <Text style={[
            styles.starText,
            { color: i <= feedbackData.rating ? '#FFD700' : '#E0E0E0' }
          ]}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Send Feedback</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Intro */}
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>We'd love to hear from you!</Text>
            <Text style={styles.introText}>
              Your feedback helps us improve EcoTrack and create a better experience for everyone. 
              Whether it's a bug report, feature request, or just a kind word, we appreciate it all.
            </Text>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rate Your Experience</Text>
            <Text style={styles.sectionDescription}>
              How would you rate your overall experience with EcoTrack?
            </Text>
            
            <View style={styles.ratingContainer}>
              {renderStars()}
            </View>
            
            {feedbackData.rating > 0 && (
              <Text style={styles.ratingText}>
                {feedbackData.rating === 1 && 'Poor'}
                {feedbackData.rating === 2 && 'Fair'}
                {feedbackData.rating === 3 && 'Good'}
                {feedbackData.rating === 4 && 'Very Good'}
                {feedbackData.rating === 5 && 'Excellent'}
              </Text>
            )}
          </View>

          {/* Feedback Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Feedback Type</Text>
            <Text style={styles.sectionDescription}>
              What kind of feedback are you sharing?
            </Text>
            
            <View style={styles.typeContainer}>
              {feedbackTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    feedbackData.type === type.id && styles.typeButtonSelected
                  ]}
                  onPress={() => setFeedbackData(prev => ({ ...prev, type: type.id }))}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.typeLabel,
                    feedbackData.type === type.id && styles.typeLabelSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Feedback Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Feedback</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Subject *</Text>
              <TextInput
                style={styles.formInput}
                value={feedbackData.subject}
                onChangeText={(text) => setFeedbackData(prev => ({ ...prev, subject: text }))}
                placeholder="Brief summary of your feedback"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Message *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={feedbackData.message}
                onChangeText={(text) => setFeedbackData(prev => ({ ...prev, message: text }))}
                placeholder="Tell us more about your experience, suggestion, or issue..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.formInput}
                value={feedbackData.email}
                onChangeText={(text) => setFeedbackData(prev => ({ ...prev, email: text }))}
                placeholder="your@email.com (if you want a response)"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.formHelper}>
                We'll only use this to follow up on your feedback if needed.
              </Text>
            </View>
          </View>

          {/* Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Options</Text>
            
            <View style={styles.optionItem}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Include System Information</Text>
                <Text style={styles.optionDesc}>
                  Help us debug issues by including device and app information
                </Text>
              </View>
              <Switch
                value={feedbackData.includeSystemInfo}
                onValueChange={(value) => setFeedbackData(prev => ({ ...prev, includeSystemInfo: value }))}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={feedbackData.includeSystemInfo ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={submitFeedback}>
            <Text style={styles.submitButtonText}>Send Feedback</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Thank you for helping us make EcoTrack better! 🌱
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
  introSection: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  introText: {
    fontSize: 14,
    color: '#388E3C',
    lineHeight: 20,
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
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  star: {
    marginHorizontal: 5,
  },
  starText: {
    fontSize: 32,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  typeLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  typeLabelSelected: {
    color: '#007AFF',
    fontWeight: '600',
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
  formHelper: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  optionInfo: {
    flex: 1,
    marginRight: 15,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 14,
    color: '#666666',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default SendFeedbackScreen;