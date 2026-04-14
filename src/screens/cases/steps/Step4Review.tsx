import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { CaseCategory, CATEGORY_LABELS } from '../../../types/cases';

interface Step4Props {
  data: {
    title: string;
    description: string;
    category: CaseCategory;
    beneficiary_name: string;
    beneficiary_age: string;
    location: string;
    target_amount: string;
    urgency_level: number;
    deadline: string;
    is_anonymous: boolean;
    evidencePaths: string[];
  };
}

const URGENCY_LABELS = ['', 'Low', 'Medium', 'High', 'Critical', 'Emergency'];

export default function Step4Review({ data }: Step4Props) {
  const { colors, typography } = useTheme();

  const rowStyle = {
    borderBottomColor: colors.border,
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: typography.fontFamily.heading }]}>
        Review Your Case
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
        Please review everything before submitting. Once sent for review, you cannot edit the case.
      </Text>

      {/* Case Info Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          {data.title || '—'}
        </Text>
        <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.badgeText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
            {CATEGORY_LABELS[data.category]}
          </Text>
        </View>
        <Text style={[styles.desc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]} numberOfLines={3}>
          {data.description || '—'}
        </Text>
      </View>

      {/* Details Grid */}
      <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: 'Beneficiary', value: `${data.beneficiary_name}${data.beneficiary_age ? `, ${data.beneficiary_age} yrs` : ''}` },
          { label: 'Location', value: data.location || 'Not specified' },
          { label: 'Funding Goal', value: data.target_amount ? `$${parseFloat(data.target_amount).toLocaleString()}` : '—' },
          { label: 'Urgency', value: URGENCY_LABELS[data.urgency_level] || '—' },
          { label: 'Deadline', value: data.deadline || 'None' },
          { label: 'Anonymous', value: data.is_anonymous ? 'Yes' : 'No' },
          { label: 'Evidence Files', value: `${data.evidencePaths.length} file(s) uploaded` },
        ].map(({ label, value }, i) => (
          <View key={i} style={[styles.detailRow, rowStyle, i > 0 && { borderTopWidth: 1 }]}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              {label}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
              {value}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.warningBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '40' }]}>
        <Text style={[styles.warningText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
          🔍 Admin Review Process
        </Text>
        <Text style={[styles.warningDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          Your case will be reviewed by a CharityTrust verifier. This usually takes 1–3 business days. You'll be notified once a decision is made.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 20, marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, marginBottom: 8 },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeText: { fontSize: 12 },
  desc: { fontSize: 13, lineHeight: 18 },
  detailCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13 },
  warningBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
  },
  warningText: { fontSize: 14, marginBottom: 6 },
  warningDesc: { fontSize: 13, lineHeight: 18 },
});
