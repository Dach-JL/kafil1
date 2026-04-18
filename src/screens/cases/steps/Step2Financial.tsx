import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../hooks/useTheme';

import { useNavigation } from '@react-navigation/native';
import { CreditCard, ExternalLink, AlertCircle } from 'lucide-react-native';

interface Step2Props {
  data: {
    target_amount: string;
    urgency_level: number;
    deadline: string;
    is_anonymous: boolean;
    bank_accounts: { id: string; bank_name: string; account_number: string; account_name: string }[];
  };
  onChange: (field: string, value: any) => void;
}

const URGENCY_LEVELS = [
  { level: 1, label: 'Low', color: '#22C55E' },
  { level: 2, label: 'Medium', color: '#EAB308' },
  { level: 3, label: 'High', color: '#F97316' },
  { level: 4, label: 'Critical', color: '#EF4444' },
  { level: 5, label: 'Emergency', color: '#7F1D1D' },
];

export default function Step2Financial({ data, onChange }: Step2Props) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const primaryAccount = data.bank_accounts[0];

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.card,
      color: colors.text,
      borderColor: colors.border,
      fontFamily: typography.fontFamily.regular,
    },
  ];

  const labelStyle = [
    styles.label,
    { color: colors.text, fontFamily: typography.fontFamily.medium },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: typography.fontFamily.heading }]}>
        {t('createCase.fundingDetails', { defaultValue: 'Funding Details' })}
      </Text>

      {/* Target Amount */}
      <Text style={labelStyle}>{t('createCase.fundingGoalLabel', { defaultValue: 'Funding Goal (USD) *' })}</Text>
      <View style={[styles.amountRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.currency, { color: colors.mutedForeground, fontFamily: typography.fontFamily.medium }]}>
          $
        </Text>
        <TextInput
          style={[styles.amountInput, { color: colors.text, fontFamily: typography.fontFamily.bold }]}
          placeholder="0.00"
          placeholderTextColor={colors.mutedForeground}
          value={data.target_amount}
          onChangeText={(v) => onChange('target_amount', v)}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Urgency Level */}
      <Text style={labelStyle}>{t('createCase.urgencyLabel', { defaultValue: 'Urgency Level *' })}</Text>
      <View style={styles.urgencyRow}>
        {URGENCY_LEVELS.map(({ level, label, color }) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.urgencyChip,
              {
                backgroundColor:
                  data.urgency_level === level ? color + '20' : colors.card,
                borderColor:
                  data.urgency_level === level ? color : colors.border,
              },
            ]}
            onPress={() => onChange('urgency_level', level)}
          >
            <Text style={[styles.urgencyText, { color: data.urgency_level === level ? color : colors.mutedForeground, fontFamily: typography.fontFamily.medium }]}>
              {t(`urgency.${label.toLowerCase()}`, { defaultValue: label })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Primary Payout Account (Read Only) */}
      <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: typography.fontFamily.heading, marginTop: 16 }]}>
        {t('createCase.payoutDestination', { defaultValue: 'Payout Destination' })}
      </Text>
      
      {primaryAccount ? (
        <View style={[styles.payoutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
              <CreditCard color={colors.primary} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bankName, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
                {t(`banks.${primaryAccount.bank_name.toLowerCase()}`, { defaultValue: primaryAccount.bank_name })}
              </Text>
              <Text style={[styles.accNum, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
                {primaryAccount.account_number}
              </Text>
              <Text style={[styles.accName, { color: colors.mutedForeground }]}>
                {primaryAccount.account_name}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.manageBtn, { borderTopColor: colors.border + '40' }]}
            onPress={() => navigation.navigate('PaymentMethods')}
          >
            <Text style={[styles.manageBtnText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.medium }]}>
              {t('profile.changeDefaultInSettings', { defaultValue: 'Change in Account Settings' })}
            </Text>
            <ExternalLink color={colors.mutedForeground} size={14} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.errorCard, { backgroundColor: colors.error + '10', borderColor: colors.error }]}>
          <AlertCircle color={colors.error} size={24} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.errorTitle, { color: colors.error, fontFamily: typography.fontFamily.bold }]}>
              {t('createCase.noPaymentMethod', { defaultValue: 'No Payout Account Found' })}
            </Text>
            <Text style={[styles.errorDesc, { color: colors.error }]}>
              {t('createCase.mustAddPaymentMethod', { defaultValue: 'You must add a payout account to your profile before creating a case.' })}
            </Text>
            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: colors.error }]}
              onPress={() => navigation.navigate('PaymentMethods')}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>{t('buttons.addNow', { defaultValue: 'Add in Profile' })}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Deadline */}
      <Text style={labelStyle}>{t('createCase.deadlineLabel', { defaultValue: 'Deadline (optional)' })}</Text>
      <TextInput
        style={inputStyle}
        placeholder={t('createCase.deadlinePlaceholder', { defaultValue: 'YYYY-MM-DD (e.g. 2026-06-01)' })}
        placeholderTextColor={colors.mutedForeground}
        value={data.deadline}
        onChangeText={(v) => onChange('deadline', v)}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />

      {/* Anonymous Toggle */}
      <Text style={labelStyle}>{t('createCase.anonymityLabel', { defaultValue: 'Anonymity' })}</Text>
      <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.toggleInfo}>
          <Text style={[styles.toggleTitle, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            {t('createCase.postAnonymously', { defaultValue: 'Post Anonymously' })}
          </Text>
          <Text style={[styles.toggleDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            {t('createCase.anonymousDesc', { defaultValue: 'Your name will be hidden from the public feed' })}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.toggle,
            {
              backgroundColor: data.is_anonymous ? colors.primary : colors.muted,
            },
          ]}
          onPress={() => onChange('is_anonymous', !data.is_anonymous)}
        >
          <View
            style={[
              styles.toggleThumb,
              {
                backgroundColor: colors.primaryForeground,
                transform: [{ translateX: data.is_anonymous ? 20 : 2 }],
              },
            ]}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 20, marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 6, marginLeft: 2 },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  amountRow: {
    height: 60,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  currency: { fontSize: 22, marginRight: 6 },
  amountInput: { flex: 1, fontSize: 26 },
  urgencyRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  urgencyChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  urgencyText: { fontSize: 13 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: 14, marginBottom: 2 },
  toggleDesc: { fontSize: 12 },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  payoutCard: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: { fontSize: 16, marginBottom: 2 },
  accNum: { fontSize: 15 },
  accName: { fontSize: 13, marginTop: 4 },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 6,
  },
  manageBtnText: { fontSize: 12 },
  errorCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 24,
  },
  errorTitle: { fontSize: 16, marginBottom: 4 },
  errorDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  addBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
