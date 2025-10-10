import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface SustainabilityTip {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  icon: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  readTime: string;
  icon: string;
  url: string;
}

const LearnSustainabilityScreen = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', icon: '🌍' },
    { id: 'energy', name: 'Energy', icon: '⚡' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'food', name: 'Food', icon: '🍽️' },
    { id: 'waste', name: 'Waste', icon: '♻️' },
    { id: 'water', name: 'Water', icon: '💧' },
  ];

  const sustainabilityTips: SustainabilityTip[] = [
    {
      id: '1',
      category: 'energy',
      title: 'Switch to LED Bulbs',
      description: 'Replace traditional incandescent bulbs with LED bulbs. They use 75% less energy and last 25 times longer.',
      impact: 'Save 80kg CO₂/year',
      difficulty: 'Easy',
      icon: '💡',
    },
    {
      id: '2',
      category: 'transport',
      title: 'Walk or Bike for Short Trips',
      description: 'For trips under 2 miles, consider walking or biking instead of driving. It\'s healthier and emission-free.',
      impact: 'Save 1.2kg CO₂/trip',
      difficulty: 'Easy',
      icon: '🚲',
    },
    {
      id: '3',
      category: 'food',
      title: 'Reduce Meat Consumption',
      description: 'Try "Meatless Monday" or reduce meat intake by one day per week. Livestock farming produces significant emissions.',
      impact: 'Save 310kg CO₂/year',
      difficulty: 'Medium',
      icon: '🥗',
    },
    {
      id: '4',
      category: 'waste',
      title: 'Compost Organic Waste',
      description: 'Start composting kitchen scraps and yard waste. This reduces methane emissions from landfills.',
      impact: 'Save 180kg CO₂/year',
      difficulty: 'Medium',
      icon: '🌱',
    },
    {
      id: '5',
      category: 'energy',
      title: 'Unplug Electronics When Not in Use',
      description: 'Many devices consume power even when turned off. Unplug chargers, TVs, and computers when not in use.',
      impact: 'Save 100kg CO₂/year',
      difficulty: 'Easy',
      icon: '🔌',
    },
    {
      id: '6',
      category: 'water',
      title: 'Fix Water Leaks Promptly',
      description: 'A single dripping faucet can waste over 3,000 gallons of water per year. Fix leaks immediately.',
      impact: 'Save 15kg CO₂/year',
      difficulty: 'Easy',
      icon: '🔧',
    },
    {
      id: '7',
      category: 'transport',
      title: 'Use Public Transportation',
      description: 'Taking public transit instead of driving alone can significantly reduce your carbon footprint.',
      impact: 'Save 2.3kg CO₂/trip',
      difficulty: 'Easy',
      icon: '🚌',
    },
    {
      id: '8',
      category: 'energy',
      title: 'Install a Programmable Thermostat',
      description: 'Automatically adjust heating and cooling when you\'re away. Can reduce energy use by 10-20%.',
      impact: 'Save 450kg CO₂/year',
      difficulty: 'Medium',
      icon: '🌡️',
    },
  ];

  const articles: Article[] = [
    {
      id: '1',
      title: 'Climate Change: What You Need to Know',
      summary: 'Understanding the science behind climate change and how human activities contribute to global warming.',
      readTime: '8 min read',
      icon: '🌡️',
      url: 'https://climate.nasa.gov/evidence/',
    },
    {
      id: '2',
      title: 'The Power of Renewable Energy',
      summary: 'How solar, wind, and other renewable energy sources are transforming our energy landscape.',
      readTime: '6 min read',
      icon: '☀️',
      url: 'https://www.energy.gov/eere/renewable-energy',
    },
    {
      id: '3',
      title: 'Sustainable Food Systems',
      summary: 'Exploring how our food choices impact the environment and what we can do to eat more sustainably.',
      readTime: '10 min read',
      icon: '🌾',
      url: 'https://www.fao.org/sustainability/en/',
    },
    {
      id: '4',
      title: 'The Circular Economy Explained',
      summary: 'Moving beyond the traditional take-make-waste model to create a regenerative economic system.',
      readTime: '7 min read',
      icon: '♻️',
      url: 'https://ellenmacarthurfoundation.org/topics/circular-economy-introduction/overview',
    },
  ];

  const goBack = () => {
    router.back();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#22c55e';
      case 'Medium':
        return '#f59e0b';
      case 'Hard':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const filteredTips = activeCategory === 'all' 
    ? sustainabilityTips 
    : sustainabilityTips.filter(tip => tip.category === activeCategory);

  const openArticle = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Learn Sustainability</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Introduction */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>🌱 Build Sustainable Habits</Text>
          <Text style={styles.introText}>
            Small actions can make a big difference. Discover practical tips and learn about sustainability to reduce your environmental impact and create a greener future.
          </Text>
        </View>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  activeCategory === category.id && styles.activeCategoryButton,
                ]}
                onPress={() => setActiveCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  activeCategory === category.id && styles.activeCategoryText,
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sustainability Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sustainability Tips</Text>
          
          {filteredTips.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <Text style={styles.tipIcon}>{tip.icon}</Text>
                <View style={styles.tipInfo}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <View style={styles.tipMeta}>
                    <View style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(tip.difficulty) }
                    ]}>
                      <Text style={styles.difficultyText}>{tip.difficulty}</Text>
                    </View>
                    <Text style={styles.impactText}>{tip.impact}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          ))}
        </View>

        {/* Educational Articles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Educational Articles</Text>
          
          {articles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              onPress={() => openArticle(article.url)}
            >
              <View style={styles.articleHeader}>
                <Text style={styles.articleIcon}>{article.icon}</Text>
                <View style={styles.articleInfo}>
                  <Text style={styles.articleTitle}>{article.title}</Text>
                  <Text style={styles.articleReadTime}>{article.readTime}</Text>
                </View>
                <Text style={styles.externalIcon}>↗</Text>
              </View>
              <Text style={styles.articleSummary}>{article.summary}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Call */}
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Ready to Take Action? 🚀</Text>
          <Text style={styles.actionText}>
            Start by implementing one or two easy tips from above. Track your progress in the EcoTrack app and see how your small changes add up to make a big impact!
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/habits')}
          >
            <Text style={styles.actionButtonText}>Start Tracking Habits</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  introCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeCategoryButton: {
    backgroundColor: '#4CAF50',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
  },
  tipCard: {
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
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  tipInfo: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  tipMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  impactText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  tipDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  articleCard: {
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
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  articleIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  articleReadTime: {
    fontSize: 14,
    color: '#666',
  },
  externalIcon: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  articleSummary: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  actionText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default LearnSustainabilityScreen;