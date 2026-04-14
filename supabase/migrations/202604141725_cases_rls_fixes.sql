-- Phase 12: Administrative Decision Logic & RLS Fixes

-- Fix "Owners can update DRAFT cases" policy
-- We must drop the old policy first
DROP POLICY IF EXISTS "Owners can update DRAFT cases" ON public.cases;

-- Recreate policy to allow owners to update rows that are currently DRAFT,
-- and allow the new row to be either DRAFT or PENDING_REVIEW (for submission)
CREATE POLICY "Owners can update DRAFT cases"
ON public.cases FOR UPDATE
USING (auth.uid() = owner_id AND status = 'DRAFT')
WITH CHECK (auth.uid() = owner_id AND status IN ('DRAFT', 'PENDING_REVIEW'));

-- Ensure Admins have explicit full control, but add guard rails
-- (e.g. an Admin shouldn't magically turn a COMPLETED case back to DRAFT unless really needed, 
-- but for now we leave it as full control, or let API enforce state transitions)

-- Create a policy to allow owners to update REJECTED cases back to DRAFT or PENDING_REVIEW
CREATE POLICY "Owners can update REJECTED cases"
ON public.cases FOR UPDATE
USING (auth.uid() = owner_id AND status = 'REJECTED')
WITH CHECK (auth.uid() = owner_id AND status IN ('DRAFT', 'PENDING_REVIEW'));
