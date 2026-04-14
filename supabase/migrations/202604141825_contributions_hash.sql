-- Phase 18: SHA-256 Proof Integrity

-- Add payment_proof_hash to contributions
ALTER TABLE public.contributions 
ADD COLUMN IF NOT EXISTS payment_proof_hash TEXT;

-- Since this is a new layer of security, we can't easily enforce NOT NULL on old records 
-- unless we backfill them (which we can't because we don't have the files locally anymore).
-- We will just make sure moving forward our application logic requires it!
