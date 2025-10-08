import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { habitAPI, Category, Activity } from '../services/habitAPI';

interface AddActivityModalProps {
  visible: boolean;
  onClose: () => void;
  onActivityAdded: () => void;
}

const { width } = Dimensions.get('window');

const AddActivityModal: React.FC<AddActivityModalProps> = ({
  visible,
  onClose,
  onActivityAdded,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [estimatedCO2, setEstimatedCO2] = useState(0);

  useEffect(() => {
    if (visible) {
      loadCategories();
      resetForm();
    }
  }, [visible]);

  useEffect(() => {
    if (selectedActivity) {
      setEstimatedCO2(selectedActivity.co2PerUnit * quantity);
    }
  }, [selectedActivity, quantity]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await habitAPI.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async (categoryId: string) => {
    try {
      setLoading(true);
      const response = await habitAPI.getActivitiesByCategory(categoryId);
      if (response.success && response.data) {
        setActivities(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setSelectedActivity(null);
    setQuantity(1);
    setNotes('');
    setEstimatedCO2(0);
  };

  const handleCategorySelect = async (category: Category) => {
    setSelectedCategory(category);
    await loadActivities(category._id);
    setCurrentStep(2);
  };

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    setCurrentStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedActivity) return;

    try {
      setLoading(true);
      const response = await habitAPI.addHabitLog({
        activityId: selectedActivity._id,
        quantity,
        notes: notes.trim() || undefined,
      });

      if (response.success) {
        onActivityAdded();
        Alert.alert('Success', 'Activity added successfully!');
      } else {
        Alert.alert('Error', response.error || 'Failed to add activity');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add activity');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Select Category';
      case 2:
        return 'Select Activity';
      case 3:
        return 'Set Quantity';
      default:
        return 'Add Activity';
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.progressStep,
            currentStep >= step && styles.progressStepActive,
          ]}
        />
      ))}
    </View>
  );

  const renderCategorySelection = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.stepTitle}>Select Category</Text>
      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category._id}
            style={styles.categoryCard}
            onPress={() => handleCategorySelect(category)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderActivitySelection = () => (
    <ScrollView style={styles.content}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentStep(1)}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      
      <Text style={styles.stepTitle}>Select Activity</Text>
      
      {activities.map((activity) => (
        <TouchableOpacity
          key={activity._id}
          style={styles.activityCard}
          onPress={() => handleActivitySelect(activity)}
        >
          <Text style={styles.activityIcon}>{activity.icon}</Text>
          <View style={styles.activityInfo}>
            <Text style={styles.activityName}>{activity.name}</Text>
            <Text style={styles.activityDetails}>
              {activity.co2PerUnit} kg CO₂ per {activity.unitLabel}
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderQuantitySelection = () => (
    <ScrollView style={styles.content}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentStep(2)}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.stepTitle}>Set Quantity</Text>

      {selectedActivity && (
        <View style={styles.quantityCard}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityIcon}>{selectedActivity.icon}</Text>
            <View>
              <Text style={styles.selectedActivityName}>{selectedActivity.name}</Text>
              <Text style={styles.selectedActivityDetails}>
                {selectedActivity.co2PerUnit} kg CO₂ per {selectedActivity.unit}
              </Text>
            </View>
          </View>

          <Text style={styles.quantityLabel}>
            Quantity ({selectedActivity.unitLabel})
          </Text>
          
          <View style={styles.sliderContainer}>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(0.1, quantity - (selectedActivity.unit === 'km' ? 1 : 0.1)))}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              
              <TextInput
                style={styles.quantityInput}
                value={quantity.toFixed(1)}
                onChangeText={(text) => {
                  const value = parseFloat(text) || 0;
                  setQuantity(Math.max(0.1, value));
                }}
                keyboardType="numeric"
              />
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + (selectedActivity.unit === 'km' ? 1 : 0.1))}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.quantityValue}>{quantity.toFixed(1)} {selectedActivity.unitLabel}</Text>
          </View>

          <View style={styles.estimationCard}>
            <Text style={styles.estimationLabel}>Estimated</Text>
            <Text style={styles.estimationLabel}>CO₂ Impact</Text>
            <View style={styles.co2Badge}>
              <Text style={styles.co2Value}>{estimatedCO2.toFixed(1)} kg CO₂</Text>
            </View>
          </View>

          <Text style={styles.notesLabel}>Voice Note</Text>
          <View style={styles.notesRow}>
            <TouchableOpacity style={styles.voiceButton}>
              <Text style={styles.voiceIcon}>🎤</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton}>
              <Text style={styles.photoIcon}>📷</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.addButtonText}>Add Activity</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getStepTitle()}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Content */}
        {loading && currentStep === 1 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : (
          <>
            {currentStep === 1 && renderCategorySelection()}
            {currentStep === 2 && renderActivitySelection()}
            {currentStep === 3 && renderQuantitySelection()}
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    padding: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#212121',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  activityDetails: {
    fontSize: 12,
    color: '#666',
  },
  arrow: {
    fontSize: 16,
    color: '#666',
  },
  quantityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  selectedActivityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  selectedActivityDetails: {
    fontSize: 14,
    color: '#666',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 12,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  quantityInput: {
    width: 80,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginTop: 8,
  },
  estimationCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  estimationLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  co2Badge: {
    backgroundColor: '#FF4444',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  co2Value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 12,
  },
  notesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  voiceButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  voiceIcon: {
    fontSize: 24,
  },
  photoButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  photoIcon: {
    fontSize: 24,
  },
  addButton: {
    backgroundColor: '#212121',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddActivityModal;