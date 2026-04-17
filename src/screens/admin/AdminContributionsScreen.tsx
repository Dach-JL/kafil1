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
import { Banknote, AlertCircle, Clock, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { getPendingContributions } from '../../api/contributions';
import { Contribution } from '../../types/contributions';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

function ContributionCard({ item, onPress }: { item: Contribution; onPress: () => void }) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.donorInfo}>
          <Text style={[styles.donorName, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            {item.donor?.name || t('donation.anonymousDonor', { defaultValue: 'Anonymous Donor' })}
          </Text>
          <Text style={[styles.timeText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </Text>
        </View>
        <Text style={[styles.amount, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
          ${item.amount.toLocaleString()}
        </Text>
      </View>

      <View style={styles.detailsRow}>
        <Text style={[styles.caseTitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]} numberOfLines={1}>
          {t('admin.forCase', { title: item.cases?.title || t('common.unknownCase', { defaultValue: 'Unknown Case' }), defaultValue: `For: ${item.cases?.title || 'Unknown Case'}` })}
        </Text>
        <ChevronRight color={colors.mutedForeground} size={20} />
      </View>
    </TouchableOpacity>
  );
}

export default function AdminContributionsScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadPendingContributions() {
    try {
      const data = await getPendingContributions();
      setContributions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPendingContributions();
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
          <Banknote color={colors.primary} size={28} />
          <Text style={[styles.screenTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            {t('admin.paymentQueue', { defaultValue: 'Payment Queue' })}
          </Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.countText, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
            {contributions.length}
          </Text>
        </View>
      </View>

      <FlatList
        data={contributions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContributionCard
            item={item}
            onPress={() => navigation.navigate('AdminContributionDetail', { contribution: item })}
          />
        )}
        contentContainerStyle={contributions.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPendingContributions(); }} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <AlertCircle color={colors.mutedForeground} size={56} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
              {t('admin.noPendingPayments', { defaultValue: 'No pending payments' })}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              {t('admin.noPaymentsDesc', { defaultValue: 'All incoming contributions have been verified.' })}
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
  donorInfo: { flex: 1 },
  donorName: { fontSize: 16, marginBottom: 4 },
  timeText: { fontSize: 13 },
  amount: { fontSize: 20 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  caseTitle: { fontSize: 14, flex: 1, marginRight: 16 },
});
