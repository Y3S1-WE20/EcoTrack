import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import { habitAPI } from '../services/habitAPI';

interface HistoryTabProps {
  userId: string;
}

interface StatsData {
  weeklyData?: any;
  monthlyData?: any;
  dailyStats?: any[];
  weeklyBreakdown?: any[];
  period?: {
    start: Date;
    end: Date;
  };
}

const HistoryTab: React.FC<HistoryTabProps> = ({ userId }) => {
  const [viewPeriod, setViewPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStatsData();
  }, [viewPeriod]);

  const loadStatsData = async () => {
    try {
      setLoading(true);
      let response;
      
      if (viewPeriod === 'weekly') {
        response = await habitAPI.getWeeklyStats(userId);
      } else {
        response = await habitAPI.getMonthlyStats(userId);
      }

      if (response.success && response.data) {
        setStatsData(response.data);
      } else {
        console.warn('Stats API not available, using fallback data');
        setStatsData({
          weeklyData: { totalCO2: 0, activityCount: 0, categoryStats: [] },
          dailyStats: []
        });
      }
    } catch (error) {
      console.error('Error loading stats data:', error);
      setStatsData({
        weeklyData: { totalCO2: 0, activityCount: 0, categoryStats: [] },
        dailyStats: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStatsData();
    setRefreshing(false);
  };

  const formatCO2 = (value: number) => {
    return Math.abs(value) < 0.1 ? value.toFixed(3) : value.toFixed(1);
  };

  const getCO2Color = (value: number) => {
    if (value < 0) return '#4CAF50'; // Green for negative (carbon reducing)
    if (value < 5) return '#2196F3'; // Blue for low
    if (value < 15) return '#FF9800'; // Orange for medium
    return '#F44336'; // Red for high
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <TouchableOpacity
        style={[styles.periodButton, viewPeriod === 'weekly' && styles.activePeriod]}
        onPress={() => setViewPeriod('weekly')}
      >
        <Text style={[styles.periodText, viewPeriod === 'weekly' && styles.activePeriodText]}>
          Weekly
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.periodButton, viewPeriod === 'monthly' && styles.activePeriod]}
        onPress={() => setViewPeriod('monthly')}
      >
        <Text style={[styles.periodText, viewPeriod === 'monthly' && styles.activePeriodText]}>
          Monthly
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCumulativeStats = () => {
    const data = viewPeriod === 'weekly' ? statsData?.weeklyData : statsData?.monthlyData;
    if (!data) return null;

    const totalCO2 = data.totalCO2 || 0;
    const activityCount = data.activityCount || 0;
    const avgDaily = viewPeriod === 'weekly' ? totalCO2 / 7 : totalCO2 / 30;

    return (
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total CO₂</Text>
          <Text style={[styles.statValue, { color: getCO2Color(totalCO2) }]}>
            {formatCO2(totalCO2)} kg
          </Text>
          <Text style={styles.statSubtext}>
            {viewPeriod === 'weekly' ? 'This week' : 'This month'}
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Activities</Text>
          <Text style={styles.statValue}>{activityCount}</Text>
          <Text style={styles.statSubtext}>
            {viewPeriod === 'weekly' ? 'This week' : 'This month'}
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Daily Avg</Text>
          <Text style={[styles.statValue, { color: getCO2Color(avgDaily) }]}>
            {formatCO2(avgDaily)} kg
          </Text>
          <Text style={styles.statSubtext}>Per day</Text>
        </View>
      </View>
    );
  };

  const renderTrendChart = () => {
    const dailyStats = statsData?.dailyStats || [];
    if (dailyStats.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            {viewPeriod === 'weekly' ? 'Daily Trends (This Week)' : 'Daily Trends (This Month)'}
          </Text>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No data available</Text>
          </View>
        </View>
      );
    }

    // Simple bar chart representation
    const maxCO2 = Math.max(...dailyStats.map(stat => Math.abs(stat.totalCO2)));
    const chartHeight = 120;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>
          {viewPeriod === 'weekly' ? 'Daily Trends (This Week)' : 'Daily Trends (This Month)'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScrollView}>
          <View style={styles.chartContent}>
            {dailyStats.map((stat, index) => {
              const barHeight = maxCO2 > 0 ? (Math.abs(stat.totalCO2) / maxCO2) * chartHeight : 0;
              const date = new Date(stat._id);
              const dayLabel = date.getDate().toString();
              
              return (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.chartBarContainer}>
                    <View
                      style={[
                        styles.chartBarFill,
                        {
                          height: barHeight,
                          backgroundColor: getCO2Color(stat.totalCO2),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartBarLabel}>{dayLabel}</Text>
                  <Text style={styles.chartBarValue}>{formatCO2(stat.totalCO2)}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderCategoryBreakdown = () => {
    const data = viewPeriod === 'weekly' ? statsData?.weeklyData : statsData?.monthlyData;
    const categoryStats = data?.categoryStats || [];
    
    if (categoryStats.length === 0) {
      return (
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>Category Breakdown</Text>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No category data available</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>Category Breakdown</Text>
        {categoryStats.map((category: any, index: number) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryIcon}>{category.icon || '📊'}</Text>
              <View style={styles.categoryDetails}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.activityCount} activities</Text>
              </View>
            </View>
            <View style={styles.categoryImpact}>
              <Text style={[styles.categoryValue, { color: getCO2Color(category.totalCO2) }]}>
                {formatCO2(category.totalCO2)} kg
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {renderPeriodSelector()}
      {renderCumulativeStats()}
      {renderTrendChart()}
      {renderCategoryBreakdown()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activePeriod: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activePeriodText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 10,
    color: '#999',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  chartScrollView: {
    flexGrow: 0,
  },
  chartContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    gap: 8,
  },
  chartBar: {
    alignItems: 'center',
    width: 40,
  },
  chartBarContainer: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 20,
  },
  chartBarFill: {
    width: 16,
    borderRadius: 2,
    minHeight: 2,
  },
  chartBarLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  chartBarValue: {
    fontSize: 8,
    color: '#999',
    marginTop: 2,
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  categoryImpact: {
    alignItems: 'flex-end',
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default HistoryTab;
