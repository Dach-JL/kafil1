-- Phase 7: Case Management Schema

-- Create enum for case status (the State Machine)
CREATE TYPE case_status AS ENUM (
  'DRAFT',
  'PENDING_REVIEW',
  'VERIFIED',
  'ACTIVE_FUNDING',
  'FUNDED',
  'COMPLETED',
  'REJECTED'
);

-- Create enum for case category
CREATE TYPE case_category AS ENUM (
  'MEDICAL',
  'EDUCATION',
  'EMERGENCY',
  'HOUSING',
  'FOOD',
  'OTHER'
);

-- Create the cases table
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category case_category DEFAULT 'OTHER' NOT NULL,
  status case_status DEFAULT 'DRAFT' NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
  collected_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL CHECK (collected_amount >= 0),
  location TEXT,
  beneficiary_name TEXT NOT NULL,
  beneficiary_age INTEGER CHECK (beneficiary_age > 0 AND beneficiary_age < 150),
  urgency_level INTEGER DEFAULT 3 CHECK (urgency_level BETWEEN 1 AND 5),
  rejection_reason TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  funded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  is_anonymous BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view VERIFIED, ACTIVE_FUNDING, FUNDED, COMPLETED cases (public feed)
CREATE POLICY "Public can view active cases"
ON public.cases FOR SELECT
USING (status IN ('VERIFIED', 'ACTIVE_FUNDING', 'FUNDED', 'COMPLETED'));

-- Owners can view their own cases (all statuses, including DRAFT)
CREATE POLICY "Owners can view own cases"
ON public.cases FOR SELECT
USING (auth.uid() = owner_id);

-- Owners can create their own cases
CREATE POLICY "Owners can create cases"
ON public.cases FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Owners can update their DRAFT cases only
CREATE POLICY "Owners can update DRAFT cases"
ON public.cases FOR UPDATE
USING (auth.uid() = owner_id AND status = 'DRAFT');

-- Admins can view ALL cases
CREATE POLICY "Admins can view all cases"
ON public.cases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update any case (for verification workflow)
CREATE POLICY "Admins can update any case"
ON public.cases FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
