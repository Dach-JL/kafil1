import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { palette } from '../theme/colors';
import { Case } from '../types/cases';
import { useTranslation } from 'react-i18next';
import TrustBadge from './TrustBadge';
import AppCard from './common/AppCard';

interface Props {
  data: Case;
  onPress: () => void;
  style?: ViewStyle;
}

export default function PublicCaseCard({ data, onPress, style }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();

  const progress = Math.min((data.collected_amount / data.target_amount) * 100, 100);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <AppCard style={style}>
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '20' }]}>
            <Text style={[styles.categoryText, { color: colors.accent, fontFamily: typography.fontFamily.medium }]}>
              {t(`categories.${data.category}`)}
            </Text>
          </View>
          
          {(data.status === 'VERIFIED' || data.status === 'ACTIVE_FUNDING') && (
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' }]}>
              <ShieldCheck color="#22C55E" size={12} />
              <Text style={[styles.statusText, { color: '#22C55E', fontFamily: typography.fontFamily.bold }]}>
                {t('statuses.VERIFIED')}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: colors.textInverse, fontFamily: typography.fontFamily.heading }]} numberOfLines={2}>
          {data.title}
        </Text>

        {data.owner && (
          <View style={styles.ownerRow}>
            <Text style={[styles.ownerName, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
              {t('common.by', { defaultValue: 'by' })} {data.owner.name}
            </Text>
            <TrustBadge score={data.owner.trust_score} />
          </View>
        )}

        <View style={[styles.progressTrack, { backgroundColor: colors.background }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.accent, width: `${progress}%` }]} />
        </View>

        <View style={styles.fundingRow}>
          <View style={styles.amountGroup}>
            <Text style={[styles.fundingRaised, { color: colors.textInverse, fontFamily: typography.fontFamily.bold }]}>
              ${data.collected_amount.toLocaleString()}
            </Text>
            <Text style={[styles.fundingGoal, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
              {t('common.of')} ${data.target_amount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.percentGroup}>
            <Text style={[styles.fundingPercent, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
              {Math.round(progress)}%
            </Text>
          </View>
        </View>

      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 12,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  ownerName: {
    fontSize: 13,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  fundingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  fundingRaised: {
    fontSize: 18,
  },
  fundingGoal: {
    fontSize: 13,
  },
  percentGroup: {},
  fundingPercent: {
    fontSize: 16,
  },
});


