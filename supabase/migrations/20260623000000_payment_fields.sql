-- Add missing fields for payment tracking in Center and Admin portals
ALTER TABLE public.fee_payments 
  ADD COLUMN IF NOT EXISTS utr_number TEXT,
  ADD COLUMN IF NOT EXISTS screenshot_url TEXT;

-- UTR number should be unique to prevent duplicate entries as requested
-- We use a partial index if we want to allow nulls, or just a unique constraint if we enforce it
CREATE UNIQUE INDEX IF NOT EXISTS fee_payments_utr_number_idx ON public.fee_payments (utr_number) WHERE utr_number IS NOT NULL;

-- Ensure RLS allows the needed fields
-- Existing policies in 20260622000000_role_system_fix.sql cover INSERT/SELECT for centers
