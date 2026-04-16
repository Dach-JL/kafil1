-- Phase 24.7: Chat RLS Final Resolution (Creator Ownership)

-- 1. Add creator_id to chat_rooms to allow immediate view after insertion
ALTER TABLE public.chat_rooms 
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES public.profiles(id) DEFAULT auth.uid();

-- 2. Update SELECT policy to allow creators to see their own rooms 
-- (in addition to the existing participant-based policy)
DROP POLICY IF EXISTS "Users can view own rooms" ON public.chat_rooms;
CREATE POLICY "Users can view own rooms" ON public.chat_rooms
FOR SELECT USING (
  creator_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE room_id = public.chat_rooms.id AND user_id = auth.uid()
  )
);

-- 3. Update the INSERT policy to ensure creator_id is set to the current user
DROP POLICY IF EXISTS "Users can create chat rooms" ON public.chat_rooms;
CREATE POLICY "Users can create chat rooms" 
ON public.chat_rooms FOR INSERT 
TO authenticated 
WITH CHECK (
  creator_id = auth.uid()
);
