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
import { CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { getPendingCompletionCases } from '../../api/cases';
import { Case } from '../../types/cases';
import { formatDistanceToNow } from 'date-fns';

function CompletionCaseCard({ item, onPress }: { item: Case; onPress: () => void }) {
  const { colors, typography } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.caseInfo}>
          <Text style={[styles.caseTitle, { color: colors.text, fontFamily: typography.fontFamily.medium }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.timeText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Target: ${item.target_amount.toLocaleString()}
          </Text>
        </View>
        <CheckCircle2 color={colors.primary} size={24} />
      </View>

      <View style={styles.detailsRow}>
        <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          Proof submitted {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
        </Text>
        <ChevronRight color={colors.mutedForeground} size={20} />
      </View>
    </TouchableOpacity>
  );
}

export default function AdminCompletionQueueScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadPendingCompletions() {
    try {
      const data = await getPendingCompletionCases();
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
      loadPendingCompletions();
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
          <CheckCircle2 color={colors.primary} size={28} />
          <Text style={[styles.screenTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            Completion Queue
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
          <CompletionCaseCard
            item={item}
            onPress={() => navigation.navigate('AdminCaseCompletionDetail', { caseInfo: item })}
          />
        )}
        contentContainerStyle={cases.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPendingCompletions(); }} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <AlertCircle color={colors.mutedForeground} size={56} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
              No pending completions
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              There are no funded cases awaiting final review.
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  caseInfo: { flex: 1 },
  caseTitle: { fontSize: 16, marginBottom: 4 },
  timeText: { fontSize: 13 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaText: { fontSize: 14, flex: 1, marginRight: 16 },
});
