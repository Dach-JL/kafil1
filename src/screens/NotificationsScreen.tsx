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
  ChevronRight,
  Inbox,
  MessageSquare,
  Star,
} from 'lucide-react-native';
import { useNotifications } from '../supabase/NotificationsContext';
import { useTheme } from '../hooks/useTheme';
import { palette } from '../theme/colors';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType } from '../api/notifications';
import { useTranslation } from 'react-i18next';

const TYPE_CONFIG: Record<NotificationType, { icon: any; color: string }> = {
  CASE_APPROVED: { icon: CheckCircle2, color: '#EAB308' },
  CASE_REJECTED: { icon: XCircle, color: '#EF4444' },
  DONATION_RECEIVED: { icon: Heart, color: '#EAB308' },
  MILESTONE_REACHED: { icon: Heart, color: '#EAB308' },
  MESSAGE_RECEIVED: { icon: MessageSquare, color: '#EAB308' },
  IMPACT_ACHIEVED: { icon: Star, color: '#EAB308' },
  SYSTEM: { icon: AlertCircle, color: '#EAB308' },
};


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
            backgroundColor: item.is_read ? 'transparent' : palette.navyLight + '40',
            borderBottomColor: palette.navyLight 
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
            <Text style={[styles.title, { color: colors.textInverse, fontFamily: item.is_read ? typography.fontFamily.medium : typography.fontFamily.bold }]}>
              {item.title}
            </Text>
            {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />}
          </View>
          <Text style={[styles.message, { color: colors.textInverse, opacity: 0.7, fontFamily: typography.fontFamily.regular }]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[styles.time, { color: colors.accent, fontFamily: typography.fontFamily.medium, opacity: 0.8 }]}>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </Text>
        </View>

        <ChevronRight color={colors.textInverse} opacity={0.3} size={16} />
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerActions, { borderBottomColor: palette.navyLight }]}>
        <Text style={[styles.countText, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
          {t('notifications.total', { count: notifications.length, defaultValue: `${notifications.length} Total Notifications` })}
        </Text>
        <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.7}>
          <Text style={[styles.markReadBtn, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
            {t('notifications.markAllRead')}
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
            <View style={[styles.emptyIconCircle, { backgroundColor: palette.navyLight }]}>
              <Inbox color={colors.accent} size={48} opacity={0.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
              {t('notifications.empty')}
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {t('notifications.emptyDesc')}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  countText: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  markReadBtn: { fontSize: 13 },
  listContent: { flexGrow: 1, paddingBottom: 40 },
  notificationItem: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: { flex: 1, marginRight: 8 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: { fontSize: 16, lineHeight: 22 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#0A0E1A',
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  time: { fontSize: 12 },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: { fontSize: 22, marginBottom: 12 },
  emptySub: { fontSize: 15, textAlign: 'center', lineHeight: 24 },
});


