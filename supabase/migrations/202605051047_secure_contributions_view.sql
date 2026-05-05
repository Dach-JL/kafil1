-- Migration: Secure Contributions View
-- Description: Creates a secure view for case owners to see contribution summaries without proofs or donor IDs.

-- Create the view
CREATE OR REPLACE VIEW public.case_contribution_summaries AS
SELECT 
  c.id,
  c.case_id,
  c.amount,
  c.status,
  c.created_at
FROM public.contributions c;

-- Grant access to authenticated users
GRANT SELECT ON public.case_contribution_summaries TO authenticated;

-- Enable RLS on the view (requires PG 15+ which Supabase uses)
-- Note: If view RLS is not supported, we use a Security Definer function instead.
-- But for now, we'll use the view and assume the UI/API layer will filter.
-- To be truly secure at the DB level for the view:
ALTER VIEW public.case_contribution_summaries SET (security_invoker = on);

-- Now we need a policy on the base 'contributions' table that allows Case Owners to see the rows.
-- Since we want to hide columns, and Postgres RLS is row-level, we have a challenge.
-- Standard workaround: Allow SELECT on the base table for owners, but the View is what we'll use in the app.
-- To prevent them from querying the base table directly and getting the 'payment_proof_url', 
-- we can use column-level privileges if we were using a standard Postgres role, but Supabase uses 'authenticated'.

-- Alternative: SECURITY DEFINER Function
CREATE OR REPLACE FUNCTION public.get_case_contributions_for_owner(target_case_id UUID)
RETURNS TABLE (
  id UUID,
  case_id UUID,
  amount NUMERIC,
  status public.contribution_status,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with creator privileges (bypass RLS)
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is the owner of the case
  IF EXISTS (
    SELECT 1 FROM public.cases 
    WHERE id = target_case_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN QUERY
    SELECT 
      c.id,
      c.case_id,
      c.amount,
      c.status,
      c.created_at
    FROM public.contributions c
    WHERE c.case_id = target_case_id;
  ELSE
    RAISE EXCEPTION 'Unauthorized: You do not own this case.';
  END IF;
END;
$$;
