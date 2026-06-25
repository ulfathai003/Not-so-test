-- Update allowed_managers to store name and phone for auto-login/verification
ALTER TABLE public.allowed_managers 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update the sync trigger function to propagate name if needed (optional)
-- For now, having them in allowed_managers is enough for the Admin to see.
