-- Phase 24.8: Chat RLS Final Resolution (Participant Sync)

-- 1. Refine chat_participants INSERT policy
-- Allow a user to add participants to a room IF they are the room's creator
DROP POLICY IF EXISTS "Users can add participants to rooms" ON public.chat_participants;
CREATE POLICY "Users can add participants to rooms" 
ON public.chat_participants FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE id = public.chat_participants.room_id 
    AND (creator_id = auth.uid())
  )
);

-- 2. Refine chat_participants SELECT policy
-- Allow participants to see OTHER participants in the same room
DROP POLICY IF EXISTS "Users can view own memberships" ON public.chat_participants;
CREATE POLICY "Participants can view room members" ON public.chat_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants AS self
    WHERE self.room_id = public.chat_participants.room_id 
    AND self.user_id = auth.uid()
  )
);
