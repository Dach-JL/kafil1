import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../supabase/AuthContext';
import { addPaymentMethod } from '../api/paymentMethods';
import { User as UserIcon, Hash } from 'lucide-react-native';
import AppButton from '../components/common/AppButton';
import AppInput from '../components/common/AppInput';
import AppCard from '../components/common/AppCard';

const BANK_OPTIONS = [
  { id: 'CBE', translationKey: 'banks.cbe' },
  { id: 'Telebirr', translationKey: 'banks.telebirr' },
  { id: 'Ebirr', translationKey: 'banks.ebirr' }
];

export default function AddPaymentMethodScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const { profile } = useAuth();

  const [bankName, setBankName] = useState('CBE');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!accountNumber.trim() || !accountName.trim()) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('createCase.allFieldsRequired', { defaultValue: 'Please fill in all required fields' }));
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
        is_default: false,
      });
      Alert.alert(t('common.success', { defaultValue: 'Success' }), t('profile.paymentMethodAdded', { defaultValue: 'Payment method added!' }));
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), err.message || 'Failed to add payment method');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
          {t('profile.addPaymentMethodDesc', { defaultValue: 'Add a bank account or mobile wallet to receive payouts or make contributions easier.' })}
        </Text>

        <AppCard style={styles.card}>
          <Text style={[styles.label, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
            {t('createCase.bankName', { defaultValue: 'Select Financial Provider' })}
          </Text>
          <View style={styles.bankOptions}>
            {BANK_OPTIONS.map(({ id, translationKey }) => {
              const isSelected = bankName === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.bankChip,
                    {
                      backgroundColor: isSelected ? colors.textPrimary : colors.surface,
                      borderColor: isSelected ? colors.textPrimary : colors.border,
                    },
                  ]}
                  onPress={() => setBankName(id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.bankText, { color: isSelected ? colors.surface : colors.textPrimary, fontFamily: isSelected ? typography.fontFamily.bold : typography.fontFamily.medium }]}>
                    {t(translationKey, { defaultValue: id })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Hash size={16} color={colors.accent} />
              <Text style={[styles.label, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
                {t('createCase.accountNumber', { defaultValue: 'Account / Phone Number' })}
              </Text>
            </View>
            <AppInput
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="1000..."
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <UserIcon size={16} color={colors.accent} />
              <Text style={[styles.label, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
                {t('createCase.accountName', { defaultValue: 'Account Owner Name' })}
              </Text>
            </View>
            <AppInput
              value={accountName}
              onChangeText={setAccountName}
              placeholder="John Doe"
            />
          </View>
        </AppCard>

        <AppButton
          title={t('buttons.saveAccount', { defaultValue: 'Save Payment Account' })}
          onPress={handleSave}
          loading={saving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 20 },
  card: { padding: 20, marginBottom: 24 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  bankOptions: { flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  bankChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  bankText: { fontSize: 13 },
  inputGroup: { marginBottom: 16 },
  saveBtn: { marginTop: 4 },
});
