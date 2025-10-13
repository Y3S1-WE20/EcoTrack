import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Attachment {
  id: string;
  type: 'image' | 'document' | 'voice';
  uri: string;
  name?: string;
  mimeType?: string;
  size?: number;
}

export interface EnhancedMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  attachments?: Attachment[];
  language?: 'en' | 'si' | 'auto';
  co2Data?: {
    activity: string;
    amount: number;
    unit: string;
    co2Saved?: number;
    co2Emitted?: number;
  };
  suggestion?: string;
}

interface EnhancedMessageBubbleProps {
  message: EnhancedMessage;
}

const EnhancedMessageBubble: React.FC<EnhancedMessageBubbleProps> = ({ message }) => {
  const [isLoading, setIsLoading] = useState(false);
  // Temporarily disable audio while migrating to expo-audio
  // const [currentAudioUri, setCurrentAudioUri] = useState<string | null>(null);
  // const player = useAudioPlayer(currentAudioUri || '');

  const playVoiceMessage = async (uri: string) => {
    Alert.alert('Coming Soon', 'Voice message playback is being updated. Feature will be available soon.');
  };

  const stopVoiceMessage = () => {
    // Temporarily disabled
  };

  const openDocument = (attachment: Attachment) => {
    Alert.alert(
      'Document',
      `File: ${attachment.name}\nType: ${attachment.mimeType}\nSize: ${attachment.size ? Math.round(attachment.size / 1024) + ' KB' : 'Unknown'}`,
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const renderAttachment = (attachment: Attachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <Image 
            key={attachment.id}
            source={{ uri: attachment.uri }} 
            style={styles.attachmentImage}
            resizeMode="cover"
          />
        );
      
      case 'voice':
        return (
          <TouchableOpacity
            key={attachment.id}
            style={styles.voiceMessage}
            onPress={() => playVoiceMessage(attachment.uri)}
            disabled={isLoading}
          >
            <View style={styles.voiceButton}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <IconSymbol 
                  name="play.fill" 
                  size={16} 
                  color="#FFFFFF" 
                />
              )}
            </View>
            <Text style={styles.voiceText}>
              {isLoading ? 'Loading...' : 'Voice Message'}
            </Text>
          </TouchableOpacity>
        );
      
      case 'document':
        return (
          <TouchableOpacity
            key={attachment.id}
            style={styles.documentAttachment}
            onPress={() => openDocument(attachment)}
          >
            <IconSymbol name="doc.text" size={20} color="#4CAF50" />
            <View style={styles.documentInfo}>
              <Text style={styles.documentName} numberOfLines={1}>
                {attachment.name || 'Document'}
              </Text>
              <Text style={styles.documentSize}>
                {attachment.size ? Math.round(attachment.size / 1024) + ' KB' : 'Unknown size'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      
      default:
        return null;
    }
  };

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isUser = message.isUser;

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {/* Text Message */}
        {message.text && (
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {message.text}
          </Text>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {message.attachments.map(renderAttachment)}
          </View>
        )}

        {/* CO2 Data */}
        {renderCO2Info()}

        {/* Suggestion */}
        {renderSuggestion()}

        {/* Language indicator for non-English messages */}
        {message.language && message.language === 'si' && (
          <View style={styles.languageIndicator}>
            <Text style={styles.languageText}>🇱🇰 සිංහල</Text>
          </View>
        )}

        {/* Timestamp */}
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
          {formatTime(message.timestamp)}
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
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#F1F3F4',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#212121',
  },
  attachmentsContainer: {
    marginTop: 8,
    gap: 8,
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  voiceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  voiceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  documentAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  documentInfo: {
    marginLeft: 8,
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  documentSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  co2Container: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  co2Text: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  suggestionContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  suggestionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 18,
  },
  languageIndicator: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  languageText: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  assistantTimestamp: {
    color: '#999',
  },
});

export default EnhancedMessageBubble;