import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, AlertCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { palette } from '../theme/colors';
import { supabase } from '../supabase/supabaseClient';
import { Case } from '../types/cases';
import PublicCaseCard from '../components/PublicCaseCard';

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

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: palette.navyLight }]}>
        <View style={styles.titleRow}>
          <Award color={colors.accent} size={28} />
          <Text style={[styles.title, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
            {t('history.title', { defaultValue: 'Impact History' })}
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textInverse, opacity: 0.8, fontFamily: typography.fontFamily.medium }]}>
          {t('history.subtitle', { defaultValue: 'Celebrating successfully completed cases' })}
        </Text>
      </View>

      {/* Feed */}
      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
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
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIconWrap, { backgroundColor: palette.navyLight }]}>
              <Award color={colors.accent} size={48} opacity={0.3} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
              {t('history.noResultsTitle', { defaultValue: 'No History Yet' })}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textInverse, opacity: 0.8, fontFamily: typography.fontFamily.regular }]}>
              {t('history.noResultsDesc', { defaultValue: 'Completed cases will appear here as they are successfully funded and verified.' })}
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
  },
  list: {
    padding: 20,
    paddingBottom: 60,
  },
  card: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
    marginTop: 80,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 22, textAlign: 'center' },
  emptyDesc: { fontSize: 15, textAlign: 'center', lineHeight: 24 },
});


