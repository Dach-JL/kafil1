import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { getPublicCases } from '../../api/cases';
import { Case } from '../../types/cases';
import { useTheme } from '../../hooks/useTheme';
import { ShieldAlert, ArrowRight } from 'lucide-react-native';

interface HorizontalCaseListProps {
  onCasePress: () => void;
}

function MiniCaseCard({ item, onPress }: { item: Case; onPress: () => void }) {
  const { colors, typography } = useTheme();
  const progress = Math.min((item.collected_amount / item.target_amount) * 100, 100);

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: `https://images.unsplash.com/photo-1593113565214-80afcb4a4771?auto=format&fit=crop&q=80&w=800` }} 
          style={styles.image} 
        />
        <View style={styles.imageOverlay} />
        <View style={[styles.urgencyBadge, { backgroundColor: colors.destructive }]} >
          <ShieldAlert color="#fff" size={12} strokeWidth={3} />
          <Text style={[styles.urgencyText, { color: '#fff', fontFamily: typography.fontFamily.bold }]}>
            Urgent Info
          </Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={[styles.progressText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
              ${item.collected_amount.toLocaleString()} raised
            </Text>
            <Text style={[styles.targetText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              of ${item.target_amount.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.secondary }]}>
            <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HorizontalCaseList({ onCasePress }: HorizontalCaseListProps) {
  const { colors, typography } = useTheme();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCases() {
      try {
        const data = await getPublicCases();
        setCases(data.slice(0, 5)); // Take top 5
      } catch (err) {
        console.error('Failed to load active cases for landing', err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
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
          Urgent Cases
        </Text>
        <TouchableOpacity style={styles.seeAllBtn} onPress={onCasePress}>
          <Text style={[styles.seeAllText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
            See All
          </Text>
          <ArrowRight color={colors.primary} size={16} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={280 + 16} // card width + margin flex
        decelerationRate="fast"
      >
        {cases.map((item) => (
          <MiniCaseCard key={item.id} item={item} onPress={onCasePress} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
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
    width: 300,
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
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
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  urgencyBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 16,
    height: 48, // ensure fixed height for 2 lines
  },
  progressContainer: {
    marginTop: 'auto',
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
  },
  targetText: {
    fontSize: 12,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
