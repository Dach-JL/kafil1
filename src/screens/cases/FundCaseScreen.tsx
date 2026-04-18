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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../supabase/AuthContext';
import { createContribution } from '../../api/contributions';
import { getCaseById } from '../../api/cases';
import { Case } from '../../types/cases';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react-native';
import FileUpload from '../../components/FileUpload';

export default function FundCaseScreen({ route, navigation }: any) {
  const { caseId } = route.params;
  const { colors, typography } = useTheme();
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
      // Just taking the first proof path for the contribution
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
      Alert.alert(t('common.error'), err.message || 'Failed to submit contribution.');
    } finally {
      setSubmitting(false);
    }
  }

  if (fetching) {
    return (
      <View style={[styles.safe, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!caseInfo || caseInfo.status !== 'ACTIVE_FUNDING') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <AlertCircle color={colors.mutedForeground} size={48} />
          <Text style={{ fontSize: 20, color: colors.text, fontFamily: typography.fontFamily.bold, marginTop: 16 }}>
            {t('caseDetail.notAcceptingDonations', { defaultValue: 'Not Accepting Donations' })}
          </Text>
          <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginTop: 8 }}>
            {t('caseDetail.notAcceptingDonationsDesc', { defaultValue: 'This case is either fully funded or not yet verified for active funding.' })}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          {t('donation.contribute', { defaultValue: 'Contribute' })}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            {t('donation.enterAmount', { defaultValue: 'How much are you giving?' })}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            {t('donation.amountDesc', { defaultValue: 'Please enter the exact amount you transferred so we can verify the funds correctly.' })}
          </Text>

          <View style={[
            styles.inputWrapper, 
            { borderColor: isOverAmount ? colors.error : colors.border, backgroundColor: colors.card }
          ]}>
            <Text style={[styles.currency, { color: colors.mutedForeground, fontFamily: typography.fontFamily.medium }]}>$</Text>
            <TextInput
              style={[styles.input, { color: isOverAmount ? colors.error : colors.text, fontFamily: typography.fontFamily.bold }]}
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
              value={amountStr}
              onChangeText={setAmountStr}
              editable={!submitting}
            />
          </View>

          {isOverAmount && (
            <Text style={{ color: colors.error, marginTop: -24, marginBottom: 24, fontSize: 13 }}>
              {t('donation.maxRemaining', { amount: remaining.toFixed(2) })}
            </Text>
          )}

          {!isOverAmount && (
            <Text style={{ color: colors.mutedForeground, marginTop: -24, marginBottom: 24, fontSize: 13 }}>
              {t('donation.remainingTarget', { amount: remaining.toFixed(2), defaultValue: `Remaining target: $${remaining.toFixed(2)}` })}
            </Text>
          )}

          <View style={styles.section}>
            {(caseInfo.bank_accounts || []).length > 0 && (
              <View style={[styles.bankCard, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30', borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 24 }]}>
                <Text style={{ color: colors.primary, fontFamily: typography.fontFamily.medium, marginBottom: 16 }}>
                  {t('donation.sendFundsTo', { defaultValue: 'Please transfer your donation to the following account before uploading proof:' })}
                </Text>
                
                {/* Bank Selector Chips */}
                {(caseInfo.bank_accounts || []).length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    {(caseInfo.bank_accounts || []).map((acc) => (
                      <TouchableOpacity
                        key={acc.id}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: selectedBankId === acc.id ? colors.primary : colors.border,
                          backgroundColor: selectedBankId === acc.id ? colors.primary + '20' : colors.card,
                          marginRight: 8
                        }}
                        onPress={() => setSelectedBankId(acc.id)}
                      >
                        <Text style={{ color: selectedBankId === acc.id ? colors.primary : colors.text, fontFamily: typography.fontFamily.medium }}>
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
                    <View>
                      <Text style={{ color: colors.text, fontFamily: typography.fontFamily.medium, fontSize: 13, opacity: 0.7 }}>
                        {t('createCase.bankName', { defaultValue: 'Bank Name *' }).replace(' *', '')}
                      </Text>
                      <Text style={{ color: colors.text, fontFamily: typography.fontFamily.bold, fontSize: 16, marginBottom: 8 }}>
                        {t(`banks.${selectedAcc.bank_name.toLowerCase()}`, { defaultValue: selectedAcc.bank_name })}
                      </Text>

                      <Text style={{ color: colors.text, fontFamily: typography.fontFamily.medium, fontSize: 13, opacity: 0.7 }}>
                        {t('createCase.accountNumber', { defaultValue: 'Account Number *' }).replace(' *', '')}
                      </Text>
                      <Text style={{ color: colors.text, fontFamily: typography.fontFamily.bold, fontSize: 18, marginBottom: 8 }}>
                        {selectedAcc.account_number}
                      </Text>

                      <Text style={{ color: colors.text, fontFamily: typography.fontFamily.medium, fontSize: 13, opacity: 0.7 }}>
                        {t('createCase.accountName', { defaultValue: 'Account Holder Name *' }).replace(' *', '')}
                      </Text>
                      <Text style={{ color: colors.text, fontFamily: typography.fontFamily.bold, fontSize: 16 }}>
                        {selectedAcc.account_name}
                      </Text>
                    </View>
                  );
                })()}

              </View>
            )}

            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
              {t('donation.paymentMethod', { defaultValue: 'Proof of Payment' })}
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              {t('donation.proofDesc', { defaultValue: 'Upload a screenshot of your bank transfer, PayPal receipt, or any official proof.' })}
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
              <Text style={{ color: colors.primary, marginTop: 8, fontSize: 13 }}>
                ✓ {t('common.success', { defaultValue: 'Proof uploaded successfully' })}
              </Text>
            )}
          </View>

        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.submitBtn, 
              { backgroundColor: colors.primary }, 
              (submitting || isOverAmount) && { opacity: 0.5 }
            ]}
            onPress={handleSubmit}
            disabled={submitting || isOverAmount}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <>
                <Text style={[styles.submitBtnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
                  {t('donation.confirmDonation')}
                </Text>
                <Send color={colors.primaryForeground} size={18} />
              </>
            )}
          </TouchableOpacity>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18 },
  scroll: { padding: 20 },
  title: { fontSize: 24, marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 32,
    height: 72,
  },
  currency: { fontSize: 28, marginRight: 8 },
  input: { flex: 1, fontSize: 32, height: '100%' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, marginBottom: 8 },
  bankCard: {
    // Styles handled mostly inline but preserving key just in case
  },
  footer: { padding: 20, borderTopWidth: 1 },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: { fontSize: 18 },
});
