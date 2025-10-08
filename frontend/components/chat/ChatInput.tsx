import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading = false,
  placeholder = "Type your activity (e.g., 'I drove 10 km to work')"
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    const trimmedText = inputText.trim();
    if (!trimmedText) {
      Alert.alert('Message Required', 'Please enter a message before sending.');
      return;
    }

    if (trimmedText.length > 500) {
      Alert.alert('Message Too Long', 'Please keep your message under 500 characters.');
      return;
    }

    onSendMessage(trimmedText);
    setInputText('');
  };

  const handleSubmitEditing = () => {
    if (!isLoading) {
      handleSend();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          editable={!isLoading}
          onSubmitEditing={handleSubmitEditing}
          blurOnSubmit={false}
          textAlignVertical="center"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          activeOpacity={0.7}
        >
          <IconSymbol 
            name={isLoading ? "arrow.clockwise" : "paperplane.fill"} 
            size={20} 
            color={(!inputText.trim() || isLoading) ? "#999" : "#FFFFFF"} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F8F9FA',
    color: '#212121',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
    elevation: 0,
    shadowOpacity: 0,
  },
});

export default ChatInput;