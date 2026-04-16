-- Phase 23.5: Chat Message Notifications

-- 1. Add MESSAGE_RECEIVED to notification_type
-- We use a DO block to ensure it's idempotent
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'notification_type' AND e.enumlabel = 'MESSAGE_RECEIVED') THEN
    ALTER TYPE public.notification_type ADD VALUE 'MESSAGE_RECEIVED';
  END IF;
END $$;

-- 2. Update the notification trigger function to handle chat messages
CREATE OR REPLACE FUNCTION public.create_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_id UUID;
  v_recipient_id UUID;
  v_sender_name TEXT;
  v_title TEXT;
  v_message TEXT;
  v_type public.notification_type;
BEGIN
  -- Handle Chat Messages
  IF TG_TABLE_NAME = 'chat_messages' THEN
    -- Get the sender's name
    SELECT name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;
    
    -- Find the other participant in the room
    SELECT user_id INTO v_recipient_id 
    FROM public.chat_participants 
    WHERE room_id = NEW.room_id AND user_id != NEW.sender_id
    LIMIT 1;

    IF v_recipient_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, metadata)
      VALUES (
        v_recipient_id, 
        'MESSAGE_RECEIVED', 
        'New Message from ' || COALESCE(v_sender_name, 'Organizer'), 
        NEW.content, 
        jsonb_build_object('roomId', NEW.room_id, 'senderId', NEW.sender_id)
      );
    END IF;
    RETURN NEW;

  -- Handle Cases Status Changes
  ELSIF TG_TABLE_NAME = 'cases' THEN
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

-- 3. Attach trigger to chat_messages
DROP TRIGGER IF EXISTS trigger_notify_chat_message ON public.chat_messages;
CREATE TRIGGER trigger_notify_chat_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE PROCEDURE public.create_notification();
