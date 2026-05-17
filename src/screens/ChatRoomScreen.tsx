import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { Send, Flag, Info } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { palette } from '../theme/colors';
import { useAuth } from '../supabase/AuthContext';
import { getChatMessages, sendMessage, reportChatRoom, ChatMessage } from '../api/chat';
import { supabase } from '../supabase/supabaseClient';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import PromptModal from '../components/common/PromptModal';
import { useHeaderHeight } from '@react-navigation/elements';

export default function ChatRoomScreen({ route, navigation }: any) {
  const { roomId, recipientName } = route.params;
  const { colors, typography, spacing } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    navigation.setOptions({ 
      title: recipientName,
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { color: colors.accent, fontFamily: typography.fontFamily.heading },
      headerTintColor: colors.accent,
    });
    fetchMessages();

    // Subscribe to new messages for THIS room
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [payload.new as ChatMessage, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const fetchMessages = async () => {
    try {
      const data = await getChatMessages(roomId);
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!content.trim() || !user || sending) return;

    try {
      setSending(true);
      await sendMessage(roomId, user.id, content);
      setContent('');
    } catch (err: any) {
      Alert.alert(t('common.error'), t('chat.sendError', { defaultValue: 'Failed to send message: ' }) + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleReport = () => {
    setReportModalVisible(true);
  };

  const submitReport = async (reason: string) => {
    if (!reason.trim()) {
      Alert.alert(t('common.required', { defaultValue: 'Required' }), t('chat.reportReasonRequired', { defaultValue: 'You must provide a reason.' }));
      return;
    }
    setReportModalVisible(false);
    try {
      await reportChatRoom(roomId, reason);
      Alert.alert(t('chat.reported', { defaultValue: 'Reported' }), t('chat.reportedMessage', { defaultValue: 'The conversation has been reported to admins for review.' }));
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMine = item.sender_id === user?.id;

    return (
      <View style={[styles.messageWrapper, isMine ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
        <View 
          style={[
            styles.bubble, 
            { 
              backgroundColor: isMine ? colors.accent : palette.navyLight,
              borderBottomRightRadius: isMine ? 4 : 18,
              borderBottomLeftRadius: isMine ? 18 : 4,
            }
          ]}
        >
          <Text style={[
            styles.msgContent, 
            { 
              color: isMine ? palette.navy : colors.textPrimary, 
              fontFamily: typography.fontFamily.regular 
            }
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.timeInline, 
            { 
              color: isMine ? palette.navy + '80' : colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
            }
          ]}>
            {format(new Date(item.created_at), 'p')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      {/* Info Bar */}
      <View style={[styles.infoBar, { borderBottomColor: palette.navyLight }]}>
        <View style={styles.infoLeft}>
          <Info size={14} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.accent, opacity: 0.7, fontFamily: typography.fontFamily.regular }]}>
            {t('chat.privacy', { defaultValue: 'Encryption at rest active' })}
          </Text>
        </View>
        <TouchableOpacity onPress={handleReport} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Flag size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Messages Area — takes all available space */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          inverted
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          style={styles.messagesList}
        />
      )}

      {/* Input Bar — fixed at bottom, pushed by keyboard */}
      <View style={[styles.inputContainer, { borderTopColor: palette.navyLight, backgroundColor: colors.background }]}>
        <View style={[styles.inputWrapper, { backgroundColor: palette.navyLight }]}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, fontFamily: typography.fontFamily.regular }]}
            placeholder={t('chat.typeMessage', { defaultValue: 'Type a message...' })}
            placeholderTextColor={colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={1000}
          />
        </View>
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { backgroundColor: content.trim() ? colors.accent : palette.navyLight }
          ]}
          onPress={handleSend}
          disabled={!content.trim() || sending}
          activeOpacity={0.7}
        >
          {sending ? (
            <ActivityIndicator size="small" color={content.trim() ? palette.navy : colors.textSecondary} />
          ) : (
            <Send color={content.trim() ? palette.navy : colors.textSecondary} size={20} />
          )}
        </TouchableOpacity>
      </View>

      <PromptModal
        visible={reportModalVisible}
        title={t('chat.reportConversation', { defaultValue: 'Report Conversation' })}
        message={t('chat.reportPrompt', { defaultValue: 'Please describe why you are reporting this chat. This will allow admins to review the messages for safety.' })}
        placeholder={t('chat.reportReasonPlaceholder', { defaultValue: 'Reason for reporting...' })}
        cancelText={t('buttons.cancel', { defaultValue: 'Cancel' })}
        submitText={t('chat.report', { defaultValue: 'Report' })}
        submitStyle="destructive"
        onCancel={() => setReportModalVisible(false)}
        onSubmit={submitReport}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 11 },
  messagesList: {
    flex: 1,
  },
  listContent: { 
    padding: 16, 
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 10,
    maxWidth: '80%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirMessageWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  msgContent: { 
    fontSize: 15, 
    lineHeight: 21,
  },
  timeInline: { 
    fontSize: 10, 
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopWidth: 1,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    lineHeight: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
});
