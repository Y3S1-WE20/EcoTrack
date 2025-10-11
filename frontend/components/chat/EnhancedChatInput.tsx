import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAudioRecorder, useAudioPlayer } from 'expo-audio';

interface Attachment {
  id: string;
  type: 'image' | 'document' | 'voice';
  uri: string;
  name?: string;
  mimeType?: string;
  size?: number;
}

interface EnhancedChatInputProps {
  onSendMessage: (message: string, attachments?: Attachment[]) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({ 
  onSendMessage, 
  isLoading = false,
  placeholder = "Type your message, or add attachments..."
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // Keep for UI state
  // Temporarily disable audio recording
  // const audioRecorder = useAudioRecorder();
  // const audioPlayer = useAudioPlayer();

  const handleSend = () => {
    const trimmedText = inputText.trim();
    if (!trimmedText && attachments.length === 0) {
      Alert.alert('Message Required', 'Please enter a message or add an attachment.');
      return;
    }

    if (trimmedText.length > 1000) {
      Alert.alert('Message Too Long', 'Please keep your message under 1000 characters.');
      return;
    }

    onSendMessage(trimmedText, attachments);
    setInputText('');
    setAttachments([]);
  };

  const handleSubmitEditing = () => {
    if (!isLoading) {
      handleSend();
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const attachment: Attachment = {
          id: Date.now().toString(),
          type: 'image',
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || 'image.jpg',
          mimeType: result.assets[0].mimeType || 'image/jpeg',
          size: result.assets[0].fileSize,
        };
        setAttachments(prev => [...prev, attachment]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
    setShowAttachmentMenu(false);
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const attachment: Attachment = {
          id: Date.now().toString(),
          type: 'image',
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || 'photo.jpg',
          mimeType: result.assets[0].mimeType || 'image/jpeg',
          size: result.assets[0].fileSize,
        };
        setAttachments(prev => [...prev, attachment]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error('Camera error:', error);
    }
    setShowAttachmentMenu(false);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/*', 'application/msword', 
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const attachment: Attachment = {
          id: Date.now().toString(),
          type: 'document',
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || 'application/octet-stream',
          size: asset.size,
        };
        setAttachments(prev => [...prev, attachment]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
      console.error('Document picker error:', error);
    }
    setShowAttachmentMenu(false);
  };

  // TODO: Migrate to expo-audio
  const startRecording = async () => {
    Alert.alert('Coming Soon', 'Voice message feature is being updated. Please use text or attachments for now.');
  };

  const stopRecording = async () => {
    // Disabled for now
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <ScrollView 
          horizontal 
          style={styles.attachmentsPreview}
          showsHorizontalScrollIndicator={false}
        >
          {attachments.map((attachment) => (
            <View key={attachment.id} style={styles.attachmentItem}>
              {attachment.type === 'image' ? (
                <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
              ) : (
                <View style={styles.attachmentPlaceholder}>
                  <Text style={styles.attachmentIcon}>
                    {attachment.type === 'document' ? '📄' : '🎤'}
                  </Text>
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeAttachment(attachment.id)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.inputContainer}>
        {/* Attachment Button */}
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={() => setShowAttachmentMenu(true)}
          disabled={isLoading}
        >
          <IconSymbol name="plus" size={20} color="#4CAF50" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
          editable={!isLoading}
          onSubmitEditing={handleSubmitEditing}
          blurOnSubmit={false}
          textAlignVertical="center"
        />

        {/* Voice Recording Button */}
        <TouchableOpacity
          style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
        >
          {isRecording ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <IconSymbol name="mic" size={20} color={isRecording ? "#FFFFFF" : "#4CAF50"} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sendButton,
            ((!inputText.trim() && attachments.length === 0) || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
          activeOpacity={0.7}
        >
          <IconSymbol 
            name={isLoading ? "arrow.clockwise" : "paperplane.fill"} 
            size={20} 
            color={((!inputText.trim() && attachments.length === 0) || isLoading) ? "#999" : "#FFFFFF"} 
          />
        </TouchableOpacity>
      </View>

      {/* Attachment Menu Modal */}
      <Modal
        visible={showAttachmentMenu}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View style={styles.attachmentMenu}>
            <Text style={styles.menuTitle}>Add Attachment</Text>
            
            <TouchableOpacity style={styles.menuItem} onPress={showImageOptions}>
              <IconSymbol name="camera" size={24} color="#4CAF50" />
              <Text style={styles.menuItemText}>Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={pickDocument}>
              <IconSymbol name="doc" size={24} color="#4CAF50" />
              <Text style={styles.menuItemText}>Document</Text>
            </TouchableOpacity>
            
            {/* Temporarily disabled while migrating to expo-audio */}
            {/* <TouchableOpacity style={styles.menuItem} onPress={startRecording}>
              <IconSymbol name="mic" size={24} color="#4CAF50" />
              <Text style={styles.menuItemText}>Voice Message</Text>
            </TouchableOpacity> */}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  attachmentsPreview: {
    maxHeight: 80,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  attachmentItem: {
    marginRight: 8,
    position: 'relative',
  },
  attachmentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  attachmentPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  attachmentIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  attachmentName: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    maxWidth: 50,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  attachmentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 36,
    textAlignVertical: 'center',
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  voiceButtonRecording: {
    backgroundColor: '#FF5252',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  attachmentMenu: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#212121',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#212121',
    fontWeight: '500',
  },
});

export default EnhancedChatInput;