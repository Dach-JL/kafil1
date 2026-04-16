-- Impact Report System: Phase 1 & 2
-- Adds impact_status, outcome_date, IMPACT_ACHIEVED notification type,
-- and a trigger that notifies all donors when an impact report is approved.

-- 1. Add IMPACT_ACHIEVED to notification_type enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid 
    WHERE t.typname = 'notification_type' AND e.enumlabel = 'IMPACT_ACHIEVED'
  ) THEN
    ALTER TYPE public.notification_type ADD VALUE 'IMPACT_ACHIEVED';
  END IF;
END $$;

-- 2. Create impact_status type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'impact_status') THEN
    CREATE TYPE public.impact_status AS ENUM ('PENDING', 'APPROVED');
  END IF;
END $$;

-- 3. Add new columns to cases
ALTER TABLE public.cases
ADD COLUMN IF NOT EXISTS impact_report_status public.impact_status,
ADD COLUMN IF NOT EXISTS outcome_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS impact_evidence_hashes TEXT[] DEFAULT '{}'::TEXT[],
ADD COLUMN IF NOT EXISTS impact_approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS impact_approved_at TIMESTAMPTZ;

COMMENT ON COLUMN public.cases.impact_report_status IS 'Status of the impact report: NULL=not submitted, PENDING=awaiting review, APPROVED=verified and immutable.';
COMMENT ON COLUMN public.cases.outcome_date IS 'The date the positive outcome actually occurred.';
COMMENT ON COLUMN public.cases.impact_evidence_hashes IS 'SHA-256 hashes of all uploaded evidence files for tamper detection.';
COMMENT ON COLUMN public.cases.impact_approved_by IS 'Admin who approved the impact report.';
COMMENT ON COLUMN public.cases.impact_approved_at IS 'Timestamp when the impact report was approved and locked.';

-- 4. Allow case owners to update FUNDED cases (for submitting impact reports)
-- They could only update DRAFT before; now they also need FUNDED.
CREATE POLICY "Owners can submit impact report on FUNDED cases"
ON public.cases FOR UPDATE
USING (auth.uid() = owner_id AND status = 'FUNDED');

-- 5. Trigger: When impact_report_status changes to APPROVED, notify all donors
CREATE OR REPLACE FUNCTION public.notify_donors_impact_achieved()
RETURNS TRIGGER AS $$
DECLARE
  v_donor RECORD;
  v_case_title TEXT;
BEGIN
  -- Only fire when impact_report_status transitions to APPROVED
  IF NEW.impact_report_status = 'APPROVED' 
     AND (OLD.impact_report_status IS NULL OR OLD.impact_report_status != 'APPROVED') THEN
    
    v_case_title := NEW.title;

    -- Find all unique donors who contributed to this case with VERIFIED status
    FOR v_donor IN
      SELECT DISTINCT donor_id 
      FROM public.contributions 
      WHERE case_id = NEW.id 
        AND status = 'VERIFIED' 
        AND donor_id IS NOT NULL
    LOOP
      INSERT INTO public.notifications (user_id, type, title, message, metadata)
      VALUES (
        v_donor.donor_id,
        'IMPACT_ACHIEVED',
        'Impact Achieved! 🌟',
        'The case "' || v_case_title || '" you supported has published its verified outcome report!',
        jsonb_build_object('caseId', NEW.id)
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_impact_achieved ON public.cases;
CREATE TRIGGER trigger_notify_impact_achieved
  AFTER UPDATE OF impact_report_status ON public.cases
  FOR EACH ROW
  EXECUTE PROCEDURE public.notify_donors_impact_achieved();
