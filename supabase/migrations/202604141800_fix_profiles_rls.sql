-- Fix recursion in profiles RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create new non-recursive policies

-- 1. Users can select their own profile
CREATE POLICY "Users can select own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Note: We no longer have an "Admins can view all profiles" policy that queries the profiles table.
-- If admin access is needed, it must be handled via SECURITY DEFINER functions or JWT custom claims to avoid infinite recursion.
