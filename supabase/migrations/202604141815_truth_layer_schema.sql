-- Phase 17: The Truth Layer (Global Event Log)

-- Create the append-only event_logs table
CREATE TABLE IF NOT EXISTS public.event_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- The user who triggered the event
  action TEXT NOT NULL,                                           -- E.g., 'CASE_CREATED', 'STATUS_CHANGED'
  entity_type TEXT NOT NULL,                                      -- E.g., 'cases', 'contributions'
  entity_id UUID NOT NULL,                                        -- ID of the affected row
  metadata JSONB,                                                 -- Additional context (old state, new state, amounts)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS to prevent unauthorized access and tampering
ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Event logs are append-only. Nobody can UPDATE or DELETE them.
-- Even admins cannot mutate history in the Truth Layer.

-- Policy: Admins can view all event logs (for auditing)
CREATE POLICY "Admins can view event logs"
ON public.event_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Note: No INSERT policy is granted to users directly. 
-- The event_logs are exclusively populated via postgres triggers running with SECURITY DEFINER privileges.

-- 1. Trigger for Case Creation
CREATE OR REPLACE FUNCTION public.trigger_log_case_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.event_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    NEW.owner_id, 
    'CASE_CREATED', 
    'cases', 
    NEW.id, 
    jsonb_build_object('title', NEW.title, 'target_amount', NEW.target_amount)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_case_insert
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE PROCEDURE public.trigger_log_case_creation();

-- 2. Trigger for Case Status Changes
CREATE OR REPLACE FUNCTION public.trigger_log_case_status()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.event_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (
      auth.uid(), -- The active session user triggering the change
      'CASE_STATUS_CHANGED', 
      'cases', 
      NEW.id, 
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_case_update_status
  AFTER UPDATE OF status ON public.cases
  FOR EACH ROW
  EXECUTE PROCEDURE public.trigger_log_case_status();

-- 3. Trigger for Contribution Status Changes (Verifications)
CREATE OR REPLACE FUNCTION public.trigger_log_contribution_status()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.event_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (
      auth.uid(), 
      'CONTRIBUTION_STATUS_CHANGED', 
      'contributions', 
      NEW.id, 
      jsonb_build_object(
        'old_status', OLD.status, 
        'new_status', NEW.status, 
        'amount', NEW.amount, 
        'case_id', NEW.case_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_contribution_update_status
  AFTER UPDATE OF status ON public.contributions
  FOR EACH ROW
  EXECUTE PROCEDURE public.trigger_log_contribution_status();
