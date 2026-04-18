-- Migration: Multi Bank Accounts Support
-- Description: Drops individual bank columns and adds a unified JSONB array for multiple bank accounts.

ALTER TABLE public.cases
DROP COLUMN IF EXISTS bank_name,
DROP COLUMN IF EXISTS bank_account_number,
DROP COLUMN IF EXISTS bank_account_name;

ALTER TABLE public.cases
ADD COLUMN bank_accounts jsonb DEFAULT '[]'::jsonb;

-- Add a comment to column
COMMENT ON COLUMN public.cases.bank_accounts IS 'List of bank accounts accepted by the case creator. Array of {id, bank_name, account_number, account_name}';
