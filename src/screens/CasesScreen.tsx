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
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { palette } from '../theme/colors';
import AppCard from '../components/common/AppCard';
import { useAuth } from '../supabase/AuthContext';
import { getMyCases } from '../api/cases';
import { Case } from '../types/cases';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#94A3B8',
  PENDING_REVIEW: '#EAB308', // Gold
  VERIFIED: '#EAB308',       // Gold
  ACTIVE_FUNDING: '#EAB308', // Gold
  FUNDED: '#22C55E',
  COMPLETED: '#22C55E',
  REJECTED: '#EF4444',
};

function CaseCard({ item }: { item: Case }) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const progress = item.target_amount > 0
    ? Math.min((item.collected_amount / item.target_amount) * 100, 100)
    : 0;
  const statusColor = STATUS_COLORS[item.status] ?? colors.textSecondary;

  return (
    <AppCard style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[styles.category, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
          {t(`categories.${item.category}`)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
          <Text style={[styles.statusText, { color: statusColor, fontFamily: typography.fontFamily.bold }]}>
            {t(`statuses.${item.status}`)}
          </Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]} numberOfLines={2}>
        {item.title}
      </Text>

      {/* Progress bar */}
      <View style={[styles.progressBg, { backgroundColor: palette.navyLight }]}>
        <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: colors.accent }]} />
      </View>
      
      <View style={styles.amountRow}>
        <View style={styles.amountCol}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
            {t('common.collected')}
          </Text>
          <Text style={[styles.amount, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
            ${item.collected_amount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.amountColEnd}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
            {t('common.target')}
          </Text>
          <Text style={[styles.target, { color: colors.textSecondary, fontFamily: typography.fontFamily.bold }]}>
            ${item.target_amount.toLocaleString()}
          </Text>
        </View>
      </View>
    </AppCard>
  );
}

export default function CasesScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
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
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
          {t('cases.myCases')}
        </Text>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.accent }]}
          onPress={() => navigation.navigate('CreateCase')}
          activeOpacity={0.85}
        >
          <Plus color={colors.background} size={18} />
          <Text style={[styles.createBtnText, { color: colors.background, fontFamily: typography.fontFamily.bold }]}>
            {t('cases.newCase')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CaseCard item={item} />}
        contentContainerStyle={cases.length === 0 ? styles.emptyContainer : styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); loadCases(); }} 
            tintColor={colors.accent} 
            colors={[colors.accent]} 
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <FolderHeart color={colors.accent} opacity={0.2} size={64} />
            <Text style={[styles.emptyTitle, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
              {t('cases.noCasesTitle')}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textInverse, opacity: 0.6, fontFamily: typography.fontFamily.regular }]}>
              {t('cases.noCasesDesc')}
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
    paddingBottom: 20,
  },
  screenTitle: { fontSize: 28 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnText: { fontSize: 13 },
  list: { padding: 20, gap: 16, paddingBottom: 40 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
  emptyTitle: { fontSize: 22, textAlign: 'center' },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  card: {
    padding: 20,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  category: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  statusText: { fontSize: 10, letterSpacing: 0.5 },
  title: { fontSize: 18, marginBottom: 16, lineHeight: 24 },
  progressBg: { height: 6, borderRadius: 3, marginBottom: 16 },
  progressFill: { height: 6, borderRadius: 3 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountCol: { gap: 2 },
  amountColEnd: { gap: 2, alignItems: 'flex-end' },
  amountLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  amount: { fontSize: 17 },
  target: { fontSize: 15 },
});

