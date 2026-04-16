-- Phase 27: Impact Reporting System Expansion

-- 1. Create the impact_report_status enum
CREATE TYPE public.impact_report_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

-- 2. Add impact fields to the cases table
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS impact_status public.impact_report_status DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS outcome_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completion_file_metadata JSONB DEFAULT '[]'::jsonb; -- Stores hashes and file types

-- 3. Add IMPACT_ACHIEVED to notification_type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'notification_type' AND e.enumlabel = 'IMPACT_ACHIEVED') THEN
    ALTER TYPE public.notification_type ADD VALUE 'IMPACT_ACHIEVED';
  END IF;
END $$;
