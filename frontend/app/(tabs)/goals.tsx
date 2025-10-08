import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GoalsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>🎯 Goals & Achievements</Text>
          <Text style={styles.subtitle}>
            Set targets and track your progress towards a greener lifestyle
          </Text>

          {/* Current Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Goals</Text>
            
            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalIcon}>📅</Text>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalName}>Weekly CO₂ Target</Text>
                  <Text style={styles.goalStatus}>6% of 50 kg target</Text>
                </View>
                <Text style={styles.goalProgress}>6%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '6%' }]} />
              </View>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalIcon}>🌱</Text>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalName}>Monthly Tree Offset</Text>
                  <Text style={styles.goalStatus}>Plant 5 trees equivalent</Text>
                </View>
                <Text style={styles.goalProgress}>2/5</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '40%' }]} />
              </View>
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            
            <View style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>🏆</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>First Steps</Text>
                <Text style={styles.achievementDesc}>Started tracking your carbon footprint</Text>
              </View>
            </View>

            <View style={styles.comingSoon}>
              <Text style={styles.comingSoonText}>More Features Coming Soon!</Text>
              <Text style={styles.description}>
                • Custom goal setting{'\n'}
                • Achievement badges{'\n'}
                • Social challenges{'\n'}
                • Progress reports
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  goalStatus: {
    fontSize: 14,
    color: '#666',
  },
  goalProgress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#666',
  },
  comingSoon: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default GoalsScreen;