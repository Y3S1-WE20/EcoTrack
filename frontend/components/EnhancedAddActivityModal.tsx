import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Image,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { useAppTheme } from '@/contexts/ThemeContext';
import { habitCategories, HabitCategory, HabitSubcategory, getQuickSuggestions } from '@/constants/habitCategories';
import { habitAPI } from '../services/habitAPI';

interface AddActivityModalProps {
  visible: boolean;
  onClose: () => void;
  onActivityAdded: () => void;
}

interface QuickSuggestion {
  categoryId: string;
  subcategoryId: string;
  suggestion: string;
  co2Impact: number;
}

const { width, height } = Dimensions.get('window');

const EnhancedAddActivityModal: React.FC<AddActivityModalProps> = ({
  visible,
  onClose,
  onActivityAdded,
}) => {
  const { theme } = useAppTheme();
  const [currentStep, setCurrentStep] = useState<'quick' | 'categories' | 'details' | 'confirmation'>('quick');
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<HabitSubcategory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Media state
  const [photo, setPhoto] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState<QuickSuggestion[]>([]);
  
  // Animation
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      resetForm();
      loadQuickSuggestions();
      showModal();
    } else {
      hideModal();
    }
  }, [visible]);

  const showModal = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetForm = () => {
    setCurrentStep('quick');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setQuantity(1);
    setCustomNote('');
    setSearchQuery('');
    setPhoto(null);
    setRecordingUri(null);
    setTranscription('');
  };

  const loadQuickSuggestions = () => {
    const suggestions = getQuickSuggestions(6);
    setQuickSuggestions(suggestions);
  };

  const calculateCO2Impact = (): number => {
    if (!selectedSubcategory) return 0;
    return selectedSubcategory.co2PerUnit * quantity;
  };

  const getImpactColor = (impact: number): string => {
    if (impact < 0) return theme.success; // Carbon saved
    if (impact < 1) return theme.success;
    if (impact < 3) return theme.warning;
    return theme.error;
  };

  const getImpactMessage = (impact: number): string => {
    if (impact < 0) return `Great! You saved ${Math.abs(impact).toFixed(1)} kg CO₂`;
    if (impact < 1) return 'Low carbon impact! 🌱';
    if (impact < 3) return 'Moderate impact. Consider alternatives.';
    return 'High impact. Try eco-friendly options! 🌍';
  };

  // Voice recording functions
  const requestAudioPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestAudioPermissions();
      if (!hasPermission) {
        Alert.alert('Permission required', 'Please grant microphone permission');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
      
      // Simulate transcription (in real app, you'd use speech-to-text service)
      setIsTranscribing(true);
      setTimeout(() => {
        setTranscription('Drove 15 km to work'); // Mock transcription
        setIsTranscribing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  // Photo functions
  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) {
        Alert.alert('Permission required', 'Please grant camera permission');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to access camera');
    }
  };

  const handleQuickSuggestion = (suggestion: QuickSuggestion) => {
    const category = habitCategories.find(cat => cat.id === suggestion.categoryId);
    const subcategory = category?.subcategories.find(sub => sub.id === suggestion.subcategoryId);
    
    if (category && subcategory) {
      setSelectedCategory(category);
      setSelectedSubcategory(subcategory);
      setQuantity(1);
      setCurrentStep('details');
    }
  };

  const handleCategorySelect = (category: HabitCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategory: HabitSubcategory) => {
    setSelectedSubcategory(subcategory);
    setCurrentStep('details');
  };

  const submitActivity = async () => {
    if (!selectedCategory || !selectedSubcategory) {
      Alert.alert('Error', 'Please select a category and activity');
      return;
    }

    setLoading(true);
    try {
      const activityData = {
        categoryId: selectedCategory.id,
        activityId: selectedSubcategory.id,
        quantity,
        co2Impact: calculateCO2Impact(),
        notes: customNote || transcription,
        photo,
        voiceNote: recordingUri,
        timestamp: new Date().toISOString(),
      };

      const response = await habitAPI.logActivity(activityData);
      
      if (response.success) {
        setCurrentStep('confirmation');
        // Show success animation
        setTimeout(() => {
          onActivityAdded();
          onClose();
        }, 2000);
      } else {
        Alert.alert('Error', response.error || 'Failed to log activity');
      }
    } catch (error) {
      console.error('Failed to submit activity:', error);
      Alert.alert('Error', 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = habitCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.subcategories.some(sub => 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const renderQuickSuggestions = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Quick Add 🚀</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
        Tap a suggestion or browse categories
      </Text>
      
      <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
        {quickSuggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.suggestionCard, { backgroundColor: theme.surface }]}
            onPress={() => handleQuickSuggestion(suggestion)}
          >
            <View style={styles.suggestionContent}>
              <Text style={[styles.suggestionText, { color: theme.text }]}>
                {suggestion.suggestion}
              </Text>
              <View style={[
                styles.impactBadge,
                { backgroundColor: getImpactColor(suggestion.co2Impact) + '20' }
              ]}>
                <Text style={[styles.impactText, { color: getImpactColor(suggestion.co2Impact) }]}>
                  {suggestion.co2Impact > 0 ? '+' : ''}{suggestion.co2Impact.toFixed(1)} kg CO₂
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.browseButton, { backgroundColor: theme.primary }]}
        onPress={() => setCurrentStep('categories')}
      >
        <Text style={styles.browseButtonText}>Browse All Categories</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.stepContainer}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: theme.surface, 
            color: theme.text,
            borderColor: theme.border 
          }]}
          placeholder="Search activities..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredCategories.map((category) => (
          <View key={category.id} style={[styles.categorySection, { backgroundColor: theme.surface }]}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => handleCategorySelect(category)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, { color: theme.text }]}>{category.name}</Text>
                <Text style={[styles.categoryDescription, { color: theme.textSecondary }]}>
                  {category.description}
                </Text>
              </View>
            </TouchableOpacity>
            
            {selectedCategory?.id === category.id && (
              <View style={styles.subcategoriesContainer}>
                {category.subcategories.map((subcategory) => (
                  <TouchableOpacity
                    key={subcategory.id}
                    style={[styles.subcategoryItem, { borderColor: theme.border }]}
                    onPress={() => handleSubcategorySelect(subcategory)}
                  >
                    <Text style={styles.subcategoryIcon}>{subcategory.icon}</Text>
                    <View style={styles.subcategoryInfo}>
                      <Text style={[styles.subcategoryName, { color: theme.text }]}>
                        {subcategory.name}
                      </Text>
                      <Text style={[styles.subcategoryUnit, { color: theme.textSecondary }]}>
                        {subcategory.co2PerUnit.toFixed(2)} kg CO₂ per {subcategory.unit}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderDetails = () => (
    <View style={styles.stepContainer}>
      {selectedSubcategory && (
        <>
          <View style={styles.selectedActivityHeader}>
            <Text style={styles.selectedActivityIcon}>{selectedSubcategory.icon}</Text>
            <View>
              <Text style={[styles.selectedActivityName, { color: theme.text }]}>
                {selectedSubcategory.name}
              </Text>
              <Text style={[styles.selectedCategoryName, { color: theme.textSecondary }]}>
                {selectedCategory?.name}
              </Text>
            </View>
          </View>

          {/* Quantity Input */}
          <View style={styles.quantityContainer}>
            <Text style={[styles.quantityLabel, { color: theme.text }]}>
              Quantity ({selectedSubcategory.unit})
            </Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: theme.surface }]}
                onPress={() => setQuantity(Math.max(0.1, quantity - 0.5))}
              >
                <Text style={[styles.quantityButtonText, { color: theme.text }]}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.quantityInput, { 
                  backgroundColor: theme.surface, 
                  color: theme.text,
                  borderColor: theme.border 
                }]}
                value={quantity.toString()}
                onChangeText={(text) => setQuantity(parseFloat(text) || 0)}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: theme.surface }]}
                onPress={() => setQuantity(quantity + 0.5)}
              >
                <Text style={[styles.quantityButtonText, { color: theme.text }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CO2 Impact Display */}
          <View style={[styles.impactContainer, { backgroundColor: theme.surface }]}>
            <Text style={[styles.impactTitle, { color: theme.text }]}>Carbon Impact</Text>
            <Text style={[styles.impactValue, { color: getImpactColor(calculateCO2Impact()) }]}>
              {calculateCO2Impact() > 0 ? '+' : ''}{calculateCO2Impact().toFixed(1)} kg CO₂
            </Text>
            <Text style={[styles.impactMessage, { color: theme.textSecondary }]}>
              {getImpactMessage(calculateCO2Impact())}
            </Text>
          </View>

          {/* Voice Recording */}
          {selectedSubcategory.supportsVoice && (
            <View style={styles.voiceContainer}>
              <Text style={[styles.voiceLabel, { color: theme.text }]}>Voice Note (Optional)</Text>
              <View style={styles.voiceControls}>
                <TouchableOpacity
                  style={[
                    styles.voiceButton,
                    { backgroundColor: isRecording ? theme.error : theme.primary }
                  ]}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <Text style={styles.voiceButtonText}>
                    {isRecording ? '🔴 Stop' : '🎤 Record'}
                  </Text>
                </TouchableOpacity>
                {isTranscribing && (
                  <ActivityIndicator size="small" color={theme.primary} />
                )}
              </View>
              {transcription && (
                <Text style={[styles.transcriptionText, { color: theme.textSecondary }]}>
                  Transcription: "{transcription}"
                </Text>
              )}
            </View>
          )}

          {/* Photo Capture */}
          {selectedSubcategory.supportsPhoto && (
            <View style={styles.photoContainer}>
              <Text style={[styles.photoLabel, { color: theme.text }]}>Photo Evidence (Optional)</Text>
              <TouchableOpacity
                style={[styles.photoButton, { borderColor: theme.border }]}
                onPress={takePhoto}
              >
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoIcon}>📷</Text>
                    <Text style={[styles.photoText, { color: theme.textSecondary }]}>
                      Add Photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Custom Notes */}
          <View style={styles.notesContainer}>
            <Text style={[styles.notesLabel, { color: theme.text }]}>Notes (Optional)</Text>
            <TextInput
              style={[styles.notesInput, { 
                backgroundColor: theme.surface, 
                color: theme.text,
                borderColor: theme.border 
              }]}
              placeholder="Add any additional details..."
              placeholderTextColor={theme.textSecondary}
              value={customNote}
              onChangeText={setCustomNote}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={submitActivity}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Log Activity</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.confirmationContainer}>
      <Animated.View style={[styles.successIcon, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.successEmoji}>🎉</Text>
      </Animated.View>
      <Text style={[styles.successTitle, { color: theme.text }]}>Activity Logged!</Text>
      <Text style={[styles.successMessage, { color: theme.textSecondary }]}>
        Your carbon footprint has been updated
      </Text>
      {selectedSubcategory && (
        <View style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.summaryText, { color: theme.text }]}>
            {selectedSubcategory.name}: {quantity} {selectedSubcategory.unit}
          </Text>
          <Text style={[styles.summaryImpact, { color: getImpactColor(calculateCO2Impact()) }]}>
            {calculateCO2Impact() > 0 ? '+' : ''}{calculateCO2Impact().toFixed(1)} kg CO₂
          </Text>
        </View>
      )}
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'quick':
        return renderQuickSuggestions();
      case 'categories':
        return renderCategories();
      case 'details':
        return renderDetails();
      case 'confirmation':
        return renderConfirmation();
      default:
        return renderQuickSuggestions();
    }
  };

  const canGoBack = currentStep !== 'quick' && currentStep !== 'confirmation';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            { 
              backgroundColor: theme.background,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              {canGoBack && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    if (currentStep === 'details') {
                      setCurrentStep('categories');
                    } else if (currentStep === 'categories') {
                      setCurrentStep('quick');
                    }
                  }}
                >
                  <Text style={[styles.backButtonText, { color: theme.primary }]}>← Back</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Add Activity</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {renderStepContent()}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    height: height * 0.9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    width: 60,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    width: 60,
    alignItems: 'flex-end',
  },
  closeButtonText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  suggestionsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  suggestionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  impactBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  impactText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  browseButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  categorySection: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
  },
  subcategoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    marginTop: 8,
  },
  subcategoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  subcategoryInfo: {
    flex: 1,
  },
  subcategoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subcategoryUnit: {
    fontSize: 12,
  },
  selectedActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  selectedActivityIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  selectedActivityName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedCategoryName: {
    fontSize: 14,
  },
  quantityContainer: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityInput: {
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 18,
    textAlign: 'center',
    minWidth: 80,
  },
  impactContainer: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  impactValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  impactMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  voiceContainer: {
    marginBottom: 24,
  },
  voiceLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  voiceControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  transcriptionText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  photoContainer: {
    marginBottom: 24,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  photoButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  photoText: {
    fontSize: 16,
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  notesInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 64,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryImpact: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default EnhancedAddActivityModal;