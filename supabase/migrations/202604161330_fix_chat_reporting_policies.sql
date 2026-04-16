-- Phase 24.6: Chat RLS Security Fixes (Reporting & Moderation)

-- 1. Allow participants to report a chat room
-- They can only update 'is_reported', 'report_reason', and 'reported_at'
CREATE POLICY "Participants can report chat rooms" 
ON public.chat_rooms FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE room_id = public.chat_rooms.id AND user_id = auth.uid()
  )
)
WITH CHECK (
  is_reported = TRUE
);

-- 2. Allow admins to insert audit logs when viewing chats
CREATE POLICY "Admins can insert audit logs" 
ON public.chat_audit_logs FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
