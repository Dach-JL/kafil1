import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { supabase } from '../../supabase/supabaseClient';
import { Case } from '../../types/cases';
import { useTheme } from '../../hooks/useTheme';
import { ShieldCheck, Award, ArrowRight } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface ImpactPreviewProps {
  onPressItem: () => void;
}

function MiniImpactCard({ item, onPress }: { item: Case; onPress: () => void }) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  
  // Use completion_images if available, else a placeholder
  const imageUrl = item.completion_images?.[0] || 'https://via.placeholder.com/300x200?text=Impact+Achieved';

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={[styles.verifiedBadge, { backgroundColor: '#22C55E' }]}>
          <ShieldCheck color="#fff" size={14} />
          <Text style={styles.verifiedText}>{t('landing.verified')}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fontFamily.medium }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.dateRow}>
            <Award color={colors.primary} size={14} />
            <Text style={[styles.dateText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              {item.completed_at ? formatDistanceToNow(new Date(item.completed_at), { addSuffix: true }) : t('common.recently')}
            </Text>
          </View>
          <Text style={[styles.amountText, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            ${item.target_amount.toLocaleString()} {t('common.raised')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ImpactPreview({ onPressItem }: ImpactPreviewProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImpactCases() {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select(`*`)
          .eq('status', 'COMPLETED')
          .order('completed_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setCases(data as Case[]);
      } catch (err) {
        console.error('Failed to load completed cases for landing', err);
      } finally {
        setLoading(false);
      }
    }
    loadImpactCases();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (cases.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          {t('landing.provenImpact')}
        </Text>
        <TouchableOpacity style={styles.seeAllBtn} onPress={onPressItem}>
          <Text style={[styles.seeAllText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
            {t('landing.stories')}
          </Text>
          <ArrowRight color={colors.primary} size={16} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={280 + 16} 
        decelerationRate="fast"
      >
        {cases.map((item) => (
          <MiniImpactCard key={item.id} item={item} onPress={onPressItem} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
  },
  loaderContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  card: {
    width: 280,
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    height: 44, // 2 lines
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 13,
  },
  amountText: {
    fontSize: 14,
  },
});
