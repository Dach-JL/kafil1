-- Fix: Comprehensive Storage RLS for all buckets

-- ─── Ensure completion-proofs bucket policies exist ──────────────────────────
-- Case owners can upload their completion proofs
CREATE POLICY "Owners can upload completion proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'completion-proofs'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Case owners can view their own completion proofs
CREATE POLICY "Owners can view own completion proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'completion-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all completion proofs
CREATE POLICY "Admins can view all completion proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'completion-proofs'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ─── Fix proof-of-payment to allow authenticated uploads (any role) ──────────
-- Drop the old restrictive policy that checked userId segments which fails on some paths
DROP POLICY IF EXISTS "Contributors can upload proof of payment" ON storage.objects;

-- Authenticated users can upload payment proofs under their own folder
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'proof-of-payment'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ─── Fix case-evidence to allow all authenticated uploads ─────────────────────
-- Drop and recreate to ensure it exists without blocking legitimate owners
DROP POLICY IF EXISTS "Owners can upload case evidence" ON storage.objects;

CREATE POLICY "Authenticated owners can upload case evidence"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'case-evidence'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);
