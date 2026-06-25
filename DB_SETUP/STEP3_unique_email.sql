-- ============================================================
-- STEP 3: Add unique constraint on students.email
-- Run this ONCE in Supabase SQL Editor.
-- This is REQUIRED for upsert(onConflict:'email') to work.
-- Without this, every form save creates a duplicate student row.
-- ============================================================

-- First, remove any existing duplicates (keep the most recent one)
DELETE FROM public.students a
USING public.students b
WHERE a.created_at < b.created_at
  AND a.email = b.email;

-- Now add the unique constraint
ALTER TABLE public.students
  ADD CONSTRAINT students_email_unique UNIQUE (email);

-- Verify
SELECT COUNT(*) as total_students,
       COUNT(DISTINCT email) as unique_emails
FROM public.students;
