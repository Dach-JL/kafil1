import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ShieldCheck, Clock, MapPin } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { Case, CATEGORY_LABELS } from '../types/cases';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  data: Case;
  onPress: () => void;
  style?: ViewStyle;
}

export default function PublicCaseCard({ data, onPress, style }: Props) {
  const { colors, typography } = useTheme();

  const progress = Math.min((data.collected_amount / data.target_amount) * 100, 100);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.categoryText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
            {CATEGORY_LABELS[data.category]}
          </Text>
        </View>
        
        {data.status === 'VERIFIED' || data.status === 'ACTIVE_FUNDING' ? (
          <View style={[styles.statusBadge, { backgroundColor: colors.primary + '15' }]}>
            <ShieldCheck color={colors.primary} size={14} />
            <Text style={[styles.statusText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
              Verified
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]} numberOfLines={2}>
        {data.title}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin color={colors.mutedForeground} size={14} />
          <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]} numberOfLines={1}>
            {data.location || 'Local'}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Clock color={colors.mutedForeground} size={14} />
          <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            {formatDistanceToNow(new Date(data.updated_at), { addSuffix: true })}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
      </View>

      <View style={styles.fundingRow}>
        <Text style={[styles.fundingRaised, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
          ${data.collected_amount.toLocaleString()} <Text style={[styles.fundingGoal, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>raised of ${data.target_amount.toLocaleString()}</Text>
        </Text>
        <Text style={[styles.fundingPercent, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
          {Math.round(progress)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  fundingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  fundingRaised: {
    fontSize: 16,
  },
  fundingGoal: {
    fontSize: 13,
  },
  fundingPercent: {
    fontSize: 15,
  },
});
