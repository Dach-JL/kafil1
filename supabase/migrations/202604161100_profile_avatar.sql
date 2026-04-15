-- Phase 25.6: Schema Cleanup (Avatars)

-- Add avatar_url to profiles table to support rich UI throughout the app
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to the user profile picture stored in storage.';
