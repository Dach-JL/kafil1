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
import { Sparkles, AlertCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { getPublicCases } from '../api/cases';
import { Case, CaseCategory } from '../types/cases';
import PublicCaseCard from '../components/PublicCaseCard';

export default function HomeScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CaseCategory | null>(null);

  const categories: { label: string; value: CaseCategory | null }[] = [
    { label: t('home.allCases'), value: null },
    ...(['MEDICAL', 'EDUCATION', 'EMERGENCY', 'HOUSING', 'FOOD', 'OTHER'] as CaseCategory[]).map(cat => ({
      label: t(`categories.${cat}`),
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

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.titleRow}>
          <Sparkles color={colors.primary} size={24} />
          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            {t('home.title')}
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          {t('home.subtitle')}
        </Text>
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={[styles.categoriesWrapper, { borderBottomColor: colors.border }]}>
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
                  { backgroundColor: isSelected ? colors.primary : colors.secondary },
                  !isSelected && { borderWidth: 1, borderColor: colors.border },
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
                    { color: isSelected ? colors.primaryForeground : colors.text, fontFamily: typography.fontFamily.medium },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Feed */}
      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PublicCaseCard
            data={item}
            onPress={() => navigation.navigate('CaseDetail', { caseId: item.id })}
          />
        )}
        contentContainerStyle={cases.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCases(); }} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <AlertCircle color={colors.mutedForeground} size={56} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
              {t('home.noCasesTitle')}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              {t('home.noCasesDesc')} {selectedCategory ? t('home.noCasesInCategory') : ''}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
  },
  categoriesWrapper: {
    borderBottomWidth: 1,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 20 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
