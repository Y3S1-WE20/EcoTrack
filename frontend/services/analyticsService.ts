export interface DailyMetrics {
  date: string;
  co2Saved: number;
  activitiesCount: number;
  categories: Record<string, number>;
}

export interface WeeklyInsight {
  type: 'improvement' | 'streak' | 'category' | 'goal';
  title: string;
  description: string;
  icon: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CategoryTrend {
  category: string;
  icon: string;
  thisWeek: number;
  lastWeek: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export class AnalyticsService {
  static calculateWeeklyTrends(dailyMetrics: DailyMetrics[]): CategoryTrend[] {
    const trends: CategoryTrend[] = [];
    const categoryIcons = {
      Transport: '🚌',
      Food: '🍽️',
      Energy: '⚡',
      Waste: '♻️',
      Consumption: '🛒',
    };

    // Group by weeks
    const thisWeek = dailyMetrics.slice(0, 7);
    const lastWeek = dailyMetrics.slice(7, 14);

    const thisWeekTotals = this.aggregateByCategory(thisWeek);
    const lastWeekTotals = this.aggregateByCategory(lastWeek);

    Object.keys(thisWeekTotals).forEach(category => {
      const thisWeekValue = thisWeekTotals[category] || 0;
      const lastWeekValue = lastWeekTotals[category] || 0;
      const change = thisWeekValue - lastWeekValue;
      const changePercent = lastWeekValue > 0 ? (change / lastWeekValue) * 100 : 0;

      trends.push({
        category,
        icon: categoryIcons[category as keyof typeof categoryIcons] || '🌱',
        thisWeek: thisWeekValue,
        lastWeek: lastWeekValue,
        change: changePercent,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      });
    });

    return trends.sort((a, b) => b.thisWeek - a.thisWeek);
  }

  static generateWeeklyInsights(dailyMetrics: DailyMetrics[]): WeeklyInsight[] {
    const insights: WeeklyInsight[] = [];
    
    if (dailyMetrics.length === 0) return insights;

    // Calculate streak
    const streak = this.calculateStreak(dailyMetrics);
    if (streak > 0) {
      insights.push({
        type: 'streak',
        title: 'Daily Streak',
        description: `You've been consistent for ${streak} days! Keep it up!`,
        icon: '🔥',
        value: streak,
        trend: 'up',
      });
    }

    // Best performing category
    const categoryTotals = this.aggregateByCategory(dailyMetrics.slice(0, 7));
    const bestCategory = Object.entries(categoryTotals).reduce((a, b) => 
      categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b
    );
    
    if (bestCategory && bestCategory[1] > 0) {
      insights.push({
        type: 'category',
        title: 'Top Category',
        description: `${bestCategory[0]} is your strongest area this week`,
        icon: this.getCategoryIcon(bestCategory[0]),
        value: bestCategory[1],
        trend: 'up',
      });
    }

    // Weekly improvement
    const thisWeekTotal = dailyMetrics.slice(0, 7).reduce((sum, day) => sum + day.co2Saved, 0);
    const lastWeekTotal = dailyMetrics.slice(7, 14).reduce((sum, day) => sum + day.co2Saved, 0);
    
    if (thisWeekTotal > lastWeekTotal) {
      const improvement = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
      insights.push({
        type: 'improvement',
        title: 'Weekly Progress',
        description: `You've improved by ${improvement.toFixed(1)}% from last week!`,
        icon: '📈',
        value: improvement,
        trend: 'up',
      });
    }

    // Goal progress
    const weeklyGoal = 50; // kg CO2 per week
    const goalProgress = (thisWeekTotal / weeklyGoal) * 100;
    
    insights.push({
      type: 'goal',
      title: 'Goal Progress',
      description: `${goalProgress.toFixed(1)}% of your weekly goal achieved`,
      icon: goalProgress >= 100 ? '🎯' : '⭕',
      value: goalProgress,
      trend: goalProgress >= 100 ? 'up' : 'stable',
    });

    return insights;
  }

  static getMonthlyReport(dailyMetrics: DailyMetrics[]) {
    const monthData = dailyMetrics.slice(0, 30);
    const totalCo2 = monthData.reduce((sum, day) => sum + day.co2Saved, 0);
    const totalActivities = monthData.reduce((sum, day) => sum + day.activitiesCount, 0);
    const avgDaily = totalCo2 / Math.min(30, monthData.length);

    const categoryBreakdown = this.aggregateByCategory(monthData);
    const mostActive = Object.entries(categoryBreakdown).reduce((a, b) => 
      categoryBreakdown[a[0]] > categoryBreakdown[b[0]] ? a : b
    );

    return {
      totalCo2Saved: totalCo2,
      totalActivities,
      averageDaily: avgDaily,
      mostActiveCategory: mostActive[0],
      categoryBreakdown,
      daysActive: monthData.filter(day => day.activitiesCount > 0).length,
      consistency: (monthData.filter(day => day.activitiesCount > 0).length / monthData.length) * 100,
    };
  }

  static getRecommendations(dailyMetrics: DailyMetrics[]): Array<{
    title: string;
    description: string;
    icon: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const recommendations = [];
    const categoryTotals = this.aggregateByCategory(dailyMetrics.slice(0, 7));
    
    // Find categories with low activity
    const allCategories = ['Transport', 'Food', 'Energy', 'Waste', 'Consumption'];
    const lowActivity = allCategories.filter(cat => (categoryTotals[cat] || 0) < 5);

    lowActivity.forEach(category => {
      const suggestions = {
        Transport: {
          title: 'Try Public Transport',
          description: 'Taking the bus or train can save significant CO₂',
          icon: '🚌',
        },
        Food: {
          title: 'Plant-Based Meals',
          description: 'Try one plant-based meal today',
          icon: '🥗',
        },
        Energy: {
          title: 'Energy Efficiency',
          description: 'Switch to LED bulbs or unplug devices',
          icon: '💡',
        },
        Waste: {
          title: 'Reduce Waste',
          description: 'Start composting or using reusable bags',
          icon: '♻️',
        },
        Consumption: {
          title: 'Mindful Shopping',
          description: 'Choose sustainable products or buy less',
          icon: '🛒',
        },
      };

      if (suggestions[category as keyof typeof suggestions]) {
        const suggestion = suggestions[category as keyof typeof suggestions];
        recommendations.push({
          ...suggestion,
          category,
          priority: 'medium' as const,
        });
      }
    });

    return recommendations.slice(0, 3); // Return top 3 recommendations
  }

  private static aggregateByCategory(dailyMetrics: DailyMetrics[]): Record<string, number> {
    const totals: Record<string, number> = {};
    
    dailyMetrics.forEach(day => {
      Object.entries(day.categories).forEach(([category, value]) => {
        totals[category] = (totals[category] || 0) + value;
      });
    });

    return totals;
  }

  private static calculateStreak(dailyMetrics: DailyMetrics[]): number {
    let streak = 0;
    for (const day of dailyMetrics) {
      if (day.activitiesCount > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  private static getCategoryIcon(category: string): string {
    const icons = {
      Transport: '🚌',
      Food: '🍽️',
      Energy: '⚡',
      Waste: '♻️',
      Consumption: '🛒',
    };
    return icons[category as keyof typeof icons] || '🌱';
  }
}

// Mock data generator for testing
export const generateMockAnalytics = (): DailyMetrics[] => {
  const data: DailyMetrics[] = [];
  const categories = ['Transport', 'Food', 'Energy', 'Waste', 'Consumption'];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const categoriesData: Record<string, number> = {};
    categories.forEach(cat => {
      categoriesData[cat] = Math.random() * 5; // 0-5 kg CO2 per category per day
    });

    const totalCo2 = Object.values(categoriesData).reduce((sum, val) => sum + val, 0);
    
    data.push({
      date: date.toISOString().split('T')[0],
      co2Saved: totalCo2,
      activitiesCount: Math.floor(Math.random() * 8) + 1, // 1-8 activities per day
      categories: categoriesData,
    });
  }
  
  return data;
};