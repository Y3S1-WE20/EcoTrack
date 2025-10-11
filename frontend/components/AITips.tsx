import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getMotivationalQuotes, generateNewQuote, testMotivationHealth, Quote } from '../services/motivationAPI';

interface AITipsProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function AITips({ onRefresh, refreshing = false }: AITipsProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadQuotes();
    // Also test health endpoint
    testHealth();
  }, []);

  const testHealth = async () => {
    try {
      console.log('[AITips] Testing motivation API health...');
      const healthResponse = await testMotivationHealth();
      console.log('[AITips] Health check result:', healthResponse);
    } catch (error) {
      console.error('[AITips] Health check failed:', error);
    }
  };

  const loadQuotes = async () => {
    try {
      setLoading(true);
      console.log('[AITips] Loading motivational quotes...');
      const response = await getMotivationalQuotes();
      console.log('[AITips] Quotes response:', response);
      if (response.success) {
        setQuotes(response.quotes);
      } else {
        console.warn('[AITips] Quotes API returned success=false');
        // Still try to show fallback quotes
        setQuotes([]);
      }
    } catch (error) {
      console.error('[AITips] Error loading quotes:', error);
      // Don't show alert immediately, let user try refresh
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewQuote = async () => {
    try {
      setGenerating(true);
      console.log('[AITips] Generating new quote...');
      const response = await generateNewQuote();
      console.log('[AITips] Generate quote response:', response);
      if (response.success) {
        const newQuote: Quote = {
          id: Date.now(),
          text: response.quote,
          author: 'EcoTrack AI',
          category: 'AI Generated',
          createdAt: response.timestamp || new Date().toISOString()
        };
        setQuotes([newQuote, ...quotes.slice(0, 4)]); // Keep only 5 quotes
        Alert.alert('Success', 'New motivational quote generated!');
      } else {
        Alert.alert('Info', 'Quote generation is temporarily unavailable. Please try again later.');
      }
    } catch (error) {
      console.error('[AITips] Error generating quote:', error);
      Alert.alert('Info', 'Quote generation is temporarily unavailable. Please try the refresh button.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRefresh = async () => {
    await loadQuotes();
    if (onRefresh) onRefresh();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading AI tips...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.section}>
        <View style={styles.headerSection}>
          <Text style={styles.sectionTitle}>🤖 AI-Powered Motivation</Text>
          <Text style={styles.sectionSubtitle}>
            Personalized inspiration for your eco-journey
          </Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateNewQuote}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.generateButtonText}>✨ Generate New Quote</Text>
            )}
          </TouchableOpacity>
        </View>

        {quotes.map((quote, index) => (
          <View key={quote.id} style={[styles.quoteCard, index === 0 && styles.featuredQuote]}>
            <Text style={styles.quoteIcon}>💡</Text>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <View style={styles.quoteFooter}>
              <Text style={styles.quoteAuthor}>— {quote.author}</Text>
              <Text style={styles.quoteCategory}>{quote.category}</Text>
            </View>
            {index === 0 && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>✨ Latest</Text>
              </View>
            )}
          </View>
        ))}

        {/* AI Tips Cards */}
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
            <Text style={styles.actionButtonText}>Apply This Tip</Text>
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
            <Text style={styles.actionButtonText}>Start Challenge</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💧</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Water Conservation Hack</Text>
              <Text style={styles.impactText}>Save 2,000L water/month</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            Install low-flow showerheads and fix leaky taps. Small changes
            can lead to significant water savings over time.
          </Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 20,
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
  generateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  featuredQuote: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  quoteIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 16,
    color: '#212121',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  quoteCategory: {
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
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
  impactText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});