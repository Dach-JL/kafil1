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
} from 'react-native';
import { Send, Flag, Info } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../supabase/AuthContext';
import { getChatMessages, sendMessage, reportChatRoom, ChatMessage } from '../api/chat';
import { supabase } from '../supabase/supabaseClient';
import { format } from 'date-fns';

export default function ChatRoomScreen({ route, navigation }: any) {
  const { roomId, recipientName } = route.params;
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({ title: recipientName });
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
      Alert.alert('Error', 'Failed to send message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleReport = () => {
    Alert.prompt(
      'Report Conversation',
      'Please describe why you are reporting this chat. This will allow admins to review the messages for safety.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          style: 'destructive',
          onPress: async (reason: string | undefined) => {
            if (!reason) return;
            try {
              await reportChatRoom(roomId, reason);
              Alert.alert('Reported', 'The conversation has been reported to admins for review.');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMine = item.sender_id === user?.id;

    return (
      <View style={[styles.messageWrapper, isMine ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
        <View 
          style={[
            styles.bubble, 
            { 
              backgroundColor: isMine ? colors.primary : colors.secondary,
              borderBottomRightRadius: isMine ? 4 : 16,
              borderBottomLeftRadius: isMine ? 16 : 4,
            }
          ]}
        >
          <Text style={[styles.content, { color: isMine ? colors.primaryForeground : colors.text, fontFamily: typography.fontFamily.regular }]}>
            {item.content}
          </Text>
        </View>
        <Text style={[styles.time, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          {format(new Date(item.created_at), 'p')}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.infoBar, { borderBottomColor: colors.border }]}>
        <View style={styles.infoLeft}>
          <Info size={14} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Privacy: Encryption at rest active
          </Text>
        </View>
        <TouchableOpacity onPress={handleReport}>
          <Flag size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
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
        />
      )}

      <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.input, { color: colors.text, fontFamily: typography.fontFamily.regular }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.mutedForeground}
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { backgroundColor: content.trim() ? colors.primary : colors.muted }
          ]}
          onPress={handleSend}
          disabled={!content.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Send color="#ffffff" size={20} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  listContent: { padding: 16, paddingBottom: 24 },
  messageWrapper: {
    marginBottom: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  content: { fontSize: 15, lineHeight: 20 },
  time: { fontSize: 10, marginTop: 4, opacity: 0.8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: 'transparent',
    fontSize: 15,
    paddingTop: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
