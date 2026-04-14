-- Phase 15: Contribution Schema

-- Create enum for contribution status
CREATE TYPE contribution_status AS ENUM (
  'PENDING',
  'VERIFIED',
  'REJECTED'
);

-- Create the contributions table
CREATE TABLE IF NOT EXISTS public.contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Can be NULL for guests if enabled in future
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  status contribution_status DEFAULT 'PENDING' NOT NULL,
  payment_proof_url TEXT NOT NULL,
  rejection_reason TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-update updated_at timestamp
CREATE TRIGGER contributions_updated_at
  BEFORE UPDATE ON public.contributions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger: When a contribution is VERIFIED, increment case collected_amount
CREATE OR REPLACE FUNCTION public.handle_contribution_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if status changed to VERIFIED
  IF NEW.status = 'VERIFIED' AND OLD.status != 'VERIFIED' THEN
    UPDATE public.cases
    SET collected_amount = collected_amount + NEW.amount
    WHERE id = NEW.case_id;

    -- Also check if the case should transition to FUNDED mode
    UPDATE public.cases
    SET status = 'FUNDED',
        funded_at = NOW()
    WHERE id = NEW.case_id 
      AND collected_amount >= target_amount
      AND status = 'ACTIVE_FUNDING';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_contribution_verified
  AFTER UPDATE ON public.contributions
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_contribution_verification();


-- Enable RLS
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can create contributions
CREATE POLICY "Authenticated users can create contributions"
ON public.contributions FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can view their own contributions
CREATE POLICY "Users can view own contributions"
ON public.contributions FOR SELECT
USING (auth.uid() = donor_id);

-- Policy: Admins can view all contributions
CREATE POLICY "Admins can view all contributions"
ON public.contributions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admins can update contributions (verify/reject)
CREATE POLICY "Admins can update contributions"
ON public.contributions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
