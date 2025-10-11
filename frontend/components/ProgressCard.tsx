import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/contexts/ThemeContext';
import { TodayData } from '../services/habitAPI';

interface ProgressCardProps {
  todayData: TodayData;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ todayData }) => {
  const { theme } = useAppTheme();
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
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <Text style={styles.badge}>✅</Text>
        <Text style={[styles.title, { color: theme.text }]}>CO₂ Impact Today</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.targetRow}>
          <Text style={[styles.targetLabel, { color: theme.textSecondary }]}>
            Daily Target: {(todayData.weeklyGoal / 7).toFixed(1)} kg
          </Text>
          <Text style={[styles.percentage, { color: getProgressColor() }]}>{Math.round(progressPercentage)}%</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
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
          <Text style={[styles.encouragementMessage, { color: theme.text }]}>
            {getEncouragementMessage()}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🚗</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {Math.round(todayData.todayTotal * 4.8)} km
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>driving</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🌳</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{calculateTreesNeeded()}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>trees needed</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginVertical: 8,
  },
  progressBarBg: {
    height: 8,
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
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
});

export default ProgressCard;