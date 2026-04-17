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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { submitCaseCompletionProof } from '../../api/cases';
import { ArrowLeft, CheckCircle, X as XIcon, Calendar } from 'lucide-react-native';
import FileUpload from '../../components/FileUpload';
import { useAuth } from '../../supabase/AuthContext';
import { useTranslation } from 'react-i18next';

export default function SubmitCompletionProofScreen({ route, navigation }: any) {
  const { caseId } = route.params;
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [proofPaths, setProofPaths] = useState<string[]>([]);
  const [proofHashes, setProofHashes] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [outcomeDate, setOutcomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  function handleProofUploaded(path: string, hash?: string) {
    setProofPaths((prev) => [...prev, path]);
    if (hash) setProofHashes((prev) => [...prev, hash]);
  }

  function removePhoto(pathToRemove: string) {
    setProofPaths((prev) => prev.filter(path => path !== pathToRemove));
  }

  async function handleSubmit() {
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
      await submitCaseCompletionProof(
        caseId, 
        description, 
        proofPaths,
        new Date(outcomeDate).toISOString(),
        proofHashes
      );

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
          {t('caseDetail.submitImpactReport')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          Provide verified evidence of how the funds were used. This report will be reviewed by an admin and, once approved, becomes a permanent, immutable public record.
        </Text>

        {/* Outcome Date */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            {t('caseDetail.outcomeDate')}
          </Text>
          <View style={[styles.dateInput, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Calendar color={colors.mutedForeground} size={20} />
            <TextInput
              style={[styles.dateText, { color: colors.text, fontFamily: typography.fontFamily.regular }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              value={outcomeDate}
              onChangeText={setOutcomeDate}
              maxLength={10}
            />
          </View>
          <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 4, marginLeft: 4 }}>
            The date the positive outcome actually happened.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            {t('caseDetail.successStory')}
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
            placeholder={t('caseDetail.storyPlaceholder')}
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            Impact Photos ({proofPaths.length}/5)
          </Text>
          
          <View style={styles.photoGrid}>
            {proofPaths.map((path, index) => (
              <View key={path} style={[styles.photoItem, { borderColor: colors.border }]}>
                {/* FileUpload can display existing paths if we pass it, but here we just show the results */}
                <FileUpload
                  bucket="completion-proofs"
                  userId={user?.id || 'unknown'}
                  caseId={caseId}
                  label=""
                  existingPath={path}
                  onUploadComplete={() => {}}
                  disabled={true}
                />
                <TouchableOpacity 
                  style={[styles.removeBtn, { backgroundColor: colors.destructive }]} 
                  onPress={() => removePhoto(path)}
                >
                  <XIcon color="#fff" size={14} />
                </TouchableOpacity>
              </View>
            ))}
            
            {proofPaths.length < 5 && (
              <View style={styles.photoItem}>
                <FileUpload
                  bucket="completion-proofs"
                  userId={user?.id || 'unknown'}
                  caseId={caseId}
                  label=""
                  onUploadComplete={handleProofUploaded}
                  disabled={submitting}
                />
              </View>
            )}
          </View>
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
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
  },
  storyInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    marginBottom: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    width: '48%',
    position: 'relative',
  },
  removeBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
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
