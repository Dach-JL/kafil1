import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleProofUploaded(path: string) {
    setProofPaths((prev) => [...prev, path]);
  }

    if (proofPaths.length === 0) {
      Alert.alert('Proof Required', 'Please upload at least one image of where the funds were spent.');
      return;
    }

    if (description.trim().length < 20) {
      Alert.alert('Story is too short', 'Please provide a bit more detail (at least 20 characters) about the outcome to share with your donors.');
      return;
    }

    setSubmitting(true);
    try {
      await submitCaseCompletionProof(caseId, description, proofPaths);

      Alert.alert(
        'Outcome Shared!',
        'Your success story and proof have been submitted. Once verified by an admin, this case will be finalized!',
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
          <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            The Success Story
          </Text>
          <TextInput
            style={[
              styles.storyInput, 
              { 
                color: colors.text, 
                borderColor: colors.border, 
                backgroundColor: colors.card,
                fontFamily: typography.fontFamily.regular 
              }
            ]}
            placeholder="Tell your donors how this funding changed the beneficiary's life..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <FileUpload
            bucket="completion-proofs"
            userId={user?.id || 'unknown'}
            caseId={caseId}
            label="Upload Proof (Receipts/Invoices)"
            onUploadComplete={handleProofUploaded}
            disabled={submitting || proofPaths.length >= 5}
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
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 16, marginBottom: 8, marginLeft: 4 },
  storyInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
  },
  footer: { padding: 20, borderTopWidth: 1 },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { fontSize: 18 },
});
