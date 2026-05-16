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
import { palette } from '../theme/colors';
import { getPublicCases } from '../api/cases';
import { Case, CaseCategory } from '../types/cases';
import PublicCaseCard from '../components/PublicCaseCard';

export default function HomeScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CaseCategory | null>(null);

  const categories: { label: string; value: CaseCategory | null }[] = [
    { label: t('home.allCases', { defaultValue: 'All Cases' }), value: null },
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
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: palette.navyLight }]}>
        <View style={styles.titleRow}>
          <Sparkles color={colors.accent} size={24} />
          <Text style={[styles.title, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
            {t('home.title', { defaultValue: 'Explore Cases' })}
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textInverse, opacity: 0.7, fontFamily: typography.fontFamily.regular }]}>
          {t('home.subtitle', { defaultValue: 'Support those in need around you' })}
        </Text>
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={[styles.categoriesWrapper, { borderBottomColor: palette.navyLight }]}>
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
                    backgroundColor: isSelected ? colors.accent : palette.navyLight,
                    borderColor: isSelected ? colors.accent : palette.navyLight
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
                      color: isSelected ? colors.textOnPrimary : colors.textInverse, 
                      fontFamily: typography.fontFamily.medium 
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
              <AlertCircle color={colors.accent} size={48} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
              {t('home.noCasesTitle', { defaultValue: 'No Cases Found' })}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textInverse, opacity: 0.6, fontFamily: typography.fontFamily.regular }]}>
              {t('home.noCasesDesc', { defaultValue: 'There are currently no active cases' })} {selectedCategory ? t('home.noCasesInCategory', { defaultValue: 'in this category' }) : ''}
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
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  categoriesWrapper: {
    borderBottomWidth: 1,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 14,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
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
    marginTop: 60,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 22 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});

