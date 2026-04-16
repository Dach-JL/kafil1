-- Impact Report System: Phase 5 — Immunity Shield
-- Prevents modification of impact evidence once a report is APPROVED.

-- 1. Create a trigger that blocks edits to immutable impact fields
CREATE OR REPLACE FUNCTION public.protect_approved_impact()
RETURNS TRIGGER AS $$
BEGIN
  -- If the report was already approved, block changes to evidence fields
  IF OLD.impact_report_status = 'APPROVED' THEN
    -- Allow admin to change case status (e.g. to COMPLETED) but NOT evidence
    IF NEW.completion_description IS DISTINCT FROM OLD.completion_description
       OR NEW.completion_images IS DISTINCT FROM OLD.completion_images
       OR NEW.outcome_date IS DISTINCT FROM OLD.outcome_date
       OR NEW.impact_evidence_hashes IS DISTINCT FROM OLD.impact_evidence_hashes
       OR NEW.impact_report_status IS DISTINCT FROM OLD.impact_report_status
    THEN
      RAISE EXCEPTION 'Impact report is immutable — evidence cannot be modified after approval.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_protect_approved_impact ON public.cases;
CREATE TRIGGER trigger_protect_approved_impact
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE PROCEDURE public.protect_approved_impact();
