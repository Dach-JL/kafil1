import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../supabase/AuthContext';
import { createContribution } from '../../api/contributions';
import { getCaseById } from '../../api/cases';
import { Case } from '../../types/cases';
import { ArrowLeft, AlertCircle, CheckCircle2, Building2 } from 'lucide-react-native';
import FileUpload from '../../components/FileUpload';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';

export default function FundCaseScreen({ route, navigation }: any) {
  const { caseId } = route.params;
  const { colors, typography, spacing } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [amountStr, setAmountStr] = useState('');
  const [proofPaths, setProofPaths] = useState<string[]>([]);
  const [proofHashes, setProofHashes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [caseInfo, setCaseInfo] = React.useState<Case | null>(null);
  const [fetching, setFetching] = React.useState(true);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadCase() {
      try {
        const data = await getCaseById(caseId);
        setCaseInfo(data);
        if (data?.bank_accounts && data.bank_accounts.length > 0) {
          setSelectedBankId(data.bank_accounts[0].id);
        }
      } catch (err) {
        console.error('Failed to load case:', err);
      } finally {
        setFetching(false);
      }
    }
    loadCase();
  }, [caseId]);

  const remaining = caseInfo ? (caseInfo.target_amount - (caseInfo.collected_amount || 0)) : 0;
  const isOverAmount = parseFloat(amountStr) > remaining;

  function handleProofUploaded(path: string, hash?: string) {
    setProofPaths((prev) => [...prev, path]);
    if (hash) setProofHashes((prev) => [...prev, hash]);
  }

  async function handleSubmit() {
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(
        t('common.invalidAmount', { defaultValue: 'Invalid Amount' }), 
        t('donation.invalidAmountDesc', { defaultValue: 'Please enter a valid contribution amount.' })
      );
      return;
    }
    
    if (proofPaths.length === 0) {
      Alert.alert(
        t('common.proofRequired', { defaultValue: 'Proof Required' }), 
        t('donation.uploadProofDesc', { defaultValue: 'Please upload a screenshot of your bank transfer or receipt.' })
      );
      return;
    }

    if (isOverAmount) {
      Alert.alert(
        t('donation.tooMuch', { defaultValue: 'Too Much 💝' }), 
        t('donation.tooMuchDesc', { max: remaining.toFixed(2), defaultValue: `You are trying to give more than what's needed. The maximum remaining is $${remaining.toFixed(2)}.` })
      );
      return;
    }

    setSubmitting(true);
    try {
      const paymentProofUrl = proofPaths[0];
      const paymentProofHash = proofHashes[0];

      await createContribution({
        case_id: caseId,
        donor_id: user ? user.id : null,
        amount,
        payment_proof_url: paymentProofUrl,
        payment_proof_hash: paymentProofHash,
      });

      Alert.alert(
        t('donation.thankYou', { defaultValue: 'Thank You! 💖' }),
        t('donation.contributionPendingDesc', { defaultValue: 'Your contribution is pending verification. Once an admin verifies your payment proof, it will be added to the case.' }),
        [{ text: t('buttons.returnToCase', { defaultValue: 'Return to Case' }), onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), err.message || 'Failed to submit contribution.');
    } finally {
      setSubmitting(false);
    }
  }

  if (fetching) {
    return (
      <View style={[styles.safe, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!caseInfo || caseInfo.status !== 'ACTIVE_FUNDING') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color={colors.accent} size={22} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <AlertCircle color={colors.accent} size={48} />
          <Text style={{ fontSize: 20, color: colors.textPrimary, fontFamily: typography.fontFamily.heading, marginTop: 16 }}>
            {t('caseDetail.notAcceptingDonations', { defaultValue: 'Not Accepting Donations' })}
          </Text>
          <Text style={{ textAlign: 'center', color: colors.textSecondary, fontFamily: typography.fontFamily.regular, marginTop: 8 }}>
            {t('caseDetail.notAcceptingDonationsDesc', { defaultValue: 'This case is either fully funded or not yet verified for active funding.' })}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={colors.accent} size={22} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
          {t('donation.contribute', { defaultValue: 'Contribute' })}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
            {t('donation.enterAmount', { defaultValue: 'How much are you giving?' })}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            {t('donation.amountDesc', { defaultValue: 'Please enter the exact amount you transferred so we can verify the funds correctly.' })}
          </Text>

          {/* Amount Input Box */}
          <View style={[
            styles.inputWrapper, 
            { borderColor: isOverAmount ? colors.error : colors.border, backgroundColor: colors.surface }
          ]}>
            <Text style={[styles.currency, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>$</Text>
            <TextInput
              style={[styles.input, { color: isOverAmount ? colors.error : colors.textPrimary, fontFamily: typography.fontFamily.bold }]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={amountStr}
              onChangeText={setAmountStr}
              editable={!submitting}
            />
          </View>

          {isOverAmount ? (
            <Text style={{ color: colors.error, marginTop: -20, marginBottom: 24, fontSize: 13, fontFamily: typography.fontFamily.medium }}>
              {t('donation.maxRemaining', { amount: remaining.toFixed(2), defaultValue: `Maximum remaining: $${remaining.toFixed(2)}` })}
            </Text>
          ) : (
            <Text style={{ color: colors.textSecondary, marginTop: -20, marginBottom: 24, fontSize: 13, fontFamily: typography.fontFamily.medium }}>
              {t('donation.remainingTarget', { amount: remaining.toFixed(2), defaultValue: `Remaining target: $${remaining.toFixed(2)}` })}
            </Text>
          )}

          {/* Bank Transfer Details Card */}
          <View style={styles.section}>
            {(caseInfo.bank_accounts || []).length > 0 && (
              <AppCard style={styles.bankCard}>
                <View style={styles.bankHeaderRow}>
                  <Building2 color={colors.accent} size={18} />
                  <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.bold, fontSize: 14 }}>
                    {t('donation.sendFundsTo', { defaultValue: 'Transfer funds to the account below:' })}
                  </Text>
                </View>
                
                {/* Bank Selector Chips */}
                {(caseInfo.bank_accounts || []).length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    {(caseInfo.bank_accounts || []).map((acc) => (
                      <TouchableOpacity
                        key={acc.id}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: selectedBankId === acc.id ? colors.textPrimary : colors.border,
                          backgroundColor: selectedBankId === acc.id ? colors.textPrimary : colors.surface,
                          marginRight: 8
                        }}
                        onPress={() => setSelectedBankId(acc.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={{ color: selectedBankId === acc.id ? colors.surface : colors.textPrimary, fontFamily: typography.fontFamily.bold, fontSize: 12 }}>
                          {t(`banks.${acc.bank_name.toLowerCase()}`, { defaultValue: acc.bank_name })}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {/* Selected Bank Details */}
                {(() => {
                  const selectedAcc = (caseInfo.bank_accounts || []).find((a) => a.id === selectedBankId) || caseInfo.bank_accounts?.[0];
                  if (!selectedAcc) return null;
                  return (
                    <View style={styles.bankDetails}>
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{t('createCase.bankName', { defaultValue: 'BANK NAME' }).replace(' *', '')}</Text>
                        <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{t(`banks.${selectedAcc.bank_name.toLowerCase()}`, { defaultValue: selectedAcc.bank_name })}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{t('createCase.accountNumber', { defaultValue: 'ACCOUNT NUMBER' }).replace(' *', '')}</Text>
                        <Text style={[styles.detailValueLarge, { color: colors.accent }]}>{selectedAcc.account_number}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{t('createCase.accountName', { defaultValue: 'ACCOUNT NAME' }).replace(' *', '')}</Text>
                        <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{selectedAcc.account_name}</Text>
                      </View>
                    </View>
                  );
                })()}
              </AppCard>
            )}

            {/* Proof Uploader */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
              {t('donation.paymentMethod', { defaultValue: 'Proof of Payment' })}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular, marginBottom: 16 }]}>
              {t('donation.proofDesc', { defaultValue: 'Upload a screenshot of your bank transfer or official receipt.' })}
            </Text>
            
            <FileUpload
              bucket="proof-of-payment"
              userId={user ? user.id : `guest_${Date.now()}`}
              caseId={caseId}
              label={t('common.upload', { defaultValue: 'Upload Receipt' })}
              onUploadComplete={handleProofUploaded}
              disabled={submitting || proofPaths.length >= 1}
            />
            {proofPaths.length > 0 && (
              <View style={styles.successBadge}>
                <CheckCircle2 color={colors.success} size={18} />
                <Text style={{ color: colors.success, fontFamily: typography.fontFamily.bold, fontSize: 13 }}>
                  {t('common.success', { defaultValue: 'Proof uploaded successfully' })}
                </Text>
              </View>
            )}
          </View>

        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <AppButton
            title={t('donation.confirmDonation', { defaultValue: 'Submit Contribution' })}
            onPress={handleSubmit}
            loading={submitting}
            disabled={isOverAmount || proofPaths.length === 0}
            style={styles.submitBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17 },
  scroll: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 24, marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, lineHeight: 18, marginBottom: 20 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 28,
    height: 72,
  },
  currency: { fontSize: 28, marginRight: 8 },
  input: { flex: 1, fontSize: 32, height: '100%' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, marginBottom: 6 },
  bankCard: {
    padding: 18,
    marginBottom: 24,
  },
  bankHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  bankDetails: { gap: 12 },
  detailRow: { gap: 2 },
  detailLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 15, fontWeight: '600' },
  detailValueLarge: { fontSize: 22, fontWeight: '700', letterSpacing: 0.5 },
  successBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  footer: { padding: 16, borderTopWidth: 1 },
  submitBtn: {
    height: 54,
  },
});
