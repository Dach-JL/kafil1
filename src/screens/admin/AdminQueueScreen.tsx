import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { ShieldAlert, AlertCircle, Clock } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { getPendingCases } from '../../api/cases';
import { Case, CATEGORY_LABELS } from '../../types/cases';
import { formatDistanceToNow } from 'date-fns';

function PendingCaseCard({ item, onPress }: { item: Case; onPress: () => void }) {
  const { colors, typography } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.categoryText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
            {CATEGORY_LABELS[item.category]}
          </Text>
        </View>
        <View style={styles.timeBadge}>
          <Clock color={colors.mutedForeground} size={12} style={{ marginRight: 4 }} />
          <Text style={[styles.timeText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
          </Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]} numberOfLines={2}>
        {item.title}
      </Text>

      <View style={styles.detailsRow}>
        <Text style={[styles.beneficiary, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          {item.beneficiary_name} {item.beneficiary_age ? `(${item.beneficiary_age})` : ''}
        </Text>
        <Text style={[styles.target, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
          ${item.target_amount.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AdminQueueScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
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
    // Need to reload when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadPendingCases();
    });
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.titleRow}>
          <ShieldAlert color={colors.primary} size={28} />
          <Text style={[styles.screenTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            Verification Queue
          </Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.countText, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
            {cases.length}
          </Text>
        </View>
      </View>

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
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPendingCases(); }} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <AlertCircle color={colors.mutedForeground} size={56} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
              All caught up!
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              There are no pending cases requiring review.
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
  list: { padding: 16, gap: 12 },
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
