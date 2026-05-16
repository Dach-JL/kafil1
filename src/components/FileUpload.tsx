import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Upload, FileText, CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { palette } from '../theme/colors';
import { uploadFile, validateFile, computeFileSHA256, StorageBucket } from '../services/storageService';

interface FileUploadProps {
  bucket: StorageBucket;
  userId: string;
  caseId?: string;
  label: string;
  onUploadComplete: (path: string, hash?: string) => void;
  existingPath?: string;
  disabled?: boolean;
}

export default function FileUpload({
  bucket,
  userId,
  caseId,
  label,
  onUploadComplete,
  existingPath,
  disabled,
}: FileUploadProps) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(!!existingPath);
  const [preview, setPreview] = useState<string | null>(null);

  async function pickAndUpload() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('common.permissionRequired', { defaultValue: 'Permission Required' }), t('common.allowPhotoAccess', { defaultValue: 'Please allow access to your photo library.' }));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const contentType = asset.mimeType ?? 'image/jpeg';
    const fileSizeBytes = asset.fileSize ?? 0;
    const fileName = `${Date.now()}_evidence.jpg`;

    // Validate file before uploading
    const validation = validateFile(contentType, fileSizeBytes);
    if (!validation.valid) {
      Alert.alert(t('common.invalidFile', { defaultValue: 'Invalid File' }), validation.error);
      return;
    }

    setUploading(true);
    try {
      // 1. Upload File
      const { path } = await uploadFile(bucket, userId, fileName, asset.uri, contentType, caseId);
      
      // 2. Compute Integrity Hash
      const hash = await computeFileSHA256(asset.uri);

      setPreview(asset.uri);
      setUploaded(true);
      onUploadComplete(path, hash);
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('Bucket not found')) {
        Alert.alert(t('common.uploadFailed', { defaultValue: 'Upload Failed' }), t('common.bucketNotConfigured', { defaultValue: 'Storage bucket is not configured. Please contact support.' }));
      } else if (msg.includes('new row violates') || msg.includes('policy')) {
        Alert.alert(t('common.uploadFailed', { defaultValue: 'Upload Failed' }), t('common.noUploadPermission', { defaultValue: 'You do not have permission to upload to this bucket. Please ensure your account profile is set up correctly.' }));
      } else {
        Alert.alert(t('common.uploadFailed', { defaultValue: 'Upload Failed' }), msg || t('common.uploadError', { defaultValue: 'An error occurred during upload. Please try again.' }));
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
        {label}
      </Text>

      <TouchableOpacity
        style={[
          styles.uploadArea,
          {
            borderColor: uploaded ? colors.accent : colors.accent + '20',
            backgroundColor: uploaded ? colors.accent + '10' : palette.navyLight,
          },
        ]}
        onPress={pickAndUpload}
        disabled={uploading || disabled}
        activeOpacity={0.7}
      >
        {uploading ? (
          <ActivityIndicator color={colors.accent} size="small" />
        ) : uploaded && preview ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: preview }} style={styles.preview} />
            <View style={[styles.checkBadge, { backgroundColor: colors.accent }]}>
              <CheckCircle2 color={colors.background} size={14} />
            </View>
          </View>
        ) : uploaded ? (
          <View style={styles.uploadedState}>
            <FileText color={colors.accent} size={28} />
            <Text style={[styles.uploadedText, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
              {t('common.fileUploaded', { defaultValue: 'File Uploaded ✓' })}
            </Text>
          </View>
        ) : (
          <View style={styles.uploadState}>
            <Upload color={colors.accent} size={28} opacity={0.6} />
            <Text style={[styles.uploadText, { color: colors.textInverse, opacity: 0.8, fontFamily: typography.fontFamily.medium }]}>
              {t('common.tapToUpload', { defaultValue: 'Tap to upload' })}
            </Text>
            <Text style={[styles.uploadHint, { color: colors.textInverse, opacity: 0.4 }]}>
              {t('common.uploadHint', { defaultValue: 'JPEG, PNG, PDF · Max 10MB' })}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 4,
    opacity: 0.9,
  },
  uploadArea: {
    height: 140,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadState: {
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 15,
    marginTop: 4,
  },
  uploadHint: {
    fontSize: 12,
  },
  uploadedState: {
    alignItems: 'center',
    gap: 10,
  },
  uploadedText: {
    fontSize: 15,
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});

