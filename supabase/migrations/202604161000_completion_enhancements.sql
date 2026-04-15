-- Phase 25.1: Case Completion Enhancements

-- 1. Add new columns for detailed outcome reports
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS completion_description TEXT,
ADD COLUMN IF NOT EXISTS completion_images TEXT[] DEFAULT '{}'::TEXT[];

-- 2. Data Migration: Move existing single proof URL to the new array field
UPDATE public.cases
SET completion_images = ARRAY[completion_proof_url]
WHERE completion_proof_url IS NOT NULL 
  AND (completion_images IS NULL OR array_length(completion_images, 1) IS NULL);

-- 3. Cleanup: (Optional) We keep completion_proof_url for backward compatibility for now
-- but marking it as deprecated in our minds.

COMMENT ON COLUMN public.cases.completion_description IS 'Detailed story describing the outcome of the case once completed.';
COMMENT ON COLUMN public.cases.completion_images IS 'Array of URLs for photos proving the case was completed and funds used as intended.';
