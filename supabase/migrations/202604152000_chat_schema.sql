-- Phase 24.1: Real-time Chat Infrastructure & Security

-- 1. Tables for Chat System
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  is_reported BOOLEAN DEFAULT FALSE NOT NULL,
  report_reason TEXT,
  reported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chat_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chat_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) NOT NULL,
  room_id UUID REFERENCES public.chat_rooms(id) NOT NULL,
  action TEXT NOT NULL, -- e.g. 'VIEWED_REPORTED_CHAT'
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Participants: Can see their own rooms
CREATE POLICY "Users can view own rooms" ON public.chat_rooms
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE room_id = public.chat_rooms.id AND user_id = auth.uid()
  )
);

-- Admins: Can see rooms ONLY IF reported
CREATE POLICY "Admins can view reported rooms" ON public.chat_rooms
FOR SELECT USING (
  is_reported = TRUE AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Participants: Can see their own membership
CREATE POLICY "Users can view own memberships" ON public.chat_participants
FOR SELECT USING (user_id = auth.uid());

-- Participants: Can see messages in their rooms
CREATE POLICY "Users can view messages in own rooms" ON public.chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE room_id = public.chat_messages.room_id AND user_id = auth.uid()
  )
);

-- Admins: Can see messages ONLY IF room is reported
CREATE POLICY "Admins can view reported messages" ON public.chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE id = public.chat_messages.room_id AND is_reported = TRUE
  ) AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Participants: Can send messages in their rooms
CREATE POLICY "Users can send messages in own rooms" ON public.chat_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE room_id = public.chat_messages.room_id AND user_id = auth.uid()
  )
);

-- Audit Logs: Only admins can view/insert
CREATE POLICY "Admins can manage audit logs" ON public.chat_audit_logs
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Real-time Config
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
  END IF;
END $$;
