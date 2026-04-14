import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { submitCaseCompletionProof } from '../../api/cases';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import FileUpload from '../../components/FileUpload';
import { useAuth } from '../../supabase/AuthContext';

export default function SubmitCompletionProofScreen({ route, navigation }: any) {
  const { caseId } = route.params;
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  
  const [proofPaths, setProofPaths] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function handleProofUploaded(path: string) {
    setProofPaths((prev) => [...prev, path]);
  }

  async function handleSubmit() {
    if (proofPaths.length === 0) {
      Alert.alert('Proof Required', 'Please upload evidence of where the funds were spent (e.g. medical bill receipt, invoice).');
      return;
    }

    setSubmitting(true);
    try {
      const proofUrl = proofPaths[0]; // just taking the first one
      await submitCaseCompletionProof(caseId, proofUrl);

      Alert.alert(
        'Submission Successful',
        'Your completion proof has been sent for administrative review. Once verified, the case will be permanently marked as Completed!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit proof.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          Finalize Funding
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.iconWrapper}>
          <CheckCircle color={colors.primary} size={48} />
        </View>
        <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          Upload Completion Proof
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          Congratulations on reaching your funding goal! To maintain 100% transparency on CharityTrust, please upload official receipts or invoices proving how the funds were disbursed.
        </Text>

        <View style={styles.section}>
          <FileUpload
            bucket="completion-proofs"
            userId={user?.id || 'unknown'}
            caseId={caseId}
            label="Upload Receipts/Invoices"
            onUploadComplete={handleProofUploaded}
            disabled={submitting || proofPaths.length >= 1}
          />
        </View>

      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.submitBtnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
              Submit for Review
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  iconWrapper: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 32, textAlign: 'center' },
  section: { marginBottom: 32 },
  footer: { padding: 20, borderTopWidth: 1 },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { fontSize: 18 },
});
