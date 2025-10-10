import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MotivationScreen() {
  const [activeTab, setActiveTab] = useState('tips');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Motivation Hub ⭐</Text>
        <Text style={styles.subtitle}>Welcome back, Eco Warrior!</Text>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'tips', label: 'AI Tips', icon: '🤖' },
          { key: 'challenges', label: 'Challenges', icon: '🎯' },
          { key: 'articles', label: 'Articles', icon: '📚' },
          { key: 'community', label: 'Community', icon: '👥' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'tips' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 AI-Powered Suggestions</Text>
            <Text style={styles.sectionSubtitle}>
              Personalized tips based on your activity patterns
            </Text>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🌡️</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Smart Thermostat Settings</Text>
                  <Text style={styles.impactText}>Save 450kg CO₂/year</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>
                Set your thermostat 2-3°C lower in winter and higher in summer.
                This simple change can reduce your energy consumption by 10-15%.
              </Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Try This Tip</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🚌</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Public Transport Challenge</Text>
                  <Text style={styles.impactText}>Save 6.8kg CO₂/week</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>
                Try using public transport 3 times this week instead of driving.
                You will reduce emissions and might discover new places!
              </Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Try This Tip</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'challenges' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Smart Challenges</Text>
            <Text style={styles.sectionSubtitle}>
              AI-adapted challenges based on your progress
            </Text>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>👟</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Daily Walking Goal</Text>
                  <Text style={styles.progressText}>3/7 days completed</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>
                Walk at least 8,000 steps per day for the next 7 days
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '43%' }]} />
              </View>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Join Challenge</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'articles' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 Featured Articles</Text>
            <Text style={styles.sectionSubtitle}>
              Latest insights from sustainability experts
            </Text>

            <TouchableOpacity style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🔬</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>The Science Behind Carbon Offsetting</Text>
                  <Text style={styles.metaText}>Dr. Sarah Climate • 5 min read</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>
                Understanding how carbon offset programs work and their real-world
                impact on climate change.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'community' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Community Highlights</Text>
            <Text style={styles.sectionSubtitle}>
              Celebrating real impact from our community
            </Text>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🚴‍♂️</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>Alex Green</Text>
                  <Text style={styles.metaText}>San Francisco, CA • 2 days ago</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>
                Completed 30-day bike commute challenge
              </Text>
              <View style={styles.impactBadge}>
                <Text style={styles.impactBadgeText}>Saved 45kg CO₂</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share Your Achievement</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#E8F5E8',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#4CAF50',
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
    color: '#212121',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  card: {
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
    color: '#212121',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  impactText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  metaText: {
    fontSize: 12,
    color: '#999',
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
    backgroundColor: '#4CAF50',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  impactBadgeText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#4CAF50',
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
