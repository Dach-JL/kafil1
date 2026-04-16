-- Phase 26: Funding Caps (Database Refinement)

-- 1. Refine the handle_contribution_verification function to strictly cap collected_amount
CREATE OR REPLACE FUNCTION public.handle_contribution_verification()
RETURNS TRIGGER AS $$
DECLARE
  v_target_amount NUMERIC(12, 2);
  v_current_collected NUMERIC(12, 2);
  v_remaining NUMERIC(12, 2);
  v_final_amount NUMERIC(12, 2);
BEGIN
  -- We only act if a contribution is VERIFIED
  IF NEW.status = 'VERIFIED' AND OLD.status != 'VERIFIED' THEN
    
    -- Get current case state
    SELECT target_amount, collected_amount INTO v_target_amount, v_current_collected
    FROM public.cases
    WHERE id = NEW.case_id;

    v_remaining := v_target_amount - v_current_collected;
    
    -- If the case is already funded, we should not have allowed this verification, 
    -- but as a safety measure, we ensure we don't add more.
    IF v_remaining <= 0 THEN
      -- Optional: We could RAISE EXCEPTION here, but it might break the admin UI.
      -- Instead, we just don't increment collected_amount.
      RETURN NEW;
    END IF;

    -- Cap the amount added to only what is needed to reach target
    v_final_amount := LEAST(NEW.amount, v_remaining);

    -- Update the case
    UPDATE public.cases
    SET collected_amount = LEAST(collected_amount + v_final_amount, target_amount),
        status = CASE 
          WHEN (collected_amount + v_final_amount) >= target_amount THEN 'FUNDED'::case_status 
          ELSE status 
        END,
        funded_at = CASE 
          WHEN (collected_amount + v_final_amount) >= target_amount AND funded_at IS NULL THEN NOW() 
          ELSE funded_at 
        END
    WHERE id = NEW.case_id;

  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add a BEFORE INSERT trigger on contributions to prevent submittals for funded cases
CREATE OR REPLACE FUNCTION public.check_case_funding_status()
RETURNS TRIGGER AS $$
DECLARE
  v_status public.case_status;
BEGIN
  SELECT status INTO v_status FROM public.cases WHERE id = NEW.case_id;
  
  IF v_status != 'ACTIVE_FUNDING' THEN
    RAISE EXCEPTION 'This case is no longer accepting contributions (Status: %)', v_status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_case_before_donation ON public.contributions;
CREATE TRIGGER trigger_check_case_before_donation
  BEFORE INSERT ON public.contributions
  FOR EACH ROW
  EXECUTE PROCEDURE public.check_case_funding_status();
