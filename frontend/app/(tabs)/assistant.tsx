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
        text: "Hello! I'm EcoTrack, your friendly AI assistant! 🌱✨\n\nI can help you with:\n• Tracking daily activities and carbon footprint\n• Answering questions about sustainability\n• Providing eco-friendly tips and advice\n• General conversation about environmental topics\n\nTry asking me anything - from 'Hi, how are you?' to 'I drove 10 km today' or 'What are some ways to reduce my carbon footprint?'",
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
      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorBotMessage]);
      
      Alert.alert(alertTitle, alertMessage);
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