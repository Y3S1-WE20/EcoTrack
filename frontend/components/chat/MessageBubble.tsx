import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  co2Data?: {
    activity: string;
    amount: number;
    unit: string;
    co2Saved?: number;
    co2Emitted?: number;
  };
  suggestion?: string;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.isUser;

  const renderCO2Info = () => {
    if (!message.co2Data) return null;

    const { activity, amount, unit, co2Saved, co2Emitted } = message.co2Data;
    const emission = co2Saved || co2Emitted || 0;
    const icon = co2Saved ? '🌱' : co2Emitted ? '🚗' : '📊';
    const color = co2Saved ? '#4CAF50' : '#FF9800';

    return (
      <View style={[styles.co2Container, { backgroundColor: color + '20' }]}>
        <Text style={[styles.co2Text, { color }]}>
          {icon} {activity} {amount}{unit} = {emission.toFixed(1)} kg CO₂
        </Text>
      </View>
    );
  };

  const renderSuggestion = () => {
    if (!message.suggestion) return null;

    return (
      <View style={styles.suggestionContainer}>
        <Text style={styles.suggestionLabel}>💡 Suggestion:</Text>
        <Text style={styles.suggestionText}>{message.suggestion}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.botText]}>
          {message.text}
        </Text>
        {renderCO2Info()}
        {renderSuggestion()}
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.botTimestamp]}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  botContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 8,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#212121',
  },
  co2Container: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  co2Text: {
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  suggestionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 6,
  },
  userTimestamp: {
    color: '#E8F5E8',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#999',
  },
});

export default MessageBubble;