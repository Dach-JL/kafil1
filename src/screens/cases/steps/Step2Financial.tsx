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
import { palette } from '../../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { CreditCard, ExternalLink, AlertCircle, Check } from 'lucide-react-native';
import AppCard from '../../../components/common/AppCard';
import AppInput from '../../../components/common/AppInput';

interface Step2Props {
  data: {
    target_amount: string;
    urgency_level: number;
    deadline: string;
    is_anonymous: boolean;
    bank_accounts: { id: string; bank_name: string; account_number: string; account_name: string }[];
  };
  onChange: (field: string, value: any) => void;
  allProfileMethods: any[];
  onToggleBank: (bank: any) => void;
}

const URGENCY_LEVELS = [
  { level: 1, label: 'Low', color: '#22C55E' },
  { level: 2, label: 'Medium', color: '#EAB308' },
  { level: 3, label: 'High', color: '#F97316' },
  { level: 4, label: 'Critical', color: '#EF4444' },
  { level: 5, label: 'Emergency', color: '#7F1D1D' },
];

export default function Step2Financial({ data, onChange, allProfileMethods, onToggleBank }: Step2Props) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const isSelected = (id: string) => data.bank_accounts.some(acc => acc.id === id);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
        {t('createCase.fundingDetails', { defaultValue: 'Funding Details' })}
      </Text>

      {/* Target Amount */}
      <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
        {t('createCase.fundingGoalLabel', { defaultValue: 'Funding Goal (USD) *' })}
      </Text>
      <View style={[styles.amountRow, { backgroundColor: palette.navyLight, borderColor: colors.accent + '30' }]}>
        <Text style={[styles.currency, { color: colors.accent, fontFamily: typography.fontFamily.medium }]}>
          $
        </Text>
        <TextInput
          style={[styles.amountInput, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}
          placeholder="0.00"
          placeholderTextColor={colors.accent + '50'}
          value={data.target_amount}
          onChangeText={(v) => onChange('target_amount', v)}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Urgency Level */}
      <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
        {t('createCase.urgencyLabel', { defaultValue: 'Urgency Level *' })}
      </Text>
      <View style={styles.urgencyRow}>
        {URGENCY_LEVELS.map(({ level, label, color }) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.urgencyChip,
              {
                backgroundColor:
                  data.urgency_level === level ? color + '20' : palette.navyLight,
                borderColor:
                  data.urgency_level === level ? color : palette.navyLight,
              },
            ]}
            onPress={() => onChange('urgency_level', level)}
          >
            <Text style={[styles.urgencyText, { color: data.urgency_level === level ? color : colors.textInverse, opacity: data.urgency_level === level ? 1 : 0.6, fontFamily: typography.fontFamily.medium }]}>
              {t(`urgency.${label.toLowerCase()}`, { defaultValue: label })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Primary Payout Account */}
      <View style={styles.payoutHeader}>
        <Text style={[styles.payoutTitle, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
          {t('createCase.payoutDestinations', { defaultValue: 'Payout Accounts' })}
        </Text>
        <Text style={[styles.selectedCount, { color: colors.accent, fontFamily: typography.fontFamily.medium }]}>
          {data.bank_accounts.length} {t('common.selected', { defaultValue: 'Selected' })}
        </Text>
      </View>
      
      {allProfileMethods.length > 0 ? (
        <View style={styles.methodsList}>
          {allProfileMethods.map((method) => (
            <TouchableOpacity 
              key={method.id}
              onPress={() => onToggleBank(method)}
              activeOpacity={0.8}
            >
              <AppCard 
                style={[
                  styles.payoutCard, 
                  isSelected(method.id) && { borderColor: colors.accent, borderWidth: 2 }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: colors.accent + '10' }]}>
                    <CreditCard color={colors.accent} size={20} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bankName, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
                      {t(`banks.${method.bank_name.toLowerCase()}`, { defaultValue: method.bank_name })}
                    </Text>
                    <Text style={[styles.accNum, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
                      {method.account_number}
                    </Text>
                    <Text style={[styles.accName, { color: colors.textSecondary, opacity: 0.8, fontSize: 12 }]}>
                      {method.account_name}
                    </Text>
                  </View>
                  <View style={[
                    styles.checkbox, 
                    { 
                      backgroundColor: isSelected(method.id) ? colors.accent : 'transparent',
                      borderColor: isSelected(method.id) ? colors.accent : palette.navyLight
                    }
                  ]}>
                    {isSelected(method.id) && <Check color={colors.textOnPrimary} size={14} />}
                  </View>
                </View>
              </AppCard>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={[styles.manageBtn, { borderTopColor: colors.textInverse + '20' }]}
            onPress={() => navigation.navigate('PaymentMethods')}
          >
            <Text style={[styles.manageBtnText, { color: colors.accent, fontFamily: typography.fontFamily.medium }]}>
              {t('profile.manageInSettings', { defaultValue: 'Manage in Account Settings' })}
            </Text>
            <ExternalLink color={colors.accent} size={14} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.errorCard, { backgroundColor: '#fee2e2', borderColor: '#ef4444' }]}>
          <AlertCircle color="#ef4444" size={24} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.errorTitle, { color: '#991b1b', fontFamily: typography.fontFamily.bold }]}>
              {t('createCase.noPaymentMethod', { defaultValue: 'No Payout Account Found' })}
            </Text>
            <Text style={[styles.errorDesc, { color: '#991b1b' }]}>
              {t('createCase.mustAddPaymentMethod', { defaultValue: 'You must add a payout account to your profile before creating a case.' })}
            </Text>
            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: '#ef4444' }]}
              onPress={() => navigation.navigate('PaymentMethods')}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>{t('buttons.addNow', { defaultValue: 'Add in Profile' })}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Deadline */}
      <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
        {t('createCase.deadlineLabel', { defaultValue: 'Deadline (optional)' })}
      </Text>
      <AppInput
        placeholder={t('createCase.deadlinePlaceholder', { defaultValue: 'YYYY-MM-DD (e.g. 2026-06-01)' })}
        value={data.deadline}
        onChangeText={(v) => onChange('deadline', v)}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />

      <View style={{ height: 16 }} />

      {/* Anonymous Toggle */}
      <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
        {t('createCase.anonymityLabel', { defaultValue: 'Anonymity' })}
      </Text>
      <View style={[styles.toggleRow, { backgroundColor: palette.navyLight, borderColor: colors.accent + '20' }]}>
        <View style={styles.toggleInfo}>
          <Text style={[styles.toggleTitle, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
            {t('createCase.postAnonymously', { defaultValue: 'Post Anonymously' })}
          </Text>
          <Text style={[styles.toggleDesc, { color: colors.textInverse, opacity: 0.6, fontFamily: typography.fontFamily.regular }]}>
            {t('createCase.anonymousDesc', { defaultValue: 'Your name will be hidden from the public feed' })}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.toggle,
            {
              backgroundColor: data.is_anonymous ? colors.accent : colors.background,
            },
          ]}
          onPress={() => onChange('is_anonymous', !data.is_anonymous)}
        >
          <View
            style={[
              styles.toggleThumb,
              {
                backgroundColor: colors.textOnPrimary,
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
  container: { paddingBottom: 40 },
  sectionTitle: { fontSize: 20, marginBottom: 24 },
  label: { fontSize: 14, marginBottom: 8, marginLeft: 2 },
  amountRow: {
    height: 64,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  currency: { fontSize: 22, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 28 },
  urgencyRow: { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  urgencyChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  urgencyText: { fontSize: 13 },
  payoutHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 8, 
    marginBottom: 16 
  },
  payoutTitle: { fontSize: 18 },
  selectedCount: { fontSize: 12 },
  methodsList: { gap: 12, marginBottom: 24 },
  payoutCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  accNum: { fontSize: 14 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  manageBtnText: { fontSize: 13 },
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: 14, marginBottom: 4 },
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
});

