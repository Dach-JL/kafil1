import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { supabase } from '../supabase/supabaseClient';
import { Case } from '../types/cases';
import PublicCaseCard from '../components/PublicCaseCard';
import AppCard from '../components/common/AppCard';

export default function HistoryScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadCompletedCases() {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          owner:profiles!owner_id(name, trust_score, role)
        `)
        .eq('status', 'COMPLETED')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setCases(data as Case[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCompletedCases();
  }, []);

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Header Title */}
      <View style={styles.titleRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accent + '20' }]}>
          <Award color={colors.accent} size={22} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
          {t('history.title', { defaultValue: 'Impact History' })}
        </Text>
      </View>
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
        {t('history.subtitle', { defaultValue: 'Verified humanitarian outcomes and transparent completion reports.' })}
      </Text>

      {/* Summary Impact Banner */}
      <View style={styles.impactStatsRow}>
        <AppCard style={styles.impactStatCard}>
          <View style={styles.statIconRow}>
            <CheckCircle2 size={16} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
              {cases.length}
            </Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            Cases Completed
          </Text>
        </AppCard>

        <AppCard style={styles.impactStatCard}>
          <View style={styles.statIconRow}>
            <ShieldCheck size={16} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
              100%
            </Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            Audited Evidence
          </Text>
        </AppCard>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <PublicCaseCard
            data={item}
            onPress={() => navigation.navigate('CaseDetail', { caseId: item.id })}
            style={styles.card}
          />
        )}
        contentContainerStyle={cases.length === 0 ? styles.emptyContainer : styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); loadCompletedCases(); }} 
            tintColor={colors.accent} 
            colors={[colors.accent]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Award color={colors.accent} size={40} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
              {t('history.noResultsTitle', { defaultValue: 'No Impact Stories Yet' })}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {t('history.noResultsDesc', { defaultValue: 'Completed cases will appear here as they are successfully funded and verified.' })}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  impactStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  impactStatCard: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    marginBottom: 0,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 40,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { 
    fontSize: 18, 
    marginBottom: 6, 
    textAlign: 'center' 
  },
  emptyDesc: { 
    fontSize: 13, 
    textAlign: 'center', 
    lineHeight: 18 
  },
});
