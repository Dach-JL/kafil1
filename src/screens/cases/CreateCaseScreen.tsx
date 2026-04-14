import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../supabase/AuthContext';
import { createCase, submitCaseForReview } from '../../api/cases';
import { CaseCategory } from '../../types/cases';
import StepIndicator from '../../components/StepIndicator';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Financial from './steps/Step2Financial';
import Step3Evidence from './steps/Step3Evidence';
import Step4Review from './steps/Step4Review';

const STEPS = ['Details', 'Funding', 'Evidence', 'Review'];

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
  evidencePaths: [] as string[],
};

export default function CreateCaseScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [savedCaseId, setSavedCaseId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
        Alert.alert('Required', 'Please enter a valid funding goal.'); return false;
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
      try {
        setSubmitting(true);
        const newCase = await createCase({
          owner_id: user!.id,
          title: form.title,
          description: form.description,
          category: form.category,
          beneficiary_name: form.beneficiary_name,
          beneficiary_age: form.beneficiary_age ? parseInt(form.beneficiary_age) : undefined,
          location: form.location || undefined,
          target_amount: parseFloat(form.target_amount),
          urgency_level: form.urgency_level,
          deadline: form.deadline || undefined,
          is_anonymous: form.is_anonymous,
        } as any);
        setSavedCaseId(newCase.id);
      } catch (err: any) {
        Alert.alert('Error', 'Failed to save draft: ' + err.message);
        return;
      } finally {
        setSubmitting(false);
      }
    }

    setCurrentStep((s) => s + 1);
  }

  async function handleSubmit() {
    if (!validateStep()) return;
    if (!savedCaseId) { Alert.alert('Error', 'Case draft not found. Please go back and try again.'); return; }

    setSubmitting(true);
    try {
      await submitCaseForReview(savedCaseId);
      Alert.alert(
        '🎉 Submitted for Review!',
        'Your case has been submitted. Our team will review it within 1-3 business days. You will be notified once a decision is made.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Submission Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  }

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
          Create a Case
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
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Text style={[styles.nextButtonText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
                    {currentStep === 2 ? 'Save & Continue' : 'Next'}
                  </Text>
                  <ArrowRight color={colors.primaryForeground} size={18} />
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.accent }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color={colors.accentForeground} />
              ) : (
                <>
                  <Text style={[styles.nextButtonText, { color: colors.accentForeground, fontFamily: typography.fontFamily.medium }]}>
                    Submit for Review
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
