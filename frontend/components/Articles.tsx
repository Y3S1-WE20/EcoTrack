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
  Linking,
} from 'react-native';
import { getFeaturedArticles, Article } from '../services/motivationAPI';

interface ArticlesProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function Articles({ onRefresh, refreshing = false }: ArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      console.log('[Articles] Loading articles...');
      const response = await getFeaturedArticles();
      console.log('[Articles] Articles response:', response);
      if (response.success) {
        setArticles(response.articles);
      } else {
        console.warn('[Articles] Articles API returned success=false');
        setArticles([]);
      }
    } catch (error) {
      console.error('[Articles] Error loading articles:', error);
      setArticles([]); // Show empty state instead of immediate error
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadArticles();
    if (onRefresh) onRefresh();
  };

  const openArticle = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this article link');
      }
    } catch (error) {
      console.error('Error opening article:', error);
      Alert.alert('Error', 'Failed to open article');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading articles...</Text>
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
        <Text style={styles.sectionTitle}>📚 Featured Articles</Text>
        <Text style={styles.sectionSubtitle}>
          Latest insights from sustainability experts worldwide
        </Text>

        {articles.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={styles.articleCard}
            onPress={() => openArticle(article.url, article.title)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{article.icon}</Text>
              <View style={styles.cardInfo}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{article.category}</Text>
                </View>
                <Text style={styles.cardTitle}>{article.title}</Text>
                <View style={styles.metaInfo}>
                  <Text style={styles.metaText}>By {article.author}</Text>
                  <Text style={styles.separator}>•</Text>
                  <Text style={styles.metaText}>{article.readTime}</Text>
                  <Text style={styles.separator}>•</Text>
                  <Text style={styles.metaText}>{formatDate(article.publishedAt)}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.cardDescription}>{article.description}</Text>
            
            <View style={styles.cardFooter}>
              <View style={styles.readButton}>
                <Text style={styles.readButtonText}>Read Article</Text>
                <Text style={styles.externalIcon}>🔗</Text>
              </View>
              <Text style={styles.sourceText}>External Link</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Additional promoted articles */}
        <View style={styles.promotedSection}>
          <Text style={styles.promotedTitle}>🌟 Recommended Reading</Text>
          
          <TouchableOpacity
            style={styles.promotedCard}
            onPress={() => openArticle('https://www.ipcc.ch/reports/', 'IPCC Climate Reports')}
          >
            <Text style={styles.promotedIcon}>🌍</Text>
            <View style={styles.promotedInfo}>
              <Text style={styles.promotedCardTitle}>IPCC Climate Change Reports</Text>
              <Text style={styles.promotedDescription}>
                Official scientific assessments on climate change from the world's leading experts
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.promotedCard}
            onPress={() => openArticle('https://www.unep.org/news-and-stories', 'UN Environment News')}
          >
            <Text style={styles.promotedIcon}>🏛️</Text>
            <View style={styles.promotedInfo}>
              <Text style={styles.promotedCardTitle}>UN Environment Programme</Text>
              <Text style={styles.promotedDescription}>
                Latest environmental news and policy updates from the United Nations
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.promotedCard}
            onPress={() => openArticle('https://www.nature.com/subjects/climate-change', 'Nature Climate')}
          >
            <Text style={styles.promotedIcon}>🔬</Text>
            <View style={styles.promotedInfo}>
              <Text style={styles.promotedCardTitle}>Nature Climate Change</Text>
              <Text style={styles.promotedDescription}>
                Peer-reviewed research articles on climate science and solutions
              </Text>
            </View>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  articleCard: {
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
    marginTop: 4,
  },
  cardInfo: {
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    lineHeight: 24,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  },
  separator: {
    fontSize: 13,
    color: '#666',
    marginHorizontal: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  readButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 6,
  },
  externalIcon: {
    fontSize: 14,
  },
  sourceText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  promotedSection: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  promotedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  promotedCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  promotedIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  promotedInfo: {
    flex: 1,
  },
  promotedCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 6,
  },
  promotedDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});