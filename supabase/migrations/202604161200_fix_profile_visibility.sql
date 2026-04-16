-- Phase 25.7: RLS Fix (Profile Visibility)

-- Allow all authenticated users to view the 'name', 'role', and 'trust_score' of other users.
-- This is necessary for the messaging system to display the organizer's identity.
CREATE POLICY "Users can view basic info of all profiles" 
ON public.profiles FOR SELECT 
TO authenticated
USING (true);

-- Ensure sensitive fields remain protected if we were using a more complex query, 
-- but since RLS covers entire rows, we rely on our API layer to only select safe columns.
-- For absolute security in a production env, we would use a VIEW, but for this phase,
-- allowing SELECT on the table is the standard Supabase pattern for public profiles.
