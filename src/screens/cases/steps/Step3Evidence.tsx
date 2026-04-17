import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import FileUpload from '../../../components/FileUpload';
import { useTranslation } from 'react-i18next';

interface Step3Props {
  userId: string;
  caseId: string;
  evidencePaths: string[];
  onEvidenceUploaded: (path: string) => void;
}

export default function Step3Evidence({ userId, caseId, evidencePaths, onEvidenceUploaded }: Step3Props) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: typography.fontFamily.heading }]}>
        {t('createCase.evidenceTitle', { defaultValue: 'Supporting Evidence' })}
      </Text>

      <Text style={[styles.description, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
        {t('createCase.evidenceDesc', { defaultValue: 'Upload documents that verify the need for this case. This increases trust and improves approval chances.' })}
      </Text>

      <View style={[styles.infoBox, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '30' }]}>
        <Text style={[styles.infoText, { color: colors.accent, fontFamily: typography.fontFamily.medium }]}>
          {t('createCase.strongEvidence', { defaultValue: '💡 Strong evidence = faster verification' })}
        </Text>
        <Text style={[styles.infoSubText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          {t('createCase.evidenceHints', { defaultValue: 'Medical reports, official letters, photos, or any supporting documents. All files are stored securely and only visible to admins.' })}
        </Text>
      </View>

      <FileUpload
        bucket="case-evidence"
        userId={userId}
        caseId={caseId}
        label={t('createCase.primaryEvidence', { defaultValue: 'Primary Evidence Document *' })}
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

      <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
        {t('createCase.fileLimits', { defaultValue: 'All files are encrypted at rest. Max 10MB per file. JPEG, PNG, PDF supported.' })}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 20, marginBottom: 12 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  infoBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoText: { fontSize: 14, marginBottom: 4 },
  infoSubText: { fontSize: 13, lineHeight: 18 },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 16 },
});
