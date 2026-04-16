-- Phase 24.5: Chat RLS Security Fixes (Insertion & Updating)

-- 1. Allow authenticated users to create chat rooms
CREATE POLICY "Users can create chat rooms" 
ON public.chat_rooms FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 2. Allow authenticated users to join chat rooms (participants)
-- This allows the room creator to add themselves and the recipient
CREATE POLICY "Users can add participants to rooms" 
ON public.chat_participants FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 3. Allow participants to update the last_message_at timestamp
CREATE POLICY "Participants can update room activity" 
ON public.chat_rooms FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE room_id = public.chat_rooms.id AND user_id = auth.uid()
  )
)
WITH CHECK (true);
