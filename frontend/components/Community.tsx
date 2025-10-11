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
  TextInput,
  Modal,
} from 'react-native';
import {
  getCommunityPosts,
  createCommunityPost,
  likeCommunityPost,
  addComment,
  CommunityPost,
} from '../services/motivationAPI';

interface CommunityProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function Community({ onRefresh, refreshing = false }: CommunityProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostAchievement, setNewPostAchievement] = useState('');
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (pageNum = 1, reset = true) => {
    try {
      if (reset) setLoading(true);
      console.log('[Community] Loading posts, page:', pageNum);
      const response = await getCommunityPosts(pageNum, 10);
      console.log('[Community] Posts response:', response);
      if (response.success) {
        if (reset) {
          setPosts(response.posts);
        } else {
          setPosts(prev => [...prev, ...response.posts]);
        }
        setHasMore(response.pagination.hasMore);
        setPage(pageNum);
      } else {
        console.warn('[Community] Posts API returned success=false');
        if (reset) setPosts([]);
      }
    } catch (error) {
      console.error('[Community] Error loading posts:', error);
      if (reset) {
        setPosts([]); // Show empty state instead of error alert
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadPosts(1, true);
    if (onRefresh) onRefresh();
  };

  const loadMorePosts = () => {
    if (hasMore && !loading) {
      loadPosts(page + 1, false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    try {
      setCreating(true);
      const postData = {
        content: newPostContent.trim(),
        achievement: newPostAchievement.trim() || undefined,
        impactData: {
          co2Saved: Math.floor(Math.random() * 50),
          unit: 'kg'
        }
      };

      const response = await createCommunityPost(postData);
      if (response.success) {
        setNewPostContent('');
        setNewPostAchievement('');
        setShowCreatePost(false);
        await loadPosts(1, true);
        Alert.alert('Success', 'Your post has been shared with the community!');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const response = await likeCommunityPost(postId);
      if (response.success) {
        setPosts(prev =>
          prev.map(post =>
            post._id === postId
              ? {
                  ...post,
                  likes: response.hasLiked
                    ? [...post.likes, 'demo-user']
                    : post.likes.filter(id => id !== 'demo-user')
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading community posts...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.section}>
          <View style={styles.headerSection}>
            <Text style={styles.sectionTitle}>👥 Community Forum</Text>
            <Text style={styles.sectionSubtitle}>
              Share your eco-journey and connect with fellow environmental champions
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreatePost(true)}
            >
              <Text style={styles.createButtonText}>✍️ Share Your Story</Text>
            </TouchableOpacity>
          </View>

          {posts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={styles.emptyTitle}>Be the first to share!</Text>
              <Text style={styles.emptyDescription}>
                Start the conversation by sharing your eco-achievements or asking questions
              </Text>
            </View>
          ) : (
            <>
              {posts.map((post) => (
                <View key={post._id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <View style={styles.userInfo}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {post.author.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.userDetails}>
                        <Text style={styles.username}>{post.author}</Text>
                        <Text style={styles.timeAgo}>{formatTimeAgo(post.createdAt)}</Text>
                      </View>
                    </View>
                    {post.achievement && (
                      <View style={styles.achievementBadge}>
                        <Text style={styles.achievementText}>🏆 {post.achievement}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.postContent}>{post.content}</Text>

                  {post.impactData && (
                    <View style={styles.impactSection}>
                      <Text style={styles.impactTitle}>Environmental Impact:</Text>
                      {post.impactData.co2Saved > 0 && (
                        <Text style={styles.impactStat}>
                          🌍 Saved {post.impactData.co2Saved}{post.impactData.unit} CO₂
                        </Text>
                      )}
                      {post.impactData.wasteReduced > 0 && (
                        <Text style={styles.impactStat}>
                          ♻️ Reduced {post.impactData.wasteReduced}{post.impactData.unit} waste
                        </Text>
                      )}
                      {post.impactData.energySaved > 0 && (
                        <Text style={styles.impactStat}>
                          ⚡ Saved {post.impactData.energySaved}{post.impactData.unit} energy
                        </Text>
                      )}
                    </View>
                  )}

                  <View style={styles.postActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleLikePost(post._id)}
                    >
                      <Text style={styles.actionIcon}>
                        {post.likes.includes('demo-user') ? '❤️' : '🤍'}
                      </Text>
                      <Text style={styles.actionText}>{post.likes.length}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionIcon}>💬</Text>
                      <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionIcon}>🔄</Text>
                      <Text style={styles.actionText}>Share</Text>
                    </TouchableOpacity>
                  </View>

                  {post.comments && post.comments.length > 0 && (
                    <View style={styles.commentsSection}>
                      {post.comments.slice(0, 2).map((comment, index) => (
                        <View key={index} style={styles.comment}>
                          <Text style={styles.commentAuthor}>{comment.author}</Text>
                          <Text style={styles.commentContent}>{comment.content}</Text>
                        </View>
                      ))}
                      {post.comments.length > 2 && (
                        <Text style={styles.moreComments}>
                          View {post.comments.length - 2} more comments
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ))}

              {hasMore && (
                <TouchableOpacity style={styles.loadMoreButton} onPress={loadMorePosts}>
                  <Text style={styles.loadMoreText}>Load More Posts</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Create Post Modal */}
      <Modal
        visible={showCreatePost}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreatePost(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Share Your Story</Text>
            <TouchableOpacity onPress={handleCreatePost} disabled={creating}>
              <Text style={[styles.postButton, creating && styles.postButtonDisabled]}>
                {creating ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>What's your eco-achievement or thought?</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Share your environmental journey, tips, questions, or achievements..."
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              maxLength={500}
            />
            <Text style={styles.characterCount}>{newPostContent.length}/500</Text>

            <Text style={styles.inputLabel}>Achievement (Optional)</Text>
            <TextInput
              style={styles.achievementInput}
              placeholder="e.g., Completed 30-day plastic-free challenge"
              value={newPostAchievement}
              onChangeText={setNewPostAchievement}
              maxLength={100}
            />

            <View style={styles.postTips}>
              <Text style={styles.tipsTitle}>💡 Sharing Tips:</Text>
              <Text style={styles.tipItem}>• Share specific eco-actions you've taken</Text>
              <Text style={styles.tipItem}>• Ask questions about sustainable living</Text>
              <Text style={styles.tipItem}>• Celebrate your environmental wins</Text>
              <Text style={styles.tipItem}>• Offer encouragement to others</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
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
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  timeAgo: {
    fontSize: 13,
    color: '#666',
  },
  achievementBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  achievementText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '600',
  },
  postContent: {
    fontSize: 15,
    color: '#212121',
    lineHeight: 22,
    marginBottom: 12,
  },
  impactSection: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 6,
  },
  impactStat: {
    fontSize: 13,
    color: '#4CAF50',
    marginBottom: 2,
  },
  postActions: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  comment: {
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  commentContent: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  moreComments: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
  },
  loadMoreButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loadMoreText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  postButton: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  postButtonDisabled: {
    color: '#999',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  contentInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginBottom: 20,
  },
  achievementInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 20,
  },
  postTips: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 13,
    color: '#4CAF50',
    marginBottom: 4,
  },
});