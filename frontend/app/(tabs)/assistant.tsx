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

import MessageBubble, { Message } from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import chatAPI, { ChatResponse } from '@/services/chatAPI';
import clearAllStoredData from '@/utils/clearStorage';

const AssistantScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      // Get user token
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);

      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        text: "Hi! I'm your EcoTrack assistant 🌱\n\nI can help you log your daily activities and track your carbon footprint. Try saying something like:\n• 'I drove 10 km to work'\n• 'Took the bus for 5 miles'\n• 'Walked 2 km today'",
        isUser: false,
        timestamp: new Date(),
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

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send to backend
      const response: ChatResponse = await chatAPI.sendMessage(messageText, userToken || undefined);

      // Create bot response message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        co2Data: response.co2Data,
        suggestion: response.suggestion,
      };

      setMessages(prev => [...prev, botMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble processing your request right now. Please try again later. 🤖",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      Alert.alert(
        'Connection Error',
        'Unable to connect to the assistant. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        Start a conversation with your eco assistant!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>💬 EcoTrack Assistant</Text>
            <Text style={styles.subtitle}>
              Log activities and get personalized eco tips
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={handleClearData}
          >
            <Text style={styles.resetButtonText}>🧹 Reset</Text>
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

      <ChatInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder="Tell me about your activities (e.g., 'I drove 10 km')"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
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