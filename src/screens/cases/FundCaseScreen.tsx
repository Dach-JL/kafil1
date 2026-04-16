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
  
  const [amountStr, setAmountStr] = useState('');
  const [proofPaths, setProofPaths] = useState<string[]>([]);
  const [proofHashes, setProofHashes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [caseInfo, setCaseInfo] = React.useState<Case | null>(null);
  const [fetching, setFetching] = React.useState(true);

  React.useEffect(() => {
    async function loadCase() {
      try {
        const data = await getCaseById(caseId);
        setCaseInfo(data);
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
      Alert.alert('Invalid Amount', 'Please enter a valid contribution amount.');
      return;
    }
    
    if (proofPaths.length === 0) {
      Alert.alert('Proof Required', 'Please upload a screenshot of your bank transfer or receipt.');
      return;
    }

    if (isOverAmount) {
      Alert.alert('Too Much 💝', `You are trying to give more than what's needed. The maximum remaining is $${remaining.toFixed(2)}.`);
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
        'Thank You! 💖',
        'Your contribution is pending verification. Once an admin verifies your payment proof, it will be added to the case.',
        [{ text: 'Return to Case', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit contribution.');
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
          <Text style={[styles.emptyText, { color: colors.text, fontFamily: typography.fontFamily.bold, marginTop: 16 }]}>
            Not Accepting Donations
          </Text>
          <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginTop: 8 }}>
            This case is either fully funded or not yet verified for active funding.
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
          Contribute
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            How much are you giving?
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Please enter the exact amount you transferred so we can verify the funds correctly.
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
              Maximum remaining: ${remaining.toFixed(2)}
            </Text>
          )}

          {!isOverAmount && (
            <Text style={{ color: colors.mutedForeground, marginTop: -24, marginBottom: 24, fontSize: 13 }}>
              Remaining target: ${remaining.toFixed(2)}
            </Text>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
              Proof of Payment
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              Upload a screenshot of your bank transfer, PayPal receipt, or any official proof.
            </Text>
            
            <FileUpload
              bucket="proof-of-payment"
              userId={user ? user.id : `guest_${Date.now()}`}
              caseId={caseId}
              label="Upload Receipt"
              onUploadComplete={handleProofUploaded}
              disabled={submitting || proofPaths.length >= 1}
            />
            {proofPaths.length > 0 && (
              <Text style={{ color: colors.primary, marginTop: 8, fontSize: 13 }}>
                ✓ Proof uploaded successfully
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
                  Submit Contribution
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
