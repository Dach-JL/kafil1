import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { palette } from '../theme/colors';
import { useAuth } from '../supabase/AuthContext';
import { addPaymentMethod } from '../api/paymentMethods';
import { User as UserIcon, Hash } from 'lucide-react-native';
import AppButton from '../components/common/AppButton';
import AppInput from '../components/common/AppInput';

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
        is_default: false,
      });
      Alert.alert(t('common.success'), t('profile.paymentMethodAdded', { defaultValue: 'Payment method added!' }));
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Failed to add payment method');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.description, { color: colors.textInverse, opacity: 0.6, fontFamily: typography.fontFamily.medium }]}>
        {t('profile.addPaymentMethodDesc', { defaultValue: 'Add a bank account or mobile wallet to receive payouts or make donations easier.' })}
      </Text>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.bold }]}>
          {t('createCase.bankName')}
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
                    backgroundColor: isSelected ? colors.accent : palette.navyLight,
                    borderColor: isSelected ? colors.accent : colors.accent + '20',
                  },
                ]}
                onPress={() => setBankName(id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.bankText, { color: isSelected ? colors.background : colors.textInverse, fontFamily: isSelected ? typography.fontFamily.bold : typography.fontFamily.medium, opacity: isSelected ? 1 : 0.6 }]}>
                  {t(translationKey, { defaultValue: id })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Hash size={18} color={colors.accent} />
            <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.bold }]}>
              {t('createCase.accountNumber')}
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
            <UserIcon size={18} color={colors.accent} />
            <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.bold }]}>
              {t('createCase.accountName')}
            </Text>
          </View>
          <AppInput
            value={accountName}
            onChangeText={setAccountName}
            placeholder={t('auth.namePlaceholder')}
          />
        </View>
      </View>

      <AppButton
        title={t('buttons.saveAccount', { defaultValue: 'Save Account' })}
        onPress={handleSave}
        loading={saving}
        style={styles.saveBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 60 },
  description: { fontSize: 15, lineHeight: 24, marginBottom: 32 },
  section: { marginBottom: 32 },
  label: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  bankOptions: { flexDirection: 'row', gap: 12, marginBottom: 40, marginTop: 16, flexWrap: 'wrap' },
  bankChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  bankText: { fontSize: 14 },
  inputGroup: { marginBottom: 28 },
  saveBtn: { marginTop: 12 },
});

