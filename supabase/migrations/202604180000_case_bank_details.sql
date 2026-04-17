-- Migration: Add Bank Details to Cases
-- Description: Adds bank account information to the cases table to facilitate donations.

ALTER TABLE public.cases
ADD COLUMN bank_name text,
ADD COLUMN bank_account_number text,
ADD COLUMN bank_account_name text;

-- Add a comment to columns
COMMENT ON COLUMN public.cases.bank_name IS 'The name of the bank (e.g., CBE, Telebirr, Ebirr)';
COMMENT ON COLUMN public.cases.bank_account_number IS 'The account number for donations';
COMMENT ON COLUMN public.cases.bank_account_name IS 'The authorized account holder name';
