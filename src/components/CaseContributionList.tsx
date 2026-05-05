import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { getCaseContributionSummaries } from '../api/contributions';
import { ContributionSummary } from '../types/contributions';
import { formatDistanceToNow } from 'date-fns';
import { DollarSign, Clock, AlertCircle } from 'lucide-react-native';

interface Props {
  caseId: string;
}

export default function CaseContributionList({ caseId }: Props) {
  const { colors, typography } = useTheme();
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
    return <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />;
  }

  if (contributions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
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
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '10' }]}>
              <DollarSign color={colors.primary} size={18} />
            </View>
            <View style={styles.content}>
              <Text style={[styles.amount, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                ${item.amount.toLocaleString()}
              </Text>
              <View style={styles.meta}>
                <Clock size={12} color={colors.mutedForeground} />
                <Text style={[styles.time, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </Text>
              </View>
            </View>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: item.status === 'VERIFIED' ? colors.primary + '20' : colors.secondary }
            ]}>
              <Text style={[
                styles.statusText, 
                { color: item.status === 'VERIFIED' ? colors.primary : colors.mutedForeground, fontFamily: typography.fontFamily.medium }
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
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  amount: {
    fontSize: 16,
    marginBottom: 2,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
  },
});
