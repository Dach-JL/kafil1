-- Phase 20: Case Completion Workflow

ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS completion_proof_url TEXT;

-- We don't make it NOT NULL because cases in DRAFT or ACTIVE_FUNDING won't have it yet.
-- The API logic will enforce its presence before the case transitions to COMPLETED.
