-- Phase 22: Trust & Reputation Score System

-- 1. Create a function to update a user's trust score
CREATE OR REPLACE FUNCTION public.update_trust_score()
RETURNS TRIGGER AS $$
DECLARE
  v_actor_id UUID;
  v_points INTEGER := 0;
BEGIN
  -- Handle Contributions
  IF TG_TABLE_NAME = 'contributions' THEN
    -- Only award points when status transitions to VERIFIED
    IF NEW.status = 'VERIFIED' AND (OLD.status IS NULL OR OLD.status != 'VERIFIED') THEN
      -- Award 10 points to the donor (contributor)
      UPDATE public.profiles 
      SET trust_score = trust_score + 10 
      WHERE id = NEW.donor_id;
      
      -- Award 5 points to the admin who performed the verification (actor)
      UPDATE public.profiles 
      SET trust_score = trust_score + 5 
      WHERE id = auth.uid();
    END IF;
  
  -- Handle Cases
  ELSIF TG_TABLE_NAME = 'cases' THEN
    -- Award points when a case is VERIFIED (Initial Review)
    IF NEW.status = 'ACTIVE_FUNDING' AND (OLD.status IS NULL OR OLD.status != 'ACTIVE_FUNDING') THEN
      -- Award 5 points to the admin (actor)
      UPDATE public.profiles 
      SET trust_score = trust_score + 5 
      WHERE id = auth.uid();
    END IF;

    -- Award points when a case is COMPLETED (Proof of disbursement verified)
    IF NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED') THEN
      -- Award 50 points to the case owner
      UPDATE public.profiles 
      SET trust_score = trust_score + 50 
      WHERE id = NEW.owner_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach triggers
DROP TRIGGER IF EXISTS trigger_reputation_contributions ON public.contributions;
CREATE TRIGGER trigger_reputation_contributions
  AFTER UPDATE OF status ON public.contributions
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_trust_score();

DROP TRIGGER IF EXISTS trigger_reputation_cases ON public.cases;
CREATE TRIGGER trigger_reputation_cases
  AFTER UPDATE OF status ON public.cases
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_trust_score();
