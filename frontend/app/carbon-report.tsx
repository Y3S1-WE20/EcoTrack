import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

interface CarbonData {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

const CarbonReportScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [carbonData, setCarbonData] = useState<CarbonData>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
  });

  useEffect(() => {
    // Simulate fetching carbon footprint data
    // In a real app, this would come from your API
    setCarbonData({
      daily: 8.2,
      weekly: 57.4,
      monthly: 248.0,
      yearly: 2976.0,
    });
  }, []);

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Carbon Footprint Report</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Overview Card */}
          <View style={styles.overviewCard}>
            <Text style={styles.cardTitle}>Your Carbon Impact</Text>
            <Text style={styles.subtitle}>Current Status</Text>
            
            <View style={styles.mainStat}>
              <Text style={styles.mainValue}>{carbonData.daily} kg</Text>
              <Text style={styles.mainLabel}>CO₂ Today</Text>
            </View>

            <View style={styles.goalComparison}>
              <Text style={styles.goalText}>
                Daily Goal: {user?.carbonProfile?.goals?.daily?.toFixed(1) || '7.1'} kg CO₂
              </Text>
              <Text style={styles.goalStatus}>
                {carbonData.daily > (user?.carbonProfile?.goals?.daily || 7.1) 
                  ? '⚠️ Above target' 
                  : '✅ Within target'}
              </Text>
            </View>
          </View>

          {/* Time Period Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{carbonData.weekly}</Text>
              <Text style={styles.statLabel}>Weekly (kg CO₂)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{carbonData.monthly}</Text>
              <Text style={styles.statLabel}>Monthly (kg CO₂)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{carbonData.yearly}</Text>
              <Text style={styles.statLabel}>Yearly (kg CO₂)</Text>
            </View>
          </View>

          {/* Breakdown */}
          <View style={styles.breakdownCard}>
            <Text style={styles.cardTitle}>Emissions Breakdown</Text>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownIcon}>🚗</Text>
              <Text style={styles.breakdownText}>Transportation</Text>
              <Text style={styles.breakdownValue}>3.2 kg</Text>
            </View>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownIcon}>🏠</Text>
              <Text style={styles.breakdownText}>Energy Usage</Text>
              <Text style={styles.breakdownValue}>2.8 kg</Text>
            </View>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownIcon}>🍽️</Text>
              <Text style={styles.breakdownText}>Food & Dining</Text>
              <Text style={styles.breakdownValue}>1.8 kg</Text>
            </View>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownIcon}>🛍️</Text>
              <Text style={styles.breakdownText}>Shopping</Text>
              <Text style={styles.breakdownValue}>0.4 kg</Text>
            </View>
          </View>

          {/* Recommendations */}
          <View style={styles.recommendationsCard}>
            <Text style={styles.cardTitle}>Recommendations</Text>
            
            <View style={styles.recommendation}>
              <Text style={styles.recommendationIcon}>🚲</Text>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>Try cycling to work</Text>
                <Text style={styles.recommendationDesc}>Could save 2.1 kg CO₂ per day</Text>
              </View>
            </View>
            
            <View style={styles.recommendation}>
              <Text style={styles.recommendationIcon}>💡</Text>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>Switch to LED bulbs</Text>
                <Text style={styles.recommendationDesc}>Reduce energy consumption by 80%</Text>
              </View>
            </View>
            
            <View style={styles.recommendation}>
              <Text style={styles.recommendationIcon}>🥗</Text>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>Eat more plant-based meals</Text>
                <Text style={styles.recommendationDesc}>Lower food-related emissions</Text>
              </View>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 15,
  },
  mainValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  mainLabel: {
    fontSize: 16,
    color: '#666666',
  },
  goalComparison: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
  },
  goalText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 5,
  },
  goalStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  breakdownCard: {
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
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  breakdownIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  breakdownText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  recommendationsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recommendationIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  recommendationDesc: {
    fontSize: 14,
    color: '#666666',
  },
});

export default CarbonReportScreen;