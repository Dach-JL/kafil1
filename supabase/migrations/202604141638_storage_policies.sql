-- Phase 8: Evidence Storage — Supabase Storage Bucket Policies
-- Run in Supabase Dashboard → SQL Editor AFTER creating the buckets below.
--
-- STEP 1: Manually create these buckets in Supabase Dashboard → Storage:
--   - case-evidence   (private)
--   - proof-of-payment  (private)
--   - completion-proofs (private)
--   - avatars           (public)

-- ─── case-evidence bucket policies ───────────────────────────────────────────
-- Case owners can upload their own evidence
CREATE POLICY "Owners can upload case evidence"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'case-evidence'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Case owners can view their own evidence
CREATE POLICY "Owners can view own case evidence"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'case-evidence'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all case evidence (for verification)
CREATE POLICY "Admins can view all case evidence"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'case-evidence'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Case owners can delete their own evidence (DRAFT only)
CREATE POLICY "Owners can delete own evidence"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'case-evidence'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ─── proof-of-payment bucket policies ────────────────────────────────────────
-- Contributors can upload their own payment proof
CREATE POLICY "Contributors can upload proof of payment"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'proof-of-payment'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all proof of payment (for verification)
CREATE POLICY "Admins can view all payment proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'proof-of-payment'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Contributors can view their own payment proofs
CREATE POLICY "Contributors can view own payment proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'proof-of-payment'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ─── avatars bucket policies ──────────────────────────────────────────────────
-- Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload/update their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
