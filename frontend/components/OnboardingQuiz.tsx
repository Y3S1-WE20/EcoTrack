import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { QUIZ_QUESTIONS, calculateCO2Baseline } from '@/data/quizData';
import { QuizAnswer } from '@/types/onboarding';
import { profileAPI } from '@/services/profileAPI';
import { useAuth } from '@/contexts/AuthContext';
import EcoTrackLogo from '@/components/EcoTrackLogo';

interface QuizScreenProps {
  onComplete?: () => void;
}

export default function OnboardingQuiz({ onComplete }: QuizScreenProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, refreshUser } = useAuth();

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUIZ_QUESTIONS.length - 1;
  const progress = ((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleAnswerSelect = (optionId: string) => {
    const existingAnswerIndex = answers.findIndex(
      answer => answer.questionId === currentQuestion.id
    );

    let newAnswers = [...answers];

    if (currentQuestion.type === 'single') {
      // Single selection - replace existing answer
      if (existingAnswerIndex >= 0) {
        newAnswers[existingAnswerIndex] = {
          questionId: currentQuestion.id,
          selectedOptions: [optionId]
        };
      } else {
        newAnswers.push({
          questionId: currentQuestion.id,
          selectedOptions: [optionId]
        });
      }
    } else if (currentQuestion.type === 'multiple') {
      // Multiple selection - toggle option
      if (existingAnswerIndex >= 0) {
        const currentOptions = newAnswers[existingAnswerIndex].selectedOptions;
        if (currentOptions.includes(optionId)) {
          // Remove option
          newAnswers[existingAnswerIndex].selectedOptions = currentOptions.filter(
            id => id !== optionId
          );
        } else {
          // Add option
          newAnswers[existingAnswerIndex].selectedOptions = [...currentOptions, optionId];
        }
      } else {
        newAnswers.push({
          questionId: currentQuestion.id,
          selectedOptions: [optionId]
        });
      }
    }

    setAnswers(newAnswers);
  };

  const isOptionSelected = (optionId: string): boolean => {
    const answer = answers.find(answer => answer.questionId === currentQuestion.id);
    return answer?.selectedOptions.includes(optionId) || false;
  };

  const canProceed = (): boolean => {
    const answer = answers.find(answer => answer.questionId === currentQuestion.id);
    return Boolean(answer && answer.selectedOptions.length > 0);
  };

  const handleNext = () => {
    if (!canProceed()) {
      Alert.alert('Please select an answer', 'Choose at least one option to continue.');
      return;
    }

    if (isLastQuestion) {
      handleSubmitQuiz();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (answers.length !== QUIZ_QUESTIONS.length) {
      Alert.alert('Incomplete Quiz', 'Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting quiz with answers:', answers);
      
      const response = await profileAPI.submitQuiz(answers);
      
      console.log('Quiz submission successful:', response);
      
      // Refresh auth status to get updated user data
      await refreshUser();
      
      Alert.alert(
        '🌱 Welcome to EcoTrack!',
        `Your carbon baseline: ${response.data.co2Baseline.toFixed(1)} kg CO2/week\n\nYou've earned your first badge! Ready to start your eco journey?`,
        [
          {
            text: 'Continue',
            onPress: () => {
              if (onComplete) {
                onComplete();
              } else {
                router.replace('/(tabs)');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Quiz submission error:', error);
      Alert.alert(
        'Submission Error',
        'There was a problem saving your quiz results. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Calculating your carbon footprint...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <EcoTrackLogo size="medium" showText={false} />
        </View>
        <Text style={styles.title}>Carbon Footprint Assessment</Text>
        <Text style={styles.subtitle}>
          Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
        </Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>{currentQuestion.question}</Text>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => {
            const isSelected = isOptionSelected(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected
                ]}
                onPress={() => handleAnswerSelect(option.id)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  {option.icon && (
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                  )}
                  <View style={styles.optionTextContainer}>
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected
                    ]}>
                      {option.text}
                    </Text>
                  </View>
                  <View style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected
                  ]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {currentQuestion.type === 'multiple' && (
          <Text style={styles.hint}>
            💡 You can select multiple options for this question
          </Text>
        )}
      </ScrollView>

      <View style={styles.navigation}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.backButton]}
            onPress={handlePrevious}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={[
            styles.nextButtonText,
            !canProceed() && styles.nextButtonTextDisabled
          ]}>
            {isLastQuestion ? 'Complete Assessment' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#e1e1e1',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e1e1e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8e9',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  optionTextSelected: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
});