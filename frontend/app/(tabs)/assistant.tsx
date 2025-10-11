import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import EnhancedMessageBubble, { EnhancedMessage } from '@/components/chat/EnhancedMessageBubble';
import EnhancedChatInput from '@/components/chat/EnhancedChatInput';
import EcoTrackLogo from '@/components/EcoTrackLogo';
import { useAppTheme } from '@/contexts/ThemeContext';
import chatAPI, { ChatResponse } from '@/services/chatAPI';
import clearAllStoredData from '@/utils/clearStorage';

const AssistantScreen = () => {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useAppTheme();

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      // Get user token
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);

      // Add welcome message
      const welcomeMessage: EnhancedMessage = {
        id: 'welcome',
        text: "Hello! I'm EcoTrack, your friendly AI assistant! 🌱✨\n\nI can help you with:\n• Tracking daily activities and carbon footprint\n• Answering questions about sustainability\n• Providing eco-friendly tips and advice\n• General conversation about environmental topics\n\nI now support multiple languages including Sinhala! You can send me text, images, documents, and voice messages.\n\nTry asking me anything - from 'Hi, how are you?' to 'මම කිලෝමීටර් 10 ක් වාහනයෙන් ගියා' or 'What are some ways to reduce my carbon footprint?'",
        isUser: false,
        timestamp: new Date(),
        language: 'en'
      };
      setMessages([welcomeMessage]);

      // TODO: Load chat history from backend if user is logged in
      if (token) {
        // loadChatHistory(token);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear App Data',
      'This will clear all stored data including login credentials. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            const success = await clearAllStoredData();
            if (success) {
              Alert.alert('Success', 'App data cleared. Please restart the app.');
            }
          }
        }
      ]
    );
  };

  const handleSendMessage = async (messageText: string, attachments?: any[]) => {
    if (!messageText.trim() && (!attachments || attachments.length === 0)) return;

    // Add user message immediately
    const userMessage: EnhancedMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
      attachments: attachments || [],
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send to enhanced backend
      const response: ChatResponse = await chatAPI.sendEnhancedMessage(messageText, attachments);

      // Create bot response message
      const botMessage: EnhancedMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        co2Data: response.co2Data,
        suggestion: response.suggestion,
        language: (response.language as 'en' | 'si' | 'auto') || 'en',
      };

      setMessages(prev => [...prev, botMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      let errorMessage = "Sorry, I'm having trouble processing your request right now. 🤖";
      let alertTitle = 'Connection Error';
      let alertMessage = 'Unable to connect to the assistant. Please check your connection and try again.';
      
      if (error?.message?.includes('timeout')) {
        errorMessage = "Request timed out. The server might be busy. Please try again. ⏱️";
        alertTitle = 'Request Timeout';
        alertMessage = 'The request took too long. Please check your internet connection and try again.';
      } else if (error?.message?.includes('fetch')) {
        errorMessage = "Network connection failed. Please check your internet. 📡";
        alertTitle = 'Network Error';
        alertMessage = 'Cannot reach the server. Make sure you have an active internet connection.';
      }
      
      // Add error message
      const errorBotMessage: EnhancedMessage = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date(),
        language: 'en',
      };
      setMessages(prev => [...prev, errorBotMessage]);
      
      Alert.alert(alertTitle, alertMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: EnhancedMessage }) => (
    <EnhancedMessageBubble message={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        Start a conversation with your eco assistant!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <EcoTrackLogo size="header" showText={false} />
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: theme.text }]}>AI Assistant</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Multilingual eco tracking & tips
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.resetButton, { backgroundColor: theme.error + '20', borderColor: theme.error }]} 
            onPress={handleClearData}
          >
            <Text style={[styles.resetButtonText, { color: theme.error }]}>🧹 Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.loadingText}>Assistant is typing...</Text>
        </View>
      )}

      <EnhancedChatInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder="Tell me about your activities or ask anything in English or Sinhala..."
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default AssistantScreen;