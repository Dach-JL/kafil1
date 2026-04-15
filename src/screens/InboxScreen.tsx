import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MessageSquare, ChevronRight, Inbox as InboxIcon } from 'lucide-react-native';
import { useChat } from '../supabase/ChatContext';
import { useTheme } from '../hooks/useTheme';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../supabase/AuthContext';

export default function InboxScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const { rooms, loading, refreshRooms } = useChat();

  const renderItem = ({ item }: { item: any }) => {
    // Determine the participant that is NOT the current user
    const otherParticipant = item.participants.find(
      (p: any) => p.user_id !== user?.id
    );

    const displayName = otherParticipant?.profile?.full_name || 'Anonymous User';
    const avatarUrl = otherParticipant?.profile?.avatar_url;

    return (
      <TouchableOpacity
        style={[styles.roomItem, { borderBottomColor: colors.border }]}
        onPress={() => navigation.navigate('ChatRoom', { roomId: item.id, recipientName: displayName })}
        activeOpacity={0.7}
      >
        <View style={[styles.avatarContainer, { backgroundColor: colors.secondary }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Text style={[styles.avatarPlaceholder, { color: colors.mutedForeground }]}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text, fontFamily: typography.fontFamily.medium }]} numberOfLines={1}>
              {displayName}
            </Text>
            {item.last_message_at && (
              <Text style={[styles.time, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
                {formatDistanceToNow(new Date(item.last_message_at), { addSuffix: true })}
              </Text>
            )}
          </View>
          
          <View style={styles.previewRow}>
            <Text 
              style={[
                styles.preview, 
                { 
                  color: colors.mutedForeground, 
                  fontFamily: typography.fontFamily.regular,
                  fontWeight: item.unreadCount > 0 ? '700' : '400'
                }
              ]} 
              numberOfLines={1}
            >
              {item.latest_message ? item.latest_message.content : 'No messages yet'}
            </Text>
            {item.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]} />
            )}
          </View>
        </View>

        <ChevronRight color={colors.secondaryForeground} size={16} />
      </TouchableOpacity>
    );
  };

  if (loading && rooms.length === 0) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={rooms}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshRooms} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.secondary }]}>
              <InboxIcon color={colors.mutedForeground} size={40} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              No Messages
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              Direct messages with donors or beneficiaries will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { flexGrow: 1 },
  roomItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: { fontSize: 18, fontWeight: '700' },
  content: { flex: 1, marginRight: 8 },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: { fontSize: 16, flex: 1, marginRight: 8 },
  time: { fontSize: 12 },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preview: { fontSize: 14, flex: 1, opacity: 0.8 },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, marginBottom: 8 },
  emptySub: { fontSize: 15, textAlign: 'center', opacity: 0.7 },
});
