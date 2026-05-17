import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { palette } from '../../../theme/colors';
import FileUpload from '../../../components/FileUpload';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react-native';

interface Step3Props {
  userId: string;
  caseId: string;
  evidencePaths: string[];
  onEvidenceUploaded: (path: string) => void;
}

export default function Step3Evidence({ userId, caseId, evidencePaths, onEvidenceUploaded }: Step3Props) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
        {t('createCase.evidenceTitle', { defaultValue: 'Supporting Evidence' })}
      </Text>

      <Text style={[styles.description, { color: colors.textInverse, opacity: 0.7, fontFamily: typography.fontFamily.regular }]}>
        {t('createCase.evidenceDesc', { defaultValue: 'Upload documents that verify the need for this case. This increases trust and improves approval chances.' })}
      </Text>

      <View style={[styles.infoBox, { backgroundColor: palette.navyLight, borderColor: colors.accent + '30' }]}>
        <View style={styles.infoHeader}>
          <Info color={colors.accent} size={18} />
          <Text style={[styles.infoText, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
            {t('createCase.strongEvidence', { defaultValue: 'Verification Tip' })}
          </Text>
        </View>
        <Text style={[styles.infoSubText, { color: colors.textInverse, opacity: 0.7, fontFamily: typography.fontFamily.regular }]}>
          {t('createCase.evidenceHints', { defaultValue: 'Medical reports, official letters, photos, or any supporting documents help us verify your case faster.' })}
        </Text>
      </View>

      <FileUpload
        bucket="case-evidence"
        userId={userId}
        caseId={caseId}
        label={t('createCase.primaryEvidence', { defaultValue: 'Primary Evidence Document (optional)' })}
        onUploadComplete={onEvidenceUploaded}
        existingPath={evidencePaths[0]}
      />

      <FileUpload
        bucket="case-evidence"
        userId={userId}
        caseId={caseId}
        label={t('createCase.supportDoc2', { defaultValue: 'Supporting Document 2 (optional)' })}
        onUploadComplete={onEvidenceUploaded}
        existingPath={evidencePaths[1]}
      />

      <FileUpload
        bucket="case-evidence"
        userId={userId}
        caseId={caseId}
        label={t('createCase.supportDoc3', { defaultValue: 'Supporting Document 3 (optional)' })}
        onUploadComplete={onEvidenceUploaded}
        existingPath={evidencePaths[2]}
      />

      <Text style={[styles.hint, { color: colors.textInverse, opacity: 0.3, fontFamily: typography.fontFamily.regular }]}>
        {t('createCase.fileLimits', { defaultValue: 'All files are encrypted at rest. Max 10MB per file. JPEG, PNG, PDF supported.' })}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  sectionTitle: { fontSize: 24, marginBottom: 12 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
  infoBox: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 32,
    gap: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: { fontSize: 14 },
  infoSubText: { fontSize: 13, lineHeight: 20 },
  hint: { fontSize: 11, textAlign: 'center', marginTop: 16, marginBottom: 24 },
});


