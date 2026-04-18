import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Send, AlertCircle, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../supabase/AuthContext';
import { createCase } from '../../api/cases';
import { useSubmitCase } from '../../hooks/useSubmitCase';
import { CaseCategory } from '../../types/cases';
import StepIndicator from '../../components/StepIndicator';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Financial from './steps/Step2Financial';
import Step3Evidence from './steps/Step3Evidence';
import Step4Review from './steps/Step4Review';
import { useTranslation } from 'react-i18next';

const INITIAL_FORM = {
  title: '',
  description: '',
  category: 'MEDICAL' as CaseCategory,
  beneficiary_name: '',
  beneficiary_age: '',
  location: '',
  target_amount: '',
  urgency_level: 3,
  deadline: '',
  is_anonymous: false,
  bank_accounts: [] as { id: string; bank_name: string; account_number: string; account_name: string }[],
  evidencePaths: [] as string[],
};

export default function CreateCaseScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [savedCaseId, setSavedCaseId] = useState<string | null>(null);

  const STEPS = (t('createCase.steps', { returnObjects: true }) as string[]) || ['Details', 'Funding', 'Evidence', 'Review'];
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { submit, state: submitState, error: submitError, submittedCase, retry } = useSubmitCase();

  function updateField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleEvidenceUploaded(path: string) {
    setForm((prev) => ({
      ...prev,
      evidencePaths: [...prev.evidencePaths, path],
    }));
  }

  function validateStep(): boolean {
    if (currentStep === 1) {
      if (!form.title.trim()) { Alert.alert('Required', 'Please enter a case title.'); return false; }
      if (!form.description.trim() || form.description.length < 50) {
        Alert.alert('Required', 'Description must be at least 50 characters.'); return false;
      }
      if (!form.beneficiary_name.trim()) { Alert.alert('Required', 'Please enter the beneficiary name.'); return false; }
    }
    if (currentStep === 2) {
      const amount = parseFloat(form.target_amount);
      if (!form.target_amount || isNaN(amount) || amount <= 0) {
        Alert.alert(t('common.error'), t('errors.requiredField', { defaultValue: 'Please enter a valid funding goal.' })); 
        return false;
      }
      if (form.bank_accounts.length === 0) {
        Alert.alert(t('common.error'), t('errors.requiredField', { defaultValue: 'Please add at least one bank account.' }));
        return false;
      }
    }
    if (currentStep === 3) {
      if (form.evidencePaths.length === 0) {
        Alert.alert('Required', 'Please upload at least one supporting document.'); return false;
      }
    }
    return true;
  }

  async function saveDraftAndNext() {
    if (!validateStep()) return;

    // Auto-save draft when moving from step 2 → 3
    if (currentStep === 2 && !savedCaseId) {
      if (!user) {
        Alert.alert('Error', 'You must be logged in to create a case.');
        return;
      }

      try {
        setIsSavingDraft(true);
        
        // Prepare clean data for Supabase (avoiding empty strings for numbers/dates)
        const targetAmount = parseFloat(form.target_amount);
        const age = form.beneficiary_age ? parseInt(form.beneficiary_age) : null;
        const deadline = form.deadline.trim() ? form.deadline : null;
        
        const newCase = await createCase({
          owner_id: user.id,
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          beneficiary_name: form.beneficiary_name.trim(),
          beneficiary_age: age || undefined,
          location: form.location.trim() || undefined,
          target_amount: targetAmount,
          urgency_level: form.urgency_level,
          deadline: deadline || undefined,
          is_anonymous: form.is_anonymous,
          bank_accounts: form.bank_accounts,
        } as any);

        if (newCase?.id) {
          setSavedCaseId(newCase.id);
        } else {
          throw new Error('No case ID returned from server');
        }
      } catch (err: any) {
        console.error('Draft Save Error:', err);
        Alert.alert('Save Failed', err.message || 'Could not save case draft. Please check your connection.');
        return; // Stop transition if save failed
      } finally {
        setIsSavingDraft(false);
      }
    }

    setCurrentStep((s) => s + 1);
  }

  async function handleSubmit() {
    if (!validateStep()) return;
    if (!savedCaseId) { Alert.alert('Error', 'Case draft not found. Please go back and try again.'); return; }
    await submit(savedCaseId);
  }

  // Navigate to success screen on successful submission
  useEffect(() => {
    if (submitState === 'success' && submittedCase) {
      navigation.replace('SubmissionSuccess', { submittedCase });
    }
  }, [submitState, submittedCase]);

  const reviewData = {
    ...form,
    category: form.category,
    evidencePaths: form.evidencePaths,
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => currentStep > 1 ? setCurrentStep(s => s - 1) : navigation.goBack()}>
          <ArrowLeft color={colors.text} size={22} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          {t('cases.newCase')}
        </Text>
        <Text style={[styles.stepCount, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          {currentStep}/4
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Step Indicator */}
        <View style={styles.indicatorContainer}>
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </View>

        {/* Step Content */}
        <View style={styles.content}>
          {currentStep === 1 && (
            <Step1BasicInfo data={form} onChange={updateField} />
          )}
          {currentStep === 2 && (
            <Step2Financial data={form} onChange={updateField} />
          )}
          {currentStep === 3 && savedCaseId && (
            <Step3Evidence
              userId={user!.id}
              caseId={savedCaseId}
              evidencePaths={form.evidencePaths}
              onEvidenceUploaded={handleEvidenceUploaded}
            />
          )}
          {currentStep === 3 && !savedCaseId && (
            <Step3Evidence
              userId={user!.id}
              caseId="draft"
              evidencePaths={form.evidencePaths}
              onEvidenceUploaded={handleEvidenceUploaded}
            />
          )}
          {currentStep === 4 && <Step4Review data={reviewData} />}
        </View>

        {/* Navigation Buttons */}
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          {currentStep < 4 ? (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
              onPress={saveDraftAndNext}
              disabled={isSavingDraft}
              activeOpacity={0.85}
            >
              {isSavingDraft ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Text style={[styles.nextButtonText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
                    {currentStep === 2 ? t('buttons.continue') : t('buttons.next')}
                  </Text>
                  <ArrowRight color={colors.primaryForeground} size={18} />
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.accent }]}
              onPress={handleSubmit}
              disabled={submitState === 'submitting'}
              activeOpacity={0.85}
            >
              {submitState === 'submitting' ? (
                <ActivityIndicator color={colors.accentForeground} />
              ) : (
                <>
                  <Text style={[styles.nextButtonText, { color: colors.accentForeground, fontFamily: typography.fontFamily.medium }]}>
                    {t('createCase.submitForReview')}
                  </Text>
                  <Send color={colors.accentForeground} size={18} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18 },
  stepCount: { fontSize: 13 },
  indicatorContainer: { paddingTop: 20, paddingHorizontal: 8 },
  content: { flex: 1, paddingHorizontal: 20 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  nextButton: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: { fontSize: 16 },
});
