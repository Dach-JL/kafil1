import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, AlertCircle, PlusCircle, Compass, Award, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../supabase/AuthContext';
import { getPublicCases } from '../api/cases';
import { Case, CaseCategory } from '../types/cases';
import PublicCaseCard from '../components/PublicCaseCard';
import AppCard from '../components/common/AppCard';

export default function HomeScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const { profile } = useAuth();
  
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CaseCategory | null>(null);

  const categories: { label: string; value: CaseCategory | null }[] = [
    { label: t('home.allCases', { defaultValue: 'All Cases' }), value: null },
    ...(['MEDICAL', 'EDUCATION', 'EMERGENCY', 'HOUSING', 'FOOD', 'OTHER'] as CaseCategory[]).map(cat => ({
      label: t(`categories.${cat}`, { defaultValue: cat }),
      value: cat,
    })),
  ];

  async function loadCases() {
    try {
      const data = await getPublicCases(selectedCategory || undefined);
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCases();
  }, [selectedCategory]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Greeting Banner */}
      <View style={styles.greetingHeader}>
        <View>
          <Text style={[styles.welcomeSub, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
            HUMANITARIAN DASHBOARD
          </Text>
          <Text style={[styles.welcomeTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
            Welcome back, {profile?.name?.split(' ')[0] || 'Donor'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.createCaseBadge, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('CreateCase')}
          activeOpacity={0.8}
        >
          <PlusCircle color={colors.textOnPrimary} size={16} />
          <Text style={[styles.createCaseBadgeText, { color: colors.textOnPrimary, fontFamily: typography.fontFamily.bold }]}>
            New Case
          </Text>
        </TouchableOpacity>
      </View>

      {/* Overview Stats Cards */}
      <View style={styles.statsRow}>
        <AppCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
            {cases.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            Active Cases
          </Text>
        </AppCard>

        <AppCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
            100%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            Vetted Proof
          </Text>
        </AppCard>

        <AppCard style={styles.statCard}>
          <View style={styles.verifiedRow}>
            <ShieldCheck color={colors.success} size={16} />
            <Text style={[styles.statValue, { color: colors.success, fontFamily: typography.fontFamily.heading }]}>
              Verified
            </Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            Audit Trail
          </Text>
        </AppCard>
      </View>

      {/* Quick Action Navigation Bar */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={[styles.actionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Explore')}
          activeOpacity={0.8}
        >
          <Compass size={14} color={colors.textPrimary} />
          <Text style={[styles.actionChipText, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
            Explore All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('History')}
          activeOpacity={0.8}
        >
          <Award size={14} color={colors.accent} />
          <Text style={[styles.actionChipText, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
            Impact History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories Filter Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}>
          <Sparkles color={colors.accent} size={20} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
            Verified Cases
          </Text>
        </View>
      </View>

      {/* Categories Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {categories.map((cat, idx) => {
          const isSelected = selectedCategory === cat.value;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.categoryPill,
                { 
                  backgroundColor: isSelected ? colors.textPrimary : colors.surface,
                  borderColor: isSelected ? colors.textPrimary : colors.border
                },
              ]}
              onPress={() => {
                setLoading(true);
                setSelectedCategory(cat.value);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  { 
                    color: isSelected ? colors.surface : colors.textPrimary, 
                    fontFamily: isSelected ? typography.fontFamily.bold : typography.fontFamily.medium 
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
          />
        )}
        contentContainerStyle={cases.length === 0 ? styles.emptyContainer : styles.list}
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
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.accent + '15' }]}>
              <AlertCircle color={colors.accent} size={40} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
              {t('home.noCasesTitle', { defaultValue: 'No Active Cases' })}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {t('home.noCasesDesc', { defaultValue: 'There are currently no cases matching this category.' })}
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
  headerContainer: {
    paddingBottom: 8,
  },
  greetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  welcomeSub: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  welcomeTitle: {
    fontSize: 24,
  },
  createCaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  createCaseBadgeText: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginBottom: 0,
  },
  statValue: {
    fontSize: 20,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionChipText: {
    fontSize: 12,
  },
  sectionHeaderRow: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 13,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 20,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { 
    fontSize: 18, 
    marginBottom: 6 
  },
  emptyDesc: { 
    fontSize: 13, 
    textAlign: 'center', 
    lineHeight: 18 
  },
});
