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
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { habitAPI, Category } from '../services/habitAPI';

const screenWidth = Dimensions.get('window').width;

// Calculate safe chart width to prevent overflow
const getChartWidth = () => {
  const padding = 64; // Total horizontal padding (container + wrapper)
  return Math.max(280, screenWidth - padding); // Minimum 280px width
};

// Calculate pie chart width for perfect centering
const getPieChartWidth = () => {
  const padding = 32; // Minimal padding for pie chart
  return Math.max(300, screenWidth - padding); // Slightly wider for pie chart
};

// Chart configuration
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(33, 33, 33, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726',
  },
  formatYLabel: (yValue: string) => {
    const value = parseFloat(yValue);
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    } else if (value >= 100) {
      return Math.round(value).toString();
    } else if (value >= 10) {
      return value.toFixed(1);
    } else {
      return value.toFixed(2);
    }
  },
  // Remove formatXLabel to let the chart handle it naturally
  propsForLabels: {
    fontSize: 10, // Smaller font for mobile
    fontWeight: '500',
  },
};

// Helper function to process pie chart data
const processPieChartData = (pieChartData: any[]) => {
  if (!pieChartData || pieChartData.length === 0) {
    return [];
  }
  
  return pieChartData.map((item, index) => ({
    name: item.name,
    population: item.value,
    color: item.color || generateColor(index),
    legendFontColor: '#666',
    legendFontSize: 12,
  }));
};

// Helper function to generate colors
const generateColor = (index: number) => {
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
  return colors[index % colors.length];
};

// Helper function to process bar chart data  
const processBarChartData = (barChartData: any[]) => {
  if (!barChartData || barChartData.length === 0) {
    return {
      labels: ['No Data'],
      datasets: [{ data: [0] }],
    };
  }

  // Helper function to format time labels for mobile
  const formatTimeLabel = (hour: string) => {
    if (!hour) return '';
    const hourNum = parseInt(hour);
    // For mobile, show only key hours to avoid crowding
    if (hourNum === 0) return '12AM';
    if (hourNum === 6) return '6AM';
    if (hourNum === 12) return '12PM';
    if (hourNum === 18) return '6PM';
    return ''; // Hide other hours for cleaner mobile view
  };

  // Helper function to format date labels
  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return 'Today';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // If data has hours, show simplified hourly breakdown for mobile
  if (barChartData[0]?.hour !== undefined) {
    // Group data into 4-hour blocks for better mobile display
    const groupedData = [];
    const groupedLabels = [];
    
    for (let i = 0; i < 24; i += 4) {
      const blockData = barChartData.filter(item => {
        const hour = parseInt(item.hour || '0');
        return hour >= i && hour < i + 4;
      });
      
      const totalCO2 = blockData.reduce((sum, item) => sum + (item.co2 || 0), 0);
      const avgCO2 = blockData.length > 0 ? totalCO2 / blockData.length : 0;
      
      let label = '';
      if (i === 0) label = 'Night';
      else if (i === 4) label = 'Morning';
      else if (i === 8) label = 'Day';
      else if (i === 12) label = 'Afternoon';
      else if (i === 16) label = 'Eve';
      else if (i === 20) label = 'Late Night';
      
      groupedLabels.push(label);
      groupedData.push(Math.max(0.01, avgCO2));
    }
    
    return {
      labels: groupedLabels,
      datasets: [{
        data: groupedData,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      }],
    };
  }
  
  // For daily data, limit to recent days for mobile
  const recentData = barChartData.slice(-7); // Show only last 7 days
  
  return {
    labels: recentData.map(item => formatDateLabel(item.date)),
    datasets: [{
      data: recentData.map(item => Math.max(0.01, item.co2 || 0)),
      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    }],
  };
};

interface HistoryTabProps {
  userId: string;
}

interface FilteredData {
  habitLogs: any[];
  totalCO2: number;
  activityCount: number;
  pieChartData: Array<{
    name: string;
    value: number;
    color: string;
    icon: string;
  }>;
  barChartData: Array<{
    date?: string;
    hour?: string;
    co2: number;
  }>;
  selectedDate: string | null;
  selectedCategory: string;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ userId }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredData, setFilteredData] = useState<FilteredData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  useEffect(() => {
    loadCategories();
    loadFilteredData();
  }, []);

  useEffect(() => {
    loadFilteredData();
  }, [selectedDate, selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await habitAPI.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadFilteredData = async () => {
    try {
      setLoading(true);
      const filters = {
        date: selectedDate,
        categoryId: selectedCategory
      };
      
      const response = await habitAPI.getFilteredHabitLogs(userId, filters);
      if (response.success && response.data) {
        setFilteredData(response.data);
      }
    } catch (error) {
      console.error('Error loading filtered data:', error);
      Alert.alert('Error', 'Failed to load history data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFilteredData();
    setRefreshing(false);
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    dates.push({
      value: today.toISOString().split('T')[0],
      label: 'Today',
      isSpecial: true
    });
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    dates.push({
      value: yesterday.toISOString().split('T')[0],
      label: 'Yesterday',
      isSpecial: true
    });
    
    dates.push({
      value: 'picker',
      label: 'Pick Date',
      isSpecial: true,
      icon: 'calendar'
    });
    
    return dates;
  };

  const handleDatePickerConfirm = () => {
    const dateString = tempDate.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setShowDatePicker(false);
  };

  const formatSelectedDate = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    if (dateString === today) return 'Today';
    if (dateString === yesterdayString) return 'Yesterday';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCO2 = (value: number) => {
    return value < 10 ? value.toFixed(1) : Math.round(value);
  };

  const getCO2Color = (value: number) => {
    if (value < 2) return '#4CAF50';
    if (value < 5) return '#FF9800';
    return '#F44336';
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Date: {formatSelectedDate(selectedDate)}</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.dateScroll}
        >
          {generateDateOptions().map((option) => {
            const isSelected = option.value === 'picker' ? false : selectedDate === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dateChip,
                  isSelected && styles.selectedDateChip,
                  option.value === 'picker' && styles.datePickerChip
                ]}
                onPress={() => {
                  if (option.value === 'picker') {
                    setTempDate(new Date(selectedDate));
                    setShowDatePicker(true);
                  } else {
                    setSelectedDate(option.value);
                  }
                }}
              >
                <Text style={[
                  styles.dateChipText,
                  isSelected && styles.selectedDateChipText,
                  option.value === 'picker' && styles.datePickerChipText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter by Category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === 'all' && styles.selectedCategoryChip
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={styles.categoryIcon}>All</Text>
          </TouchableOpacity>
          
          {categories.map((category) => (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.categoryChip,
                selectedCategory === category._id && styles.selectedCategoryChip
              ]}
              onPress={() => setSelectedCategory(category._id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category._id && styles.selectedCategoryChipText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredData && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{filteredData.activityCount}</Text>
            <Text style={styles.summaryLabel}>Activities</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: getCO2Color(filteredData.totalCO2) }]}>
              {formatCO2(filteredData.totalCO2)} kg
            </Text>
            <Text style={styles.summaryLabel}>Total CO2</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {filteredData.activityCount > 0 ? formatCO2(filteredData.totalCO2 / filteredData.activityCount) : 0} kg
            </Text>
            <Text style={styles.summaryLabel}>Avg per Activity</Text>
          </View>
        </View>
      )}

      {/* Charts Section */}
      {filteredData && (
        <View style={styles.chartsSection}>
          {/* Pie Chart - Category Breakdown */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>
              📊 CO₂ by Category - {formatSelectedDate(selectedDate)}
            </Text>
            {filteredData.pieChartData && filteredData.pieChartData.length > 0 ? (
              <View style={styles.pieChartWrapper}>
                <View style={styles.pieChartContainer}>
                  <PieChart
                    data={processPieChartData(filteredData.pieChartData)}
                    width={screenWidth - 64}
                    height={200}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="-80"
                    center={[(screenWidth - 80) / 2, 5]}
                    absolute
                    hasLegend={false}
                  />
                </View>
                {/* Custom Legend */}
                <View style={styles.legendContainer}>
                  {filteredData.pieChartData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color || generateColor(index) }]} />
                      <Text style={styles.legendText}>
                        {item.icon} {item.name}: {item.value.toFixed(1)} kg
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataIcon}>📊</Text>
                <Text style={styles.noDataText}>No category data for this date</Text>
                <Text style={styles.noDataSubtext}>Try selecting a different date or add some activities</Text>
                <TouchableOpacity 
                  style={styles.addActivityHint}
                  onPress={() => Alert.alert('Tip', 'Add activities in the main tab to see them in your history!')}
                >
                  <Text style={styles.addActivityHintText}>💡 Tap for tip</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Bar Chart - Daily CO2 */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>
              📈 CO₂ Emissions - {formatSelectedDate(selectedDate)}
            </Text>
            <Text style={styles.chartSubtitle}>
              {filteredData.barChartData[0]?.hour !== undefined 
                ? "" 
                : "Daily emissions overview"}
            </Text>
            {filteredData.barChartData && filteredData.barChartData.length > 0 ? (
              <View style={styles.chartWrapper}>
                <BarChart
                  data={processBarChartData(filteredData.barChartData)}
                  width={getChartWidth()} // Use safe width calculation
                  height={260} // Slightly smaller height
                  yAxisLabel=""
                  yAxisSuffix="kg"
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    strokeWidth: 2,
                    barPercentage: 0.7, // Slightly thinner bars
                    fillShadowGradient: '#4CAF50',
                    fillShadowGradientOpacity: 0.8,
                    propsForLabels: {
                      fontSize: 11,
                      fontWeight: '600',
                    },
                  }}
                  verticalLabelRotation={0}
                  horizontalLabelRotation={0}
                  showValuesOnTopOfBars={true}
                  showBarTops={true}
                  fromZero={true}
                  segments={4}
                  style={styles.chartStyle}
                  withInnerLines={false} // Remove inner grid lines to reduce clutter
                />
                {/* Chart Scale Info */}
                <View style={styles.scaleInfo}>
                  <Text style={styles.scaleInfoText}>
                    📊 CO₂ emissions in kg • Grouped for mobile view
                  </Text>
                </View>
                {/* Add performance indicator */}
                <View style={styles.performanceIndicator}>
                  <Text style={styles.performanceText}>
                    {filteredData.totalCO2 < 5 
                      ? '🟢 Great! Low carbon footprint' 
                      : filteredData.totalCO2 < 10 
                      ? '🟡 Moderate carbon footprint' 
                      : '🔴 High carbon footprint - consider eco-friendly alternatives'
                    }
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataIcon}>📈</Text>
                <Text style={styles.noDataText}>No activity data for this date</Text>
                <Text style={styles.noDataSubtext}>Activities you add will appear here</Text>
                <TouchableOpacity 
                  style={styles.addActivityHint}
                  onPress={() => Alert.alert('Get Started', 'Track your daily activities to see your CO₂ impact!')}
                >
                  <Text style={styles.addActivityHintText}>🚀 Start tracking</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Enhanced Summary for Charts */}
      {filteredData && filteredData.activityCount > 0 && (
        <View style={styles.chartSummaryContainer}>
          <Text style={styles.chartSummaryTitle}>📋 Daily Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowText}>
              🎯 Activities: <Text style={styles.summaryRowValue}>{filteredData.activityCount}</Text>
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowText}>
              🌱 Total CO₂: <Text style={[styles.summaryRowValue, { color: getCO2Color(filteredData.totalCO2) }]}>
                {formatCO2(filteredData.totalCO2)} kg
              </Text>
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowText}>
              ⚖️ Average: <Text style={styles.summaryRowValue}>
                {formatCO2(filteredData.totalCO2 / filteredData.activityCount)} kg per activity
              </Text>
            </Text>
          </View>
        </View>
      )}

      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateDisplayText}>
                {tempDate.toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.quickDateOptions}>
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => setTempDate(new Date())}
              >
                <Text style={styles.quickDateButtonText}>Today</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  setTempDate(yesterday);
                }}
              >
                <Text style={styles.quickDateButtonText}>Yesterday</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickDateButton}
                onPress={() => {
                  const lastWeek = new Date();
                  lastWeek.setDate(lastWeek.getDate() - 7);
                  setTempDate(lastWeek);
                }}
              >
                <Text style={styles.quickDateButtonText}>Last Week</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateAdjustment}>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => {
                  const newDate = new Date(tempDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setTempDate(newDate);
                }}
              >
                <Text style={styles.adjustButtonText}>Previous Day</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => {
                  const newDate = new Date(tempDate);
                  newDate.setDate(newDate.getDate() + 1);
                  if (newDate <= new Date()) {
                    setTempDate(newDate);
                  }
                }}
              >
                <Text style={styles.adjustButtonText}>Next Day</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDatePickerConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  filterSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  dateScroll: {
    flexDirection: 'row',
  },
  dateChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDateChip: {
    backgroundColor: '#212121',
    borderColor: '#212121',
  },
  datePickerChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  dateChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedDateChipText: {
    color: '#FFFFFF',
  },
  datePickerChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCategoryChip: {
    backgroundColor: '#212121',
    borderColor: '#212121',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden', // Prevent content overflow
    alignItems: 'center', // Center all chart content
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' },
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
    marginBottom: 8,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateInputContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  dateDisplayText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  quickDateOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickDateButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  quickDateButtonText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
    textAlign: 'center',
  },
  dateAdjustment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  adjustButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  adjustButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  confirmButton: {
    backgroundColor: '#212121',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  // New chart styles
  chartsSection: {
    paddingBottom: 16,
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 16, // Ensure proper spacing from edges
    overflow: 'hidden', // Prevent chart overflow
  },
  pieChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    paddingHorizontal: 0, // No horizontal padding for pie chart
    width: '100%',
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  chartSummaryContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  chartSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  summaryRow: {
    marginBottom: 8,
  },
  summaryRowText: {
    fontSize: 16,
    color: '#666',
  },
  summaryRowValue: {
    fontWeight: 'bold',
    color: '#212121',
  },
  // Legend styles
  legendContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 12,
    maxWidth: '90%',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  // Chart interaction styles
  chartStyle: {
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 0, // Remove horizontal margin to prevent overflow
  },
  performanceIndicator: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  performanceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    textAlign: 'center',
  },
  // Scale info styles
  scaleInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  scaleInfoText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  // Missing style for activity hint
  noDataIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  addActivityHint: {
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
  },
  addActivityHintText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
});

export default HistoryTab;
