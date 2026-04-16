import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Heart,
  AlertCircle,
  Trash2,
  ChevronRight,
  Inbox,
  MessageSquare,
  Star,
} from 'lucide-react-native';
import { useNotifications } from '../supabase/NotificationsContext';
import { useTheme } from '../hooks/useTheme';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType } from '../api/notifications';

const TYPE_CONFIG: Record<NotificationType, { icon: any; color: string }> = {
  CASE_APPROVED: { icon: CheckCircle2, color: '#22C55E' },
  CASE_REJECTED: { icon: XCircle, color: '#EF4444' },
  DONATION_RECEIVED: { icon: Heart, color: '#EC4899' },
  MILESTONE_REACHED: { icon: Heart, color: '#F59E0B' },
  MESSAGE_RECEIVED: { icon: MessageSquare, color: '#8B5CF6' },
  IMPACT_ACHIEVED: { icon: Star, color: '#F59E0B' },
  SYSTEM: { icon: AlertCircle, color: '#3B82F6' },
};

export default function NotificationsScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    refresh 
  } = useNotifications();

  const handleNotificationPress = async (n: any) => {
    if (!n.is_read) {
      await markAsRead(n.id);
    }
    
    // Navigate based on metadata
    if (n.metadata?.roomId) {
      navigation.navigate('ChatRoom', { 
        roomId: n.metadata.roomId,
        recipientName: n.title.replace('New Message from ', '') // Fallback from title
      });
    } else if (n.metadata?.caseId) {
      navigation.navigate('CaseDetail', { caseId: n.metadata.caseId });
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const config = TYPE_CONFIG[item.type as NotificationType] || TYPE_CONFIG.SYSTEM;
    const Icon = config.icon;

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { 
            backgroundColor: item.is_read ? colors.background : colors.secondary + '30',
            borderBottomColor: colors.border 
          }
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: config.color + '15' }]}>
          <Icon color={config.color} size={20} />
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
              {item.title}
            </Text>
            {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
          </View>
          <Text style={[styles.message, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            {item.message}
          </Text>
          <Text style={[styles.time, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </Text>
        </View>

        <ChevronRight color={colors.mutedForeground} size={16} />
      </TouchableOpacity>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerActions, { borderBottomColor: colors.border }]}>
        <Text style={[styles.countText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          {notifications.length} Total Notifications
        </Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={[styles.markReadBtn, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
            Mark all read
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.secondary }]}>
              <Inbox color={colors.mutedForeground} size={40} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              All Caught Up!
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              You have no new notifications at the moment.
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  countText: { fontSize: 13 },
  markReadBtn: { fontSize: 13 },
  listContent: { flexGrow: 1 },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: { flex: 1, marginRight: 8 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: { fontSize: 15 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  time: { fontSize: 12 },
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
