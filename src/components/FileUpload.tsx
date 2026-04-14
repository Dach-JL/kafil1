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
import { Upload, X, FileText, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
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
  const { colors, typography } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(!!existingPath);
  const [preview, setPreview] = useState<string | null>(null);

  async function pickAndUpload() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      Alert.alert('Invalid File', validation.error);
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
      Alert.alert('Upload Failed', err.message ?? 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
        {label}
      </Text>

      <TouchableOpacity
        style={[
          styles.uploadArea,
          {
            borderColor: uploaded ? colors.accent : colors.border,
            backgroundColor: uploaded ? colors.accent + '10' : colors.card,
          },
        ]}
        onPress={pickAndUpload}
        disabled={uploading || disabled}
        activeOpacity={0.7}
      >
        {uploading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : uploaded && preview ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: preview }} style={styles.preview} />
            <CheckCircle color={colors.accent} size={20} style={styles.checkIcon} />
          </View>
        ) : uploaded ? (
          <View style={styles.uploadedState}>
            <FileText color={colors.accent} size={24} />
            <Text style={[styles.uploadedText, { color: colors.accent, fontFamily: typography.fontFamily.medium }]}>
              File Uploaded ✓
            </Text>
          </View>
        ) : (
          <View style={styles.uploadState}>
            <Upload color={colors.mutedForeground} size={24} />
            <Text style={[styles.uploadText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              Tap to upload
            </Text>
            <Text style={[styles.uploadHint, { color: colors.mutedForeground }]}>
              JPEG, PNG, PDF · Max 10MB
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  uploadArea: {
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadState: {
    alignItems: 'center',
    gap: 6,
  },
  uploadText: {
    fontSize: 14,
    marginTop: 4,
  },
  uploadHint: {
    fontSize: 11,
    opacity: 0.7,
  },
  uploadedState: {
    alignItems: 'center',
    gap: 6,
  },
  uploadedText: {
    fontSize: 14,
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
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
