-- Phase 20 Fix: Stabilize Auth Trigger

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role public.user_role;
  v_name TEXT;
BEGIN
  -- Safely extract name safely without crashing on null jsonb
  IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data ? 'name' THEN
    v_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), '');
  END IF;
  
  IF v_name IS NULL THEN
    v_name := 'Anonymous User';
  END IF;

  -- Safely extract and cast role safely without throwing ENUM cast exceptions
  IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data ? 'role' AND (NEW.raw_user_meta_data->>'role') IN ('contributor', 'owner', 'admin') THEN
    v_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
  ELSE
    v_role := 'contributor'::public.user_role;
  END IF;

  -- Perform the insert with an absolute fallback for the email
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id, 
    v_name, 
    COALESCE(NEW.email, 'no-email-' || NEW.id || '@placeholder.com'), 
    v_role
  );
  
  RETURN NEW;
END;
$$;
