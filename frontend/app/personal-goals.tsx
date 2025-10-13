import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  category: 'carbon' | 'energy' | 'transport' | 'waste';
  deadline: string;
  completed: boolean;
}

const PersonalGoalsScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);

  useEffect(() => {
    // Simulate fetching goals data
    setGoals([
      {
        id: '1',
        title: 'Reduce Daily CO₂ Emissions',
        target: 7.1,
        current: 8.2,
        unit: 'kg CO₂',
        category: 'carbon',
        deadline: '2025-12-31',
        completed: false,
      },
      {
        id: '2',
        title: 'Use Public Transport 3x/week',
        target: 3,
        current: 2,
        unit: 'times/week',
        category: 'transport',
        deadline: '2025-11-30',
        completed: false,
      },
      {
        id: '3',
        title: 'Reduce Energy Consumption',
        target: 80,
        current: 65,
        unit: '% reduction',
        category: 'energy',
        deadline: '2025-12-31',
        completed: false,
      },
    ]);
  }, []);

  const goBack = () => {
    router.back();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'carbon': return '🌍';
      case 'energy': return '⚡';
      case 'transport': return '🚌';
      case 'waste': return '♻️';
      default: return '🎯';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'carbon': return '#4CAF50';
      case 'energy': return '#FF9800';
      case 'transport': return '#2196F3';
      case 'waste': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const addNewGoal = () => {
    if (!newGoalTitle.trim() || !newGoalTarget.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      target: parseFloat(newGoalTarget),
      current: 0,
      unit: 'units',
      category: 'carbon',
      deadline: '2025-12-31',
      completed: false,
    };

    setGoals([...goals, newGoal]);
    setNewGoalTitle('');
    setNewGoalTarget('');
    setShowAddGoal(false);
    Alert.alert('Success', 'Goal added successfully!');
  };

  const deleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setGoals(goals.filter(goal => goal.id !== goalId));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Personal Goals</Text>
        <TouchableOpacity 
          onPress={() => setShowAddGoal(!showAddGoal)} 
          style={styles.addButton}
        >
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Add New Goal Form */}
          {showAddGoal && (
            <View style={styles.addGoalCard}>
              <Text style={styles.cardTitle}>Add New Goal</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Goal title"
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Target value"
                value={newGoalTarget}
                onChangeText={setNewGoalTarget}
                keyboardType="numeric"
              />
              
              <View style={styles.addGoalButtons}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => setShowAddGoal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.addGoalButton]} 
                  onPress={addNewGoal}
                >
                  <Text style={styles.addGoalButtonText}>Add Goal</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Goals Overview */}
          <View style={styles.overviewCard}>
            <Text style={styles.cardTitle}>Goals Overview</Text>
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewValue}>{goals.length}</Text>
                <Text style={styles.overviewLabel}>Total Goals</Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewValue}>
                  {goals.filter(g => g.completed).length}
                </Text>
                <Text style={styles.overviewLabel}>Completed</Text>
              </View>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewValue}>
                  {goals.filter(g => !g.completed).length}
                </Text>
                <Text style={styles.overviewLabel}>In Progress</Text>
              </View>
            </View>
          </View>

          {/* Goals List */}
          <View style={styles.goalsContainer}>
            <Text style={styles.sectionTitle}>Your Goals</Text>
            
            {goals.map((goal) => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalTitleContainer}>
                    <Text style={styles.goalIcon}>
                      {getCategoryIcon(goal.category)}
                    </Text>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalDeadline}>
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => deleteGoal(goal.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteText}>×</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.goalProgress}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {goal.current} / {goal.target} {goal.unit}
                    </Text>
                    <Text style={styles.progressPercentage}>
                      {getProgressPercentage(goal.current, goal.target).toFixed(0)}%
                    </Text>
                  </View>
                  
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${getProgressPercentage(goal.current, goal.target)}%`,
                          backgroundColor: getCategoryColor(goal.category)
                        }
                      ]} 
                    />
                  </View>
                </View>

                <View style={styles.goalActions}>
                  <TouchableOpacity style={styles.updateButton}>
                    <Text style={styles.updateButtonText}>Update Progress</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    flex: 1,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    flex: 2,
    textAlign: 'center',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    alignSelf: 'flex-end',
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  addGoalCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  addGoalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#666666',
    fontWeight: 'bold',
  },
  addGoalButton: {
    backgroundColor: '#007AFF',
  },
  addGoalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  overviewCard: {
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
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#666666',
  },
  goalsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  goalDeadline: {
    fontSize: 14,
    color: '#666666',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalProgress: {
    marginBottom: 15,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#333333',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalActions: {
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default PersonalGoalsScreen;