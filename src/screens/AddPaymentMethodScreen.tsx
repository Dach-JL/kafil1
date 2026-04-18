import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../supabase/AuthContext';
import { addPaymentMethod } from '../api/paymentMethods';
import { Building2, User as UserIcon, Hash, Save } from 'lucide-react-native';

const BANK_OPTIONS = [
  { id: 'CBE', translationKey: 'banks.cbe' },
  { id: 'Telebirr', translationKey: 'banks.telebirr' },
  { id: 'Ebirr', translationKey: 'banks.ebirr' }
];

export default function AddPaymentMethodScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const { profile } = useAuth();

  const [bankName, setBankName] = useState('CBE');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!accountNumber.trim() || !accountName.trim()) {
      Alert.alert(t('common.error'), t('createCase.allFieldsRequired', { defaultValue: 'Please fill in all required fields' }));
      return;
    }

    if (!profile) return;

    setSaving(true);
    try {
      await addPaymentMethod({
        user_id: profile.id,
        bank_name: bankName,
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
        is_default: false, // addPaymentMethod logic handles making it default if it's the first
      });
      Alert.alert(t('common.success'), t('profile.paymentMethodAdded', { defaultValue: 'Payment method added!' }));
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Failed to add payment method');
    } finally {
      setSaving(false);
    }
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.description, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
        {t('profile.addPaymentMethodDesc', { defaultValue: 'Add a bank account or mobile wallet to receive payouts or make donations easier.' })}
      </Text>

      <View style={styles.section}>
        <Text style={labelStyle}>{t('createCase.bankName')}</Text>
        <View style={styles.bankOptions}>
          {BANK_OPTIONS.map(({ id, translationKey }) => (
            <TouchableOpacity
              key={id}
              style={[
                styles.bankChip,
                {
                  backgroundColor: bankName === id ? colors.primary + '15' : colors.card,
                  borderColor: bankName === id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setBankName(id)}
            >
              <Text style={[styles.bankText, { color: bankName === id ? colors.primary : colors.mutedForeground, fontFamily: typography.fontFamily.medium }]}>
                {t(translationKey, { defaultValue: id })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Hash size={16} color={colors.primary} />
            <Text style={labelStyle}>{t('createCase.accountNumber')}</Text>
          </View>
          <TextInput
            style={inputStyle}
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder="1000..."
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <UserIcon size={16} color={colors.primary} />
            <Text style={labelStyle}>{t('createCase.accountName')}</Text>
          </View>
          <TextInput
            style={inputStyle}
            value={accountName}
            onChangeText={setAccountName}
            placeholder={t('auth.namePlaceholder')}
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <>
            <Save color={colors.primaryForeground} size={20} />
            <Text style={[styles.saveBtnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
              {t('buttons.saveAccount', { defaultValue: 'Save Account' })}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  section: { marginBottom: 32 },
  label: { fontSize: 14 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  bankOptions: { flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  bankChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  bankText: { fontSize: 14 },
  inputGroup: { marginBottom: 20 },
  input: {
    height: 54,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  saveBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { fontSize: 16 },
});
