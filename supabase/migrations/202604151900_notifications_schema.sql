-- Phase 23: Real-time Notifications System

-- 1. Create the notifications table
CREATE TYPE public.notification_type AS ENUM (
  'CASE_APPROVED',
  'CASE_REJECTED',
  'DONATION_RECEIVED',
  'MILESTONE_REACHED',
  'SYSTEM'
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications (mark read)"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. Automation Function
CREATE OR REPLACE FUNCTION public.create_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_id UUID;
  v_title TEXT;
  v_message TEXT;
  v_type public.notification_type;
BEGIN
  -- Handle Cases Status Changes
  IF TG_TABLE_NAME = 'cases' THEN
    v_owner_id := NEW.owner_id;
    
    IF NEW.status = 'ACTIVE_FUNDING' AND OLD.status = 'PENDING_REVIEW' THEN
      v_type := 'CASE_APPROVED';
      v_title := 'Case Approved! 🎉';
      v_message := 'Your case "' || NEW.title || '" is now live and accepting donations.';
    ELSIF NEW.status = 'REJECTED' AND OLD.status = 'PENDING_REVIEW' THEN
      v_type := 'CASE_REJECTED';
      v_title := 'Review Update';
      v_message := 'Your case was not approved. Reason: ' || COALESCE(NEW.rejection_reason, 'No reason provided.');
    ELSIF NEW.status = 'FUNDED' AND (OLD.status = 'ACTIVE_FUNDING' OR OLD.status = 'VERIFIED') THEN
      v_type := 'MILESTONE_REACHED';
      v_title := 'Goal Reached! 🚀';
      v_message := 'Your case "' || NEW.title || '" has reached 100% funding!';
    ELSIF NEW.status = 'COMPLETED' AND OLD.status = 'FUNDED' THEN
      v_type := 'SYSTEM';
      v_title := 'Case Completed';
      v_message := 'The proof for "' || NEW.title || '" has been verified. Case closed.';
    ELSE
      RETURN NEW; -- Ignored status change
    END IF;

    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (v_owner_id, v_type, v_title, v_message, jsonb_build_object('caseId', NEW.id));

  -- Handle New VERIFIED Contributions
  ELSIF TG_TABLE_NAME = 'contributions' THEN
    -- Get the owner of the case
    SELECT owner_id INTO v_owner_id FROM public.cases WHERE id = NEW.case_id;
    
    IF NEW.status = 'VERIFIED' AND (OLD.status IS NULL OR OLD.status != 'VERIFIED') THEN
      v_type := 'DONATION_RECEIVED';
      v_title := 'New Donation Received 💝';
      v_message := 'You received a donation of $' || NEW.amount || ' for your case.';
      
      INSERT INTO public.notifications (user_id, type, title, message, metadata)
      VALUES (v_owner_id, v_type, v_title, v_message, jsonb_build_object('caseId', NEW.case_id, 'contributionId', NEW.id));
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Attach Triggers
DROP TRIGGER IF EXISTS trigger_notify_case_changes ON public.cases;
CREATE TRIGGER trigger_notify_case_changes
  AFTER UPDATE OF status ON public.cases
  FOR EACH ROW
  EXECUTE PROCEDURE public.create_notification();

DROP TRIGGER IF EXISTS trigger_notify_donation ON public.contributions;
CREATE TRIGGER trigger_notify_donation
  AFTER UPDATE OF status ON public.contributions
  FOR EACH ROW
  EXECUTE PROCEDURE public.create_notification();

-- 5. Enable Real-Time
-- This adds the table to the 'supabase_realtime' publication
-- Check if publication exists first
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
