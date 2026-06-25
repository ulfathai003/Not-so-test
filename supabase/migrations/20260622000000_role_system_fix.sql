-- ============================================================================
-- Role system fix.
--
-- The frontend (useAuth.tsx, Sidebar.tsx, manager.tsx, dashboard.tsx) has
-- assumed four roles — super_admin / admin / center / staff — since the
-- "12-step admissions workflow" commit. None of that ever worked end-to-end
-- because the database never caught up:
--
--   1. app_role enum only has 'admin' and 'student'. Inserting role='center'
--      or role='staff' into user_roles fails outright (invalid enum value),
--      so those roles can never actually be granted to anyone.
--   2. student_status enum has no 'lead' value, but EnquiriesTab and the
--      public lead-intake paths filter/insert status='lead'.
--   3. allowed_managers has no `role` column, but SettingsTab's invite form
--      tries to upsert one — and even if it didn't error, the
--      sync_manager_role_on_insert()/_on_delete() triggers hardcode
--      role='admin' regardless of what was intended, so every invite
--      silently grants full admin instead of center/staff.
--
-- This migration fixes the schema to match what the app already assumes.
-- Safe to run multiple times.
-- ============================================================================

-- 1. Extend app_role with the roles the frontend has always used.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'center';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';

-- 2. Extend student_status with 'lead' (pre-admission enquiry stage).
ALTER TYPE public.student_status ADD VALUE IF NOT EXISTS 'lead';

-- 3. allowed_managers needs a role column — it was only ever (email, created_at).
ALTER TABLE public.allowed_managers
  ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL DEFAULT 'admin';

UPDATE public.allowed_managers SET role = 'admin' WHERE role IS NULL;

-- 4. Fix the sync triggers to grant the role that was actually invited,
--    instead of hardcoding 'admin' for every row in the whitelist table.
CREATE OR REPLACE FUNCTION public.sync_manager_role_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  registered_user_id UUID;
BEGIN
  SELECT id INTO registered_user_id FROM auth.users WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email));

  IF registered_user_id IS NOT NULL THEN
    -- Drop any previously-granted whitelist role before applying the new one
    -- (a user can only hold one of admin/center/staff via this mechanism).
    DELETE FROM public.user_roles
    WHERE user_id = registered_user_id
      AND role IN ('admin', 'center', 'staff');

    INSERT INTO public.user_roles (user_id, role)
    VALUES (registered_user_id, NEW.role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_manager_role_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  registered_user_id UUID;
BEGIN
  SELECT id INTO registered_user_id FROM auth.users WHERE LOWER(TRIM(email)) = LOWER(TRIM(OLD.email));

  IF registered_user_id IS NOT NULL AND LOWER(TRIM(OLD.email)) != 'ulfathai003@gmail.com' THEN
    DELETE FROM public.user_roles WHERE user_id = registered_user_id AND role = OLD.role;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (registered_user_id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN OLD;
END;
$$;

-- 5. has_role() master-admin bypass currently only short-circuits for the
--    'admin' role check. Extend it so the hardcoded super-admin email also
--    satisfies 'super_admin' checks (kept separate from 'admin' so existing
--    admin-only policies are unaffected).
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_master_admin BOOLEAN;
  has_matching_role BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id AND LOWER(TRIM(email)) = 'ulfathai003@gmail.com'
  ) INTO is_master_admin;

  IF is_master_admin AND _role IN ('admin', 'super_admin') THEN
    RETURN TRUE;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) INTO has_matching_role;

  RETURN has_matching_role;
END;
$$;

-- 6. RLS: centers and staff can now exist as roles, but had no policies on
--    students/fee_payments beyond "admins manage everything" + "students see
--    their own row". Add additive policies scoped to counsellor_name so a
--    center/staff member only ever touches the learners assigned to them.

DROP POLICY IF EXISTS "Centers can view assigned students" ON public.students;
CREATE POLICY "Centers can view assigned students" ON public.students
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'center') AND counsellor_name = public.current_user_email());

DROP POLICY IF EXISTS "Centers can insert assigned students" ON public.students;
CREATE POLICY "Centers can insert assigned students" ON public.students
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'center') AND counsellor_name = public.current_user_email());

DROP POLICY IF EXISTS "Centers can update assigned students" ON public.students;
CREATE POLICY "Centers can update assigned students" ON public.students
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'center') AND counsellor_name = public.current_user_email())
  WITH CHECK (public.has_role(auth.uid(), 'center') AND counsellor_name = public.current_user_email());

DROP POLICY IF EXISTS "Staff can view assigned leads" ON public.students;
CREATE POLICY "Staff can view assigned leads" ON public.students
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'staff') AND counsellor_name = public.current_user_email());

DROP POLICY IF EXISTS "Staff can update assigned leads" ON public.students;
CREATE POLICY "Staff can update assigned leads" ON public.students
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'staff') AND counsellor_name = public.current_user_email())
  WITH CHECK (public.has_role(auth.uid(), 'staff') AND counsellor_name = public.current_user_email());

DROP POLICY IF EXISTS "Centers can view their students payments" ON public.fee_payments;
CREATE POLICY "Centers can view their students payments" ON public.fee_payments
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'center')
    AND EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.counsellor_name = public.current_user_email())
  );

DROP POLICY IF EXISTS "Centers can record payments for their students" ON public.fee_payments;
CREATE POLICY "Centers can record payments for their students" ON public.fee_payments
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'center')
    AND EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.counsellor_name = public.current_user_email())
  );

-- 7. Anyone authenticated needs to be able to look up the allowed_managers
--    roster to populate "assign to" dropdowns (Enquiries tab) — currently
--    only admins can read it at all.
DROP POLICY IF EXISTS "Authenticated can view manager roster" ON public.allowed_managers;
CREATE POLICY "Authenticated can view manager roster" ON public.allowed_managers
  FOR SELECT TO authenticated
  USING (true);

-- ============================================================================
-- DONE. Verify with:
--   select enumlabel from pg_enum where enumtypid = 'public.app_role'::regtype;
--   select enumlabel from pg_enum where enumtypid = 'public.student_status'::regtype;
--   select column_name from information_schema.columns where table_name = 'allowed_managers';
-- ============================================================================
