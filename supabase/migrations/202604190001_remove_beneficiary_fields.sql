-- Migration: Remove beneficiary and location fields from cases
-- Description: Drops columns that are no longer required for case creation.

ALTER TABLE public.cases 
DROP COLUMN IF EXISTS beneficiary_name,
DROP COLUMN IF EXISTS beneficiary_age,
DROP COLUMN IF EXISTS location;
