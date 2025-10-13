import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/contexts/ThemeContext';
import AITips from '../../components/AITips';
import Articles from '../../components/Articles';
import Community from '../../components/Community';
import Challenges from '../../components/Challenges';

export default function MotivationScreen() {
  const [activeTab, setActiveTab] = useState('tips');
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useAppTheme();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderContent = () => {
    console.log('[Motivation] Rendering content for tab:', activeTab);
    switch (activeTab) {
      case 'tips':
        return <AITips onRefresh={onRefresh} refreshing={refreshing} />;
      case 'challenges':
        return <Challenges onRefresh={onRefresh} refreshing={refreshing} />;
      case 'articles':
        return <Articles onRefresh={onRefresh} refreshing={refreshing} />;
      case 'community':
        return <Community onRefresh={onRefresh} refreshing={refreshing} />;
      default:
        return <AITips onRefresh={onRefresh} refreshing={refreshing} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Motivation Hub ⭐</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Welcome back, Eco Warrior!</Text>
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
        {[
          { key: 'tips', label: 'AI Tips', icon: '🤖' },
          { key: 'challenges', label: 'Challenges', icon: '🎯' },
          { key: 'articles', label: 'Articles', icon: '📚' },
          { key: 'community', label: 'Community', icon: '👥' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabItem, 
              { backgroundColor: activeTab === tab.key ? theme.primary : 'transparent' }
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel, 
              { color: activeTab === tab.key ? '#fff' : theme.textSecondary }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeTab: {
    // backgroundColor will be handled by theme
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabLabel: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  impactText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  metaText: {
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  impactBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  impactBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  shareButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
