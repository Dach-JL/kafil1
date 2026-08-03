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
  SafeAreaView,
} from 'react-native';
import { Search, Filter, AlertCircle, Compass } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { getPublicCases } from '../api/cases';
import { Case, CaseCategory } from '../types/cases';
import PublicCaseCard from '../components/PublicCaseCard';
import AppInput from '../components/common/AppInput';

export default function ExploreScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();

  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CaseCategory | null>(null);
  const [urgentOnly, setUrgentOnly] = useState(false);

  const categories: { label: string; value: CaseCategory | null }[] = [
    { label: t('home.allCases', { defaultValue: 'All' }), value: null },
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

  // Client-side search and urgency filtering
  const filteredCases = cases.filter((c) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      c.title.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      (c.owner?.name && c.owner.name.toLowerCase().includes(query));

    const matchesUrgency = !urgentOnly || (c.urgency_level && c.urgency_level >= 4);

    return matchesSearch && matchesUrgency;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Search Section */}
      <View style={styles.searchHeader}>
        <View style={styles.titleRow}>
          <Compass size={22} color={colors.accent} />
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
            Explore Cases
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
          Find verified humanitarian causes needing immediate assistance.
        </Text>

        {/* Search Bar */}
        <View style={styles.searchBarWrapper}>
          <AppInput
            placeholder="Search by title, description, or owner..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
          />
        </View>

        {/* Filter Pills: Category & Urgency */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterPill,
              urgentOnly
                ? { backgroundColor: colors.error, borderColor: colors.error }
                : { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setUrgentOnly(!urgentOnly)}
            activeOpacity={0.8}
          >
            <Filter size={12} color={urgentOnly ? colors.surface : colors.textPrimary} />
            <Text
              style={[
                styles.filterPillText,
                { color: urgentOnly ? colors.surface : colors.textPrimary, fontFamily: typography.fontFamily.bold },
              ]}
            >
              Urgent First
            </Text>
          </TouchableOpacity>

          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat.value && !urgentOnly;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.textPrimary : colors.surface,
                    borderColor: isSelected ? colors.textPrimary : colors.border,
                  },
                ]}
                onPress={() => {
                  setUrgentOnly(false);
                  setLoading(true);
                  setSelectedCategory(cat.value);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isSelected ? colors.surface : colors.textPrimary,
                      fontFamily: isSelected ? typography.fontFamily.bold : typography.fontFamily.medium,
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

      {/* Case Feed List */}
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredCases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PublicCaseCard
              data={item}
              onPress={() => navigation.navigate('CaseDetail', { caseId: item.id })}
            />
          )}
          contentContainerStyle={filteredCases.length === 0 ? styles.emptyContainer : styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadCases();
              }}
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
                No Matching Cases
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                Try adjusting your search query or removing category filters.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  searchBarWrapper: {
    marginBottom: 12,
  },
  searchInput: {
    marginBottom: 0,
  },
  filtersScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
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
    marginTop: 40,
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
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
