import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert, AlertCircle, Clock, Banknote, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { getPendingCases } from '../../api/cases';
import { Case } from '../../types/cases';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { palette } from '../../theme/colors';

function PendingCaseCard({ item, onPress }: { item: Case; onPress: () => void }) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.accent + '15' }]}>
          <Text style={[styles.categoryText, { color: colors.accent, fontFamily: typography.fontFamily.medium }]}>
            {t(`categories.${item.category}`)}
          </Text>
        </View>
        <View style={styles.timeBadge}>
          <Clock color={colors.textSecondary} size={12} style={{ marginRight: 4 }} />
          <Text style={[styles.timeText, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
          </Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]} numberOfLines={2}>
        {item.title}
      </Text>

      <View style={styles.detailsRow}>
        <Text style={[styles.target, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
          ${item.target_amount.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AdminQueueScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadPendingCases() {
    try {
      const data = await getPendingCases();
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPendingCases();
    });
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.titleRow}>
          <ShieldAlert color={colors.accent} size={28} />
          <Text style={[styles.screenTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
            {t('admin.verificationQueue', { defaultValue: 'Verification Queue' })}
          </Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.accent + '20' }]}>
          <Text style={[styles.countText, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
            {cases.length}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.paymentBtn, { backgroundColor: palette.navyLight, borderColor: colors.border }]}
        onPress={() => navigation.navigate('AdminContributions')}
        activeOpacity={0.8}
      >
        <Banknote color={colors.textPrimary} size={20} />
        <Text style={[styles.paymentBtnText, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
          {t('admin.viewPendingPayments', { defaultValue: 'View Pending Payments' })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.paymentBtn, { backgroundColor: palette.navyLight, borderColor: colors.border, marginTop: -4 }]}
        onPress={() => navigation.navigate('AdminCompletionQueue')}
        activeOpacity={0.8}
      >
        <CheckCircle2 color={colors.textPrimary} size={20} />
        <Text style={[styles.paymentBtnText, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
          {t('admin.viewCaseCompletions', { defaultValue: 'View Case Completions' })}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PendingCaseCard
            item={item}
            onPress={() => navigation.navigate('AdminCaseVerification', { caseInfo: item })}
          />
        )}
        contentContainerStyle={cases.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPendingCases(); }} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <AlertCircle color={colors.textSecondary} size={56} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
              {t('admin.allCaughtUp', { defaultValue: 'All caught up!' })}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {t('admin.noPendingCases', { defaultValue: 'There are no pending cases requiring review.' })}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  screenTitle: { fontSize: 24, letterSpacing: -0.5 },
  countBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 16 },
  paymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  paymentBtnText: { fontSize: 16 },
  list: { padding: 16, paddingTop: 4, gap: 12 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyTitle: { fontSize: 20 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  card: { padding: 16, borderRadius: 14, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  categoryText: { fontSize: 12 },
  timeBadge: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 12 },
  title: { fontSize: 16, marginBottom: 12, lineHeight: 22 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  beneficiary: { fontSize: 14 },
  target: { fontSize: 16 },
});
