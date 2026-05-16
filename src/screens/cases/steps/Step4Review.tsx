import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { palette } from '../../../theme/colors';
import { CaseCategory } from '../../../types/cases';
import { useTranslation } from 'react-i18next';
import AppCard from '../../../components/common/AppCard';

interface Step4Props {
  data: {
    title: string;
    description: string;
    category: CaseCategory;
    target_amount: string;
    urgency_level: number;
    deadline: string;
    is_anonymous: boolean;
    evidencePaths: string[];
  };
}

export default function Step4Review({ data }: Step4Props) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();

  const URGENCY_LABELS = [
    '', 
    t('urgency.low', {defaultValue:'Low'}), 
    t('urgency.medium', {defaultValue:'Medium'}), 
    t('urgency.high', {defaultValue:'High'}), 
    t('urgency.critical', {defaultValue:'Critical'}), 
    t('urgency.emergency', {defaultValue:'Emergency'})
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
        {t('createCase.reviewTitle', { defaultValue: 'Review Your Case' })}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textInverse, opacity: 0.7, fontFamily: typography.fontFamily.regular }]}>
        {t('createCase.reviewDesc', { defaultValue: 'Please review everything before submitting. Once sent for review, you cannot edit the case.' })}
      </Text>

      {/* Case Info Card */}
      <AppCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
          {data.title || '—'}
        </Text>
        <View style={[styles.badge, { backgroundColor: colors.accent + '15' }]}>
          <Text style={[styles.badgeText, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
            {t(`categories.${data.category}`)}
          </Text>
        </View>
        <Text style={[styles.desc, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]} numberOfLines={4}>
          {data.description || '—'}
        </Text>
      </AppCard>

      {/* Details Grid */}
      <AppCard style={styles.detailCard}>
        {[
          { label: t('createCase.fundingGoal', { defaultValue: 'Funding Goal' }), value: data.target_amount ? `$${parseFloat(data.target_amount).toLocaleString()}` : '—' },
          { label: t('createCase.urgency', { defaultValue: 'Urgency' }), value: URGENCY_LABELS[data.urgency_level] || '—' },
          { label: t('createCase.deadline', { defaultValue: 'Deadline' }), value: data.deadline || t('common.none', { defaultValue: 'None' }) },
          { label: t('createCase.anonymous', { defaultValue: 'Anonymous' }), value: data.is_anonymous ? t('common.yes', { defaultValue: 'Yes' }) : t('common.no', { defaultValue: 'No' }) },
          { label: t('createCase.evidenceFiles', { defaultValue: 'Evidence Files' }), value: t('createCase.filesUploaded', { count: data.evidencePaths.length, defaultValue: `${data.evidencePaths.length} file(s) uploaded` }) },
        ].map(({ label, value }, i) => (
          <View key={i} style={[styles.detailRow, { borderBottomColor: colors.accent + '10' }, i === 4 && { borderBottomWidth: 0 }]}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
              {label}
            </Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
              {value}
            </Text>
          </View>
        ))}
      </AppCard>

      <View style={[styles.warningBox, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}>
        <Text style={[styles.warningTitle, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
          {t('createCase.adminReview', { defaultValue: '🔍 Admin Review Process' })}
        </Text>
        <Text style={[styles.warningDesc, { color: colors.textInverse, opacity: 0.7, fontFamily: typography.fontFamily.regular }]}>
          {t('createCase.adminReviewDesc', { defaultValue: "Your case will be reviewed by a Kafil verifier. This usually takes 1–3 business days. You'll be notified once a decision is made." })}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  sectionTitle: { fontSize: 24, marginBottom: 10 },
  subtitle: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
  card: {
    marginBottom: 20,
    padding: 20,
  },
  cardTitle: { fontSize: 20, marginBottom: 10 },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 22,
    marginBottom: 16,
  },
  badgeText: { fontSize: 12, letterSpacing: 0.5 },
  desc: { fontSize: 15, lineHeight: 22 },
  detailCard: {
    marginBottom: 32,
    padding: 0,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  detailLabel: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 15 },
  warningBox: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 40,
  },
  warningTitle: { fontSize: 16, marginBottom: 10 },
  warningDesc: { fontSize: 14, lineHeight: 22 },
});


