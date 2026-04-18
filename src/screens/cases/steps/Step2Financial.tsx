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

const BANK_OPTIONS = [
  { id: 'CBE', translationKey: 'banks.cbe' },
  { id: 'Telebirr', translationKey: 'banks.telebirr' },
  { id: 'Ebirr', translationKey: 'banks.ebirr' }
];

export default function Step2Financial({ data, onChange }: Step2Props) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  const [tempBankName, setTempBankName] = React.useState('CBE');
  const [tempAccNum, setTempAccNum] = React.useState('');
  const [tempAccName, setTempAccName] = React.useState('');

  const addBankAccount = () => {
    if (!tempAccNum.trim() || !tempAccName.trim()) return;
    const newAccount = {
      id: Date.now().toString(),
      bank_name: tempBankName,
      account_number: tempAccNum.trim(),
      account_name: tempAccName.trim()
    };
    onChange('bank_accounts', [...(data.bank_accounts || []), newAccount]);
    setTempAccNum('');
    setTempAccName('');
  };

  const removeBankAccount = (id: string) => {
    onChange('bank_accounts', (data.bank_accounts || []).filter(acc => acc.id !== id));
  };

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
    <ScrollView showsVerticalScrollIndicator={false}>
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

      <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: typography.fontFamily.heading, marginTop: 16 }]}>
        {t('createCase.bankInfoTitle', { defaultValue: 'Bank Details' })}
      </Text>

      {/* Added Bank Accounts List */}
      {(data.bank_accounts || []).length > 0 && (
        <View style={{ marginBottom: 16 }}>
          {(data.bank_accounts || []).map((acc) => (
            <View key={acc.id} style={[styles.addedAccountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.primary, fontFamily: typography.fontFamily.bold }}>{t(`banks.${acc.bank_name.toLowerCase()}`, { defaultValue: acc.bank_name })}</Text>
                <Text style={{ color: colors.text, fontFamily: typography.fontFamily.medium, marginTop: 4 }}>{acc.account_number}</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>{acc.account_name}</Text>
              </View>
              <TouchableOpacity onPress={() => removeBankAccount(acc.id)} style={{ padding: 8 }}>
                <Text style={{ color: colors.error, fontFamily: typography.fontFamily.medium }}>{t('buttons.delete', { defaultValue: 'Remove' })}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add New Bank Account Form */}
      <View style={[styles.addAccountContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
        <Text style={[labelStyle, { marginBottom: 12 }]}>
          {(data.bank_accounts || []).length === 0 
            ? t('createCase.addFirstAccount', { defaultValue: 'Add your first receiving account *' })
            : t('createCase.addAnotherAccount', { defaultValue: 'Add another account (Optional)' })}
        </Text>

        <Text style={labelStyle}>{t('createCase.bankName', { defaultValue: 'Bank Name *' })}</Text>
        <View style={styles.urgencyRow}>
          {BANK_OPTIONS.map(({ id, translationKey }) => (
            <TouchableOpacity
              key={id}
              style={[
                styles.urgencyChip,
                {
                  backgroundColor: tempBankName === id ? colors.primary + '20' : colors.card,
                  borderColor: tempBankName === id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setTempBankName(id)}
            >
              <Text style={[styles.urgencyText, { color: tempBankName === id ? colors.primary : colors.mutedForeground, fontFamily: typography.fontFamily.medium }]}>
                {t(translationKey, { defaultValue: id })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={labelStyle}>{t('createCase.accountNumber', { defaultValue: 'Account Number *' })}</Text>
        <TextInput
          style={inputStyle}
          placeholder="1000..."
          placeholderTextColor={colors.mutedForeground}
          value={tempAccNum}
          onChangeText={setTempAccNum}
          keyboardType="number-pad"
        />

        <Text style={labelStyle}>{t('createCase.accountName', { defaultValue: 'Account Holder Name *' })}</Text>
        <TextInput
          style={inputStyle}
          placeholder="Abebe Kebede..."
          placeholderTextColor={colors.mutedForeground}
          value={tempAccName}
          onChangeText={setTempAccName}
          autoCapitalize="words"
        />

        <TouchableOpacity 
          style={[styles.addBtn, { backgroundColor: tempAccNum && tempAccName ? colors.primary : colors.muted }]}
          disabled={!tempAccNum || !tempAccName}
          onPress={addBankAccount}
        >
          <Text style={{ color: tempAccNum && tempAccName ? colors.primaryForeground : colors.mutedForeground, fontFamily: typography.fontFamily.medium }}>
            {t('buttons.addAccount', { defaultValue: 'Add Account to List' })}
          </Text>
        </TouchableOpacity>
      </View>

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
  addAccountContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginTop: 8,
  },
  addedAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  addBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
});
