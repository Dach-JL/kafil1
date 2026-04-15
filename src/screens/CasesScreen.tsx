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
import { Plus, FolderHeart } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../supabase/AuthContext';
import { getMyCases } from '../api/cases';
import { Case, STATUS_LABELS, CATEGORY_LABELS } from '../types/cases';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#64748B',
  PENDING_REVIEW: '#F59E0B',
  VERIFIED: '#6366F1',
  ACTIVE_FUNDING: '#10B981',
  FUNDED: '#3B82F6',
  COMPLETED: '#22C55E',
  REJECTED: '#EF4444',
};

function CaseCard({ item }: { item: Case }) {
  const { colors, typography } = useTheme();
  const progress = item.target_amount > 0
    ? Math.min((item.collected_amount / item.target_amount) * 100, 100)
    : 0;
  const statusColor = STATUS_COLORS[item.status] ?? colors.mutedForeground;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.category, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          {CATEGORY_LABELS[item.category]}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor, fontFamily: typography.fontFamily.medium }]}>
            {STATUS_LABELS[item.status]}
          </Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={[styles.beneficiary, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
        For: {item.beneficiary_name}{item.beneficiary_age ? `, ${item.beneficiary_age} yrs` : ''}
      </Text>

      {/* Progress bar */}
      <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
        <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: statusColor }]} />
      </View>
      <View style={styles.amountRow}>
        <Text style={[styles.amount, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
          ${item.collected_amount.toLocaleString()}
        </Text>
        <Text style={[styles.target, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          of ${item.target_amount.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

export default function CasesScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadCases() {
    if (!user) return;
    try {
      const data = await getMyCases(user.id);
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadCases(); }, [user]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          My Cases
        </Text>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('CreateCase')}
          activeOpacity={0.85}
        >
          <Plus color={colors.primaryForeground} size={18} />
          <Text style={[styles.createBtnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
            New Case
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CaseCard item={item} />}
        contentContainerStyle={cases.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCases(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <FolderHeart color={colors.mutedForeground} size={56} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
              No cases yet
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              Create your first case to start receiving contributions
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  screenTitle: { fontSize: 26 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  createBtnText: { fontSize: 14 },
  list: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyTitle: { fontSize: 20 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  category: { fontSize: 12 },
  statusBadge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  statusText: { fontSize: 11 },
  title: { fontSize: 16, marginBottom: 4, lineHeight: 22 },
  beneficiary: { fontSize: 13, marginBottom: 12 },
  progressBg: { height: 4, borderRadius: 4, marginBottom: 8 },
  progressFill: { height: 4, borderRadius: 4 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  amount: { fontSize: 16 },
  target: { fontSize: 13 },
});
