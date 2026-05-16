import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { palette } from '../theme/colors';
import { getCaseContributionSummaries } from '../api/contributions';
import { ContributionSummary } from '../types/contributions';
import { formatDistanceToNow } from 'date-fns';
import { DollarSign, Clock } from 'lucide-react-native';

interface Props {
  caseId: string;
}

export default function CaseContributionList({ caseId }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const [contributions, setContributions] = useState<ContributionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCaseContributionSummaries(caseId);
        setContributions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [caseId]);

  if (loading) {
    return <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />;
  }

  if (contributions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textInverse, opacity: 0.5, fontFamily: typography.fontFamily.regular }]}>
          {t('caseDetail.noContributions', { defaultValue: 'No contributions yet.' })}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {contributions.map((item) => (
        <View 
          key={item.id} 
          style={[styles.card, { backgroundColor: palette.navyLight, borderColor: colors.accent + '15' }]}
        >
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accent + '15' }]}>
              <DollarSign color={colors.accent} size={18} />
            </View>
            <View style={styles.content}>
              <Text style={[styles.amount, { color: colors.textInverse, fontFamily: typography.fontFamily.bold }]}>
                ${item.amount.toLocaleString()}
              </Text>
              <View style={styles.meta}>
                <Clock size={12} color={colors.textInverse} opacity={0.5} />
                <Text style={[styles.time, { color: colors.textInverse, opacity: 0.5, fontFamily: typography.fontFamily.regular }]}>
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </Text>
              </View>
            </View>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: item.status === 'VERIFIED' ? colors.accent + '20' : palette.navyLight, borderWidth: 1, borderColor: item.status === 'VERIFIED' ? colors.accent + '40' : colors.accent + '10' }
            ]}>
              <Text style={[
                styles.statusText, 
                { color: item.status === 'VERIFIED' ? colors.accent : colors.textInverse, opacity: item.status === 'VERIFIED' ? 1 : 0.6, fontFamily: typography.fontFamily.medium }
              ]}>
                {t(`statuses.${item.status}`, { defaultValue: item.status })}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyText: {
    fontSize: 14,
  },
  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  amount: {
    fontSize: 17,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

