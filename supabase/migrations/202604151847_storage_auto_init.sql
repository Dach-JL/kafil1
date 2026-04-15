-- Phase 22 Fix: Automated Bucket Creation & Config
-- Run this in the Supabase SQL Editor to ensure all storage infrastructure is initialized.

-- 1. Create the buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('case-evidence', 'case-evidence', false),
  ('proof-of-payment', 'proof-of-payment', false),
  ('completion-proofs', 'completion-proofs', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Cleanup existing policies to avoid conflicts (Safe to run)
DROP POLICY IF EXISTS "Owners can upload case evidence" ON storage.objects;
DROP POLICY IF EXISTS "Owners can view own case evidence" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all case evidence" ON storage.objects;
DROP POLICY IF EXISTS "Contributors can upload proof of payment" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Contributors can view own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Owners can upload completion proofs" ON storage.objects;
DROP POLICY IF EXISTS "Owners can view own completion proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all completion proofs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated owners can upload case evidence" ON storage.objects;

-- 4. Re-establish Clean Storage Policies

-- Case Evidence
CREATE POLICY "Case Evidence Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'case-evidence' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Case Evidence Read" ON storage.objects FOR SELECT USING (
  bucket_id = 'case-evidence' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

-- Payment Proofs
CREATE POLICY "Payment Proof Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'proof-of-payment' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Payment Proof Read" ON storage.objects FOR SELECT USING (
  bucket_id = 'proof-of-payment' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

-- Completion Proofs
CREATE POLICY "Completion Proof Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'completion-proofs' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Completion Proof Read" ON storage.objects FOR SELECT USING (
  bucket_id = 'completion-proofs' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

-- Avatars
CREATE POLICY "Avatar Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar Owner Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
