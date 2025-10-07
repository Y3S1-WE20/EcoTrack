import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TodayData } from '../services/habitAPI';

interface ProgressCardProps {
  todayData: TodayData;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ todayData }) => {
  const progressPercentage = Math.min(
    (todayData.todayTotal / (todayData.weeklyGoal / 7)) * 100,
    100
  );

  const getProgressColor = () => {
    if (progressPercentage <= 50) return '#4CAF50';
    if (progressPercentage <= 80) return '#FF9800';
    return '#F44336';
  };

  const getEncouragementMessage = () => {
    if (progressPercentage <= 30) return 'Excellent! You\'re doing great!';
    if (progressPercentage <= 60) return 'Good progress, keep it up!';
    if (progressPercentage <= 90) return 'Consider reducing your footprint';
    return 'Time to take action today!';
  };

  const calculateTreesNeeded = () => {
    // One tree absorbs approximately 21.8 kg of CO2 per year
    const treesPerDay = todayData.todayTotal / (21.8 / 365);
    return treesPerDay.toFixed(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>✅</Text>
        <Text style={styles.title}>CO₂ Impact Today</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.targetRow}>
          <Text style={styles.targetLabel}>
            Daily Target: {(todayData.weeklyGoal / 7).toFixed(1)} kg
          </Text>
          <Text style={styles.percentage}>{Math.round(progressPercentage)}%</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progressPercentage, 100)}%`,
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.badge}>✅</Text>
          <Text style={styles.encouragementMessage}>
            {getEncouragementMessage()}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🚗</Text>
            <Text style={styles.statValue}>
              {Math.round(todayData.todayTotal * 4.8)} km
            </Text>
            <Text style={styles.statLabel}>driving</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🌳</Text>
            <Text style={styles.statValue}>{calculateTreesNeeded()}</Text>
            <Text style={styles.statLabel}>trees needed</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8F5E8',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    fontSize: 16,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  content: {
    gap: 16,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginVertical: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#C8E6C9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  encouragementMessage: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#4E7B52',
  },
});

export default ProgressCard;