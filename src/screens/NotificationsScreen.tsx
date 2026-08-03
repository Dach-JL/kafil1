import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Heart,
  AlertCircle,
  ChevronRight,
  Inbox,
  MessageSquare,
  Star,
} from 'lucide-react-native';
import { useNotifications } from '../supabase/NotificationsContext';
import { useTheme } from '../hooks/useTheme';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType } from '../api/notifications';
import { useTranslation } from 'react-i18next';

export default function NotificationsScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    refresh 
  } = useNotifications();

  const TYPE_CONFIG: Record<NotificationType, { icon: any; color: string }> = {
    CASE_APPROVED: { icon: CheckCircle2, color: colors.success },
    CASE_REJECTED: { icon: XCircle, color: colors.error },
    DONATION_RECEIVED: { icon: Heart, color: colors.primary },
    MILESTONE_REACHED: { icon: Heart, color: colors.accent },
    MESSAGE_RECEIVED: { icon: MessageSquare, color: colors.primary },
    IMPACT_ACHIEVED: { icon: Star, color: colors.accent },
    SYSTEM: { icon: AlertCircle, color: colors.textSecondary },
  };

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
            backgroundColor: item.is_read ? colors.surface : colors.background,
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
            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: item.is_read ? typography.fontFamily.medium : typography.fontFamily.bold }]}>
              {item.title}
            </Text>
            {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.accent, borderColor: colors.surface }]} />}
          </View>
          <Text style={[styles.message, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[styles.time, { color: colors.accent, fontFamily: typography.fontFamily.medium }]}>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </Text>
        </View>

        <ChevronRight color={colors.textSecondary} size={16} />
      </TouchableOpacity>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerActions, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <Text style={[styles.countText, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
          {t('notifications.total', { count: notifications.length, defaultValue: `${notifications.length} Notifications` })}
        </Text>
        <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.7}>
          <Text style={[styles.markReadBtn, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
            {t('notifications.markAllRead', { defaultValue: 'Mark all as read' })}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.accent} colors={[colors.accent]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Inbox color={colors.accent} size={40} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
              {t('notifications.empty', { defaultValue: 'No Notifications' })}
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {t('notifications.emptyDesc', { defaultValue: 'You are all caught up! Updates regarding cases and contributions will appear here.' })}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  countText: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  markReadBtn: { fontSize: 13 },
  listContent: { flexGrow: 1, paddingBottom: 40 },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  content: { flex: 1, marginRight: 8 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: { fontSize: 15, lineHeight: 20 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  time: { fontSize: 11 },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, marginBottom: 6, textAlign: 'center' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
