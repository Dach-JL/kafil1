-- Migration: Fix Missing Function get_case_contributions_for_owner
-- Description: Re-creates the function with a more resilient signature and ensures it exists in the schema cache.

-- Drop the old one if it exists with the same signature
DROP FUNCTION IF EXISTS public.get_case_contributions_for_owner(UUID);

-- Create the function (using TEXT for input to be more resilient to PostgREST type matching, then casting to UUID)
CREATE OR REPLACE FUNCTION public.get_case_contributions_for_owner(target_case_id TEXT)
RETURNS TABLE (
  id UUID,
  case_id UUID,
  amount NUMERIC,
  status public.contribution_status,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_case_id UUID;
BEGIN
  -- Cast input to UUID safely
  BEGIN
    v_case_id := target_case_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Invalid UUID format for target_case_id';
  END;

  -- Verify the caller is the owner of the case or an admin
  IF EXISTS (
    SELECT 1 FROM public.cases AS cs
    WHERE cs.id = v_case_id AND cs.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.profiles AS ps
    WHERE ps.id = auth.uid() AND ps.role = 'admin'
  ) THEN
    RETURN QUERY
    SELECT 
      c.id,
      c.case_id,
      c.amount,
      c.status,
      c.created_at
    FROM public.contributions AS c
    WHERE c.case_id = v_case_id
    ORDER BY c.created_at DESC;
  ELSE
    RAISE EXCEPTION 'Unauthorized: You do not own this case.';
  END IF;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_case_contributions_for_owner(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_case_contributions_for_owner(TEXT) TO service_role;

-- Force a schema cache reload hint (Supabase handles this automatically usually, 
-- but this comment serves as a reminder for manual re-loading if needed)
-- NOTIFY pgrst, 'reload schema';
