import { supabase } from '../supabase/supabaseClient';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';

export type StorageBucket =
  | 'case-evidence'
  | 'proof-of-payment'
  | 'completion-proofs'
  | 'avatars';

export interface UploadResult {
  path: string;
  publicUrl?: string;
  fullPath: string;
}

/**
 * Upload a file to a Supabase Storage bucket.
 * Path structure: {userId}/{caseId}/{filename}
 */
export async function uploadFile(
  bucket: StorageBucket,
  userId: string,
  fileName: string,
  fileUri: string,
  contentType: string,
  caseId?: string
): Promise<UploadResult> {
  const pathParts = caseId
    ? [userId, caseId, fileName]
    : [userId, fileName];
  const filePath = pathParts.join('/');

  // Convert URI to Blob for upload
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, {
      contentType,
      upsert: false,
    });

  if (error) throw error;

  const fullPath = data.path;

  // Get public URL only for public buckets (avatars)
  let publicUrl: string | undefined;
  if (bucket === 'avatars') {
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fullPath);
    publicUrl = urlData.publicUrl;
  }

  return { path: fullPath, publicUrl, fullPath };
}

/**
 * Get a signed (temporary) URL for a private file.
 * Default: 60 minutes expiry.
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  filePath: string,
  expiresInSeconds = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Delete a file from a bucket.
 */
export async function deleteFile(
  bucket: StorageBucket,
  filePath: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;
}

/**
 * List all files for a given user (and optional case) in a bucket.
 */
export async function listFiles(
  bucket: StorageBucket,
  userId: string,
  caseId?: string
): Promise<string[]> {
  const folder = caseId ? `${userId}/${caseId}` : userId;

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder);

  if (error) throw error;
  return (data ?? []).map((f) => `${folder}/${f.name}`);
}

/**
 * Compute SHA-256 hash of a file (for fraud detection in Phase 18).
 * Returns hex string.
 */
export async function computeFileSHA256(fileUri: string): Promise<string> {
  const base64Str = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    base64Str
  );
  return hash;
}

/**
 * Validate file type and size before upload.
 */
export function validateFile(
  contentType: string,
  fileSizeBytes: number,
  maxSizeMB = 10
): { valid: boolean; error?: string } {
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];
  const MAX_BYTES = maxSizeMB * 1024 * 1024;

  if (!ALLOWED_TYPES.includes(contentType)) {
    return { valid: false, error: 'Only JPEG, PNG, WebP, and PDF files are allowed.' };
  }

  if (fileSizeBytes > MAX_BYTES) {
    return { valid: false, error: `File must be smaller than ${maxSizeMB}MB.` };
  }

  return { valid: true };
}
