-- STEP 1 of 2 — run this FIRST, then run STEP 2.
-- Adds the new enum values your CRM needs. They must be committed
-- before the tables/policies that use them (that is why this is split).

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'center';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.student_status ADD VALUE IF NOT EXISTS 'lead';
ALTER TYPE public.student_status ADD VALUE IF NOT EXISTS 'pending_approval';
ALTER TYPE public.student_status ADD VALUE IF NOT EXISTS 'rejected';
ALTER TYPE public.student_status ADD VALUE IF NOT EXISTS 'correction_requested';
