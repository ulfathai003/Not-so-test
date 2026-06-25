-- STEP 2 of 2 — run this AFTER STEP 1 has completed successfully.
-- Creates all missing CRM tables, policies, functions, triggers,
-- storage buckets and seed data. Idempotent: safe to re-run.


-- ===================== 20260520000000_manager_access_overhaul.sql =====================
-- Create whitelist table for pre-approved managers
CREATE TABLE IF NOT EXISTS public.allowed_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed master admin email to whitelist table for visibility
INSERT INTO public.allowed_managers (email)
VALUES ('ulfathai003@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Enable RLS on allowed_managers
ALTER TABLE public.allowed_managers ENABLE ROW LEVEL SECURITY;

-- 1. Upgrade the public.has_role() function to handle the master superuser email instantly
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
  -- Always return true if it's the admin role and user's email matches master superuser
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id AND LOWER(TRIM(email)) = 'ulfathai003@gmail.com'
  ) INTO is_master_admin;

  IF is_master_admin AND _role = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- Otherwise check the user_roles table
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) INTO has_matching_role;

  RETURN has_matching_role;
END;
$$;

-- 2. Upgrade handle_new_user() trigger function to check whitelist on registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_whitelisted BOOLEAN;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));

  -- Check if the email is whitelisted or is the master email
  SELECT EXISTS (
    SELECT 1 FROM public.allowed_managers
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
  ) OR LOWER(TRIM(NEW.email)) = 'ulfathai003@gmail.com' INTO is_whitelisted;

  -- Assign admin role if whitelisted/master, otherwise student
  IF is_whitelisted THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Dynamic triggers on allowed_managers to sync with user_roles in real-time
CREATE OR REPLACE FUNCTION public.sync_manager_role_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  registered_user_id UUID;
BEGIN
  -- Find the user's UUID from auth.users if they have registered already
  SELECT id INTO registered_user_id FROM auth.users WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email));

  IF registered_user_id IS NOT NULL THEN
    -- Remove student role to avoid conflict
    DELETE FROM public.user_roles WHERE user_id = registered_user_id;
    -- Promote to admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (registered_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_manager_role_on_insert ON public.allowed_managers;
CREATE TRIGGER trg_sync_manager_role_on_insert
  AFTER INSERT ON public.allowed_managers
  FOR EACH ROW EXECUTE FUNCTION public.sync_manager_role_on_insert();

CREATE OR REPLACE FUNCTION public.sync_manager_role_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  registered_user_id UUID;
BEGIN
  -- Find the user's UUID from auth.users
  SELECT id INTO registered_user_id FROM auth.users WHERE LOWER(TRIM(email)) = LOWER(TRIM(OLD.email));

  -- Do not downgrade the master account under any circumstance
  IF registered_user_id IS NOT NULL AND LOWER(TRIM(OLD.email)) != 'ulfathai003@gmail.com' THEN
    -- Revoke admin role
    DELETE FROM public.user_roles WHERE user_id = registered_user_id AND role = 'admin';
    -- Re-assign standard student role as fallback
    INSERT INTO public.user_roles (user_id, role)
    VALUES (registered_user_id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_manager_role_on_delete ON public.allowed_managers;
CREATE TRIGGER trg_sync_manager_role_on_delete
  AFTER DELETE ON public.allowed_managers
  FOR EACH ROW EXECUTE FUNCTION public.sync_manager_role_on_delete();

-- 4. Set RLS policies for allowed_managers so only admins can manage it
DROP POLICY IF EXISTS "Admins can manage allowed managers" ON public.allowed_managers;
CREATE POLICY "Admins can manage allowed managers" ON public.allowed_managers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===================== 20260611000000_mobile_login.sql =====================
-- Mobile sign-in support: resolve a phone number to the account's email
-- so the client can call auth.signInWithPassword with it.

-- 1. Store phone on profiles (optional, admin-editable)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique
  ON public.profiles (phone) WHERE phone IS NOT NULL;

-- 2. Lookup function: matches the last 10 digits of the input against
--    profiles.phone, then students.phone, then signup metadata.
CREATE OR REPLACE FUNCTION public.email_for_phone(p_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_digits TEXT;
  v_email TEXT;
BEGIN
  v_digits := right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10);
  IF length(v_digits) < 10 THEN
    RETURN NULL;
  END IF;

  -- a) explicit phone on the user's profile
  SELECT u.email INTO v_email
  FROM public.profiles pr
  JOIN auth.users u ON u.id = pr.id
  WHERE right(regexp_replace(coalesce(pr.phone, ''), '\D', '', 'g'), 10) = v_digits
  LIMIT 1;

  -- b) phone captured in signup metadata
  IF v_email IS NULL THEN
    SELECT u.email INTO v_email
    FROM auth.users u
    WHERE right(regexp_replace(coalesce(u.raw_user_meta_data->>'phone', ''), '\D', '', 'g'), 10) = v_digits
    LIMIT 1;
  END IF;

  -- c) student records (for applicants registered by the desk)
  IF v_email IS NULL THEN
    SELECT s.email INTO v_email
    FROM public.students s
    WHERE right(regexp_replace(coalesce(s.phone, ''), '\D', '', 'g'), 10) = v_digits
    LIMIT 1;
  END IF;

  RETURN v_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.email_for_phone(TEXT) TO anon, authenticated;

-- ===================== 20260611010000_center_staff_roles.sql =====================
-- Enable real "center" and "staff" roles so the manager Settings invite flow
-- actually grants those roles (previously the enum only had admin/student).

-- 1. Extend the role enum. (Safe in PG12+: values are only referenced at
--    runtime by the trigger functions below, never within this transaction.)

-- 2. Remember which role each invited manager should receive.
ALTER TABLE public.allowed_managers
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'center';

-- 3. On signup, grant the role chosen in the Settings invite (admin/center/staff),
--    falling back to student for everyone else.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invited_role TEXT;
BEGIN
  -- Create profile (carry phone through from signup metadata when present)
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE
    SET phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

  -- Master superuser is always admin
  IF LOWER(TRIM(NEW.email)) = 'ulfathai003@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin') ON CONFLICT (user_id, role) DO NOTHING;
    RETURN NEW;
  END IF;

  -- Whitelisted manager? use the role picked when they were invited
  SELECT role INTO invited_role
  FROM public.allowed_managers
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
  LIMIT 1;

  IF invited_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, invited_role::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 4. When a manager is invited AFTER they already registered, sync their role live.
CREATE OR REPLACE FUNCTION public.sync_manager_role_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  registered_user_id UUID;
BEGIN
  SELECT id INTO registered_user_id
  FROM auth.users WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email));

  IF registered_user_id IS NOT NULL THEN
    -- Replace any existing role with the freshly chosen one
    DELETE FROM public.user_roles WHERE user_id = registered_user_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (registered_user_id, COALESCE(NEW.role, 'center')::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- ===================== 20260619000000_invite_system.sql =====================
-- Invite-based onboarding for admin / center / staff roles.
-- Super admin (or ulfathai003@gmail.com) creates invites; signup consumes
-- a token to provision a role atomically.

create extension if not exists pgcrypto;

create table if not exists public.invites (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  role         text not null check (role in ('admin','center','staff')),
  token        text not null unique,
  invited_by   uuid references auth.users(id) on delete set null,
  expires_at   timestamptz not null default (now() + interval '7 days'),
  consumed_at  timestamptz,
  consumed_by  uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists invites_email_idx        on public.invites (lower(email));
create index if not exists invites_token_active_idx on public.invites (token) where consumed_at is null;

alter table public.invites enable row level security;

-- Admin / master can manage every invite row.
drop policy if exists "admins manage invites" on public.invites;
create policy "admins manage invites" on public.invites
  for all
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
    or (select email from auth.users where id = auth.uid()) = 'ulfathai003@gmail.com'
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
    or (select email from auth.users where id = auth.uid()) = 'ulfathai003@gmail.com'
  );

-- Anyone holding a token can look it up (token itself is the secret).
drop policy if exists "lookup invite by token" on public.invites;
create policy "lookup invite by token" on public.invites
  for select using (true);

create or replace function public.generate_invite_token()
returns text language plpgsql security definer as $$
declare t text;
begin
  t := encode(gen_random_bytes(24), 'hex');
  return t;
end;
$$;

-- Admin-only: issue a fresh invite. Returns the token used to build the share URL.
create or replace function public.issue_invite(p_email text, p_role text)
returns table (id uuid, email text, role text, token text, expires_at timestamptz)
language plpgsql security definer
set search_path = public, auth
as $$
declare
  caller_email text;
  is_admin boolean := false;
begin
  select au.email into caller_email from auth.users au where au.id = auth.uid();
  if caller_email = 'ulfathai003@gmail.com' then
    is_admin := true;
  else
    select exists(
      select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'
    ) into is_admin;
  end if;

  if not is_admin then
    raise exception 'Only admin may issue invites';
  end if;

  if p_role not in ('admin','center','staff') then
    raise exception 'Invalid role';
  end if;

  return query
  insert into public.invites (email, role, token, invited_by)
  values (lower(trim(p_email)), p_role, public.generate_invite_token(), auth.uid())
  returning invites.id, invites.email, invites.role, invites.token, invites.expires_at;
end;
$$;

-- Consume an invite: validate, insert the role row, mark used.
create or replace function public.consume_invite(p_token text, p_email text)
returns text
language plpgsql security definer
set search_path = public, auth
as $$
declare
  inv public.invites%rowtype;
  uid uuid := auth.uid();
  user_email text;
begin
  if uid is null then
    raise exception 'Must be signed in to consume an invite';
  end if;

  select email into user_email from auth.users where id = uid;
  if lower(user_email) <> lower(trim(p_email)) then
    raise exception 'Signed-in email does not match invite email';
  end if;

  select * into inv from public.invites where token = p_token for update;
  if not found then
    raise exception 'Invite not found';
  end if;
  if inv.consumed_at is not null then
    raise exception 'Invite already used';
  end if;
  if inv.expires_at < now() then
    raise exception 'Invite expired';
  end if;
  if lower(inv.email) <> lower(user_email) then
    raise exception 'Invite is for a different email';
  end if;

  insert into public.user_roles (user_id, role)
  values (uid, inv.role)
  on conflict do nothing;

  update public.invites
     set consumed_at = now(), consumed_by = uid
   where id = inv.id;

  return inv.role;
end;
$$;

grant execute on function public.issue_invite(text, text)   to authenticated;
grant execute on function public.consume_invite(text, text) to authenticated;

-- ===================== 20260619100000_public_lead_intake.sql =====================
-- Public lead intake.
--
-- The contact form (and admission-desk) are public pages — anonymous
-- visitors cannot satisfy the admin-only RLS policies on `students`,
-- so prior submissions silently 403'd and never reached the CRM.
--
-- Fix: a tightly-scoped SECURITY DEFINER RPC that lets anon insert a
-- single "lead" row with whitelisted fields. Nothing else about the
-- existing student RLS changes.

create or replace function public.submit_inquiry(
  p_full_name   text,
  p_email       text,
  p_phone       text default null,
  p_university  text default null,
  p_program     text default null,
  p_specialization text default null,
  p_notes       text default null,
  p_location    text default 'Website Inbound'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  new_id uuid;
  norm_program text;
begin
  if p_full_name is null or btrim(p_full_name) = '' then
    raise exception 'Full name is required';
  end if;
  if p_email is null or btrim(p_email) = '' then
    raise exception 'Email is required';
  end if;

  -- Normalise program text against the existing enum-ish set without
  -- erroring on free-form values.
  norm_program := coalesce(p_program, '');
  norm_program := case
    when norm_program ~* '10th'               then '10th'
    when norm_program ~* '12th.*arts'         then '12th Arts'
    when norm_program ~* '12th.*commerce'     then '12th Commerce'
    when norm_program ~* '12th.*science'      then '12th Science'
    when norm_program ~* '\mbba\M'            then 'BBA'
    when norm_program ~* '\mmba\M'            then 'MBA'
    when norm_program ~* '\mbca\M'            then 'BCA'
    when norm_program ~* '\mmca\M'            then 'MCA'
    when norm_program ~* '\mbcom\M|b\.com'    then 'BCom'
    when norm_program ~* '\mmcom\M|m\.com'    then 'MCom'
    when norm_program ~* '\mba\M$|^ba$'       then 'BA'
    when norm_program ~* '\mma\M$|^ma$'       then 'MA'
    else 'BBA'  -- safe default; manager re-categorises in CRM
  end;

  insert into public.students (
    full_name, email, phone, university, program, specialization,
    notes, status, batch_year, location
  )
  values (
    btrim(p_full_name),
    lower(btrim(p_email)),
    nullif(btrim(coalesce(p_phone, '')), ''),
    nullif(btrim(coalesce(p_university, '')), ''),
    norm_program,
    nullif(btrim(coalesce(p_specialization, '')), ''),
    nullif(btrim(coalesce(p_notes, '')), ''),
    'lead',
    extract(year from now())::int,
    coalesce(nullif(btrim(p_location), ''), 'Website Inbound')
  )
  returning id into new_id;

  return new_id;
end;
$$;

-- Public callable: the anon JWT role uses this RPC, no direct table write.
grant execute on function public.submit_inquiry(
  text, text, text, text, text, text, text, text
) to anon, authenticated;

-- Light abuse guard: cap one submission per email per minute.
create or replace function public.tg_rate_limit_lead_inserts()
returns trigger language plpgsql as $$
begin
  if new.status = 'lead' and exists (
    select 1 from public.students
    where email = new.email
      and created_at > now() - interval '1 minute'
  ) then
    raise exception 'Please wait a moment before submitting another inquiry.';
  end if;
  return new;
end;
$$;

drop trigger if exists rate_limit_lead_inserts on public.students;
create trigger rate_limit_lead_inserts
  before insert on public.students
  for each row execute function public.tg_rate_limit_lead_inserts();

-- Applicants (authenticated, no special role) can manage ONLY their
-- own student row identified by matching email. They cannot see or
-- touch anybody else's record. Admin/center/staff continue to use
-- their existing wider policies.
drop policy if exists "Applicants can view own student row"   on public.students;
drop policy if exists "Applicants can insert own student row" on public.students;
drop policy if exists "Applicants can update own student row" on public.students;

create policy "Applicants can view own student row" on public.students
  for select to authenticated
  using (
    email = (select au.email from auth.users au where au.id = auth.uid())
  );

create policy "Applicants can insert own student row" on public.students
  for insert to authenticated
  with check (
    email = (select au.email from auth.users au where au.id = auth.uid())
  );

create policy "Applicants can update own student row" on public.students
  for update to authenticated
  using (
    email = (select au.email from auth.users au where au.id = auth.uid())
  )
  with check (
    email = (select au.email from auth.users au where au.id = auth.uid())
  );

-- ===================== 20260619200000_super_admin_enum.sql =====================
-- Step 1 of 2 for the full CRM build-out. Run this file ALONE first and let
-- it commit before running 20260620000000_full_crm_buildout.sql — Postgres
-- forbids using a brand-new enum value in the same transaction that added
-- it, and the next migration's policies/functions reference 'super_admin'
-- immediately.


-- Defensive: public_lead_intake.sql inserts status='lead' but no migration
-- file adds it to the enum (it may already exist live from a manual SQL
-- editor change). Add the full set of statuses this build introduces too.

-- ===================== 20260620000000_full_crm_buildout.sql =====================
-- Full CRM build-out: super_admin tier, Centers/Employees as first-class
-- entities, document uploads, payment allocation+approval, DB-backed
-- Universities/Boards, admission/enrollment numbering, approvals workflow.
--
-- REQUIRES 20260619200000_super_admin_enum.sql to have already been run
-- and committed (separate paste) — this file uses the 'super_admin' enum
-- value immediately in policies/functions.
--
-- Idempotent: safe to re-run if pasted twice.

-- =========================================================================
-- 1. Roles: master email now seeds super_admin (was admin). has_role(_,
--    'admin') keeps matching super_admins too, so every existing "Admins
--    can ..." policy in prior migrations continues to work for the super
--    admin without being rewritten.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_master BOOLEAN;
  has_matching BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id AND LOWER(TRIM(email)) = 'ulfathai003@gmail.com'
  ) INTO is_master;

  IF is_master AND _role IN ('admin', 'super_admin') THEN
    RETURN TRUE;
  END IF;

  IF _role = 'admin' THEN
    -- super_admin is a strict superset of admin: anything gated on
    -- has_role(uid,'admin') must also work for the super admin.
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role IN ('admin', 'super_admin')
    ) INTO has_matching;
    RETURN has_matching;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) INTO has_matching;

  RETURN has_matching;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invited_role TEXT;
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE
    SET phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

  IF LOWER(TRIM(NEW.email)) = 'ulfathai003@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin') ON CONFLICT (user_id, role) DO NOTHING;
    RETURN NEW;
  END IF;

  SELECT role INTO invited_role
  FROM public.allowed_managers
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
  LIMIT 1;

  IF invited_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, invited_role::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- One-time backfill: if the master account already has a 'admin' row from
-- before this migration, replace it with 'super_admin' so user_roles (which
-- the client reads directly) reflects the new tier immediately.
DELETE FROM public.user_roles ur
USING auth.users u
WHERE ur.user_id = u.id
  AND LOWER(TRIM(u.email)) = 'ulfathai003@gmail.com'
  AND ur.role = 'admin';

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'super_admin'
FROM auth.users u
WHERE LOWER(TRIM(u.email)) = 'ulfathai003@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- =========================================================================
-- 2. Centers & Employees as first-class entities (super_admin creates both
--    directly with a password via the new /api/create-account endpoint).
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin manages centers" ON public.centers;
CREATE POLICY "Super admin manages centers" ON public.centers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Center can view own row" ON public.centers;
CREATE POLICY "Center can view own row" ON public.centers
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  center_id UUID REFERENCES public.centers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin manages employees" ON public.employees;
CREATE POLICY "Super admin manages employees" ON public.employees
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Employee can view own row" ON public.employees;
CREATE POLICY "Employee can view own row" ON public.employees
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- =========================================================================
-- 3. Students: admission/enrollment numbering, fee structure, assignment
-- =========================================================================

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS center_id UUID REFERENCES public.centers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_staff_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS admission_number TEXT,
  ADD COLUMN IF NOT EXISTS course_fee NUMERIC,
  ADD COLUMN IF NOT EXISTS discount NUMERIC,
  ADD COLUMN IF NOT EXISTS negotiated_fee NUMERIC,
  ADD COLUMN IF NOT EXISTS final_fee NUMERIC,
  ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- Centers see only their own students (by center_id); staff see only
-- students assigned to them. Existing admin/super_admin policies already
-- grant full visibility via has_role(uid,'admin').
DROP POLICY IF EXISTS "Center sees own students" ON public.students;
CREATE POLICY "Center sees own students" ON public.students
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'center')
    AND center_id IN (SELECT id FROM public.centers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Center inserts own students" ON public.students;
CREATE POLICY "Center inserts own students" ON public.students
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'center')
    AND center_id IN (SELECT id FROM public.centers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Center updates own students" ON public.students;
CREATE POLICY "Center updates own students" ON public.students
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'center')
    AND center_id IN (SELECT id FROM public.centers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Staff sees assigned students" ON public.students;
CREATE POLICY "Staff sees assigned students" ON public.students
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'staff')
    AND assigned_staff_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Staff updates assigned students" ON public.students;
CREATE POLICY "Staff updates assigned students" ON public.students
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'staff')
    AND assigned_staff_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  );

-- =========================================================================
-- 4. Documents (Aadhaar / Photo / Marksheets) — metadata row per upload
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('aadhaar', 'photo', 'marksheet_10', 'marksheet_12', 'other')),
  file_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CRM roles manage documents" ON public.documents;
CREATE POLICY "CRM roles manage documents" ON public.documents
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'center')
    OR public.has_role(auth.uid(), 'staff')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'center')
    OR public.has_role(auth.uid(), 'staff')
  );

-- =========================================================================
-- 5. Payments: multi-student allocation + super_admin approval flow
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.payment_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  utr_number TEXT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  screenshot_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_batches ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.payment_batches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id),
  amount NUMERIC NOT NULL
);
ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CRM roles submit payment batches" ON public.payment_batches;
CREATE POLICY "CRM roles submit payment batches" ON public.payment_batches
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'center')
  );

DROP POLICY IF EXISTS "CRM roles view payment batches" ON public.payment_batches;
CREATE POLICY "CRM roles view payment batches" ON public.payment_batches
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'center') AND submitted_by = auth.uid())
  );

DROP POLICY IF EXISTS "Super admin reviews payment batches" ON public.payment_batches;
CREATE POLICY "Super admin reviews payment batches" ON public.payment_batches
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "CRM roles manage payment allocations" ON public.payment_allocations;
CREATE POLICY "CRM roles manage payment allocations" ON public.payment_allocations
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.payment_batches b
      WHERE b.id = batch_id AND b.submitted_by = auth.uid()
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.payment_batches b
      WHERE b.id = batch_id AND b.submitted_by = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.approve_payment_batch(p_batch_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alloc RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only the super admin can approve payments';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.payment_batches WHERE id = p_batch_id AND status = 'pending') THEN
    RAISE EXCEPTION 'Payment batch is not pending';
  END IF;

  FOR alloc IN SELECT student_id, amount FROM public.payment_allocations WHERE batch_id = p_batch_id LOOP
    INSERT INTO public.fee_payments (student_id, amount, payment_date, payment_mode, notes)
    SELECT alloc.student_id, alloc.amount, b.payment_date, 'UTR', 'Batch ' || b.id || ' / UTR ' || COALESCE(b.utr_number, '-')
    FROM public.payment_batches b WHERE b.id = p_batch_id;
  END LOOP;

  UPDATE public.payment_batches
    SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
    WHERE id = p_batch_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_payment_batch(p_batch_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only the super admin can reject payments';
  END IF;

  UPDATE public.payment_batches
    SET status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now(), rejection_reason = p_reason
    WHERE id = p_batch_id AND status = 'pending';
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_payment_batch(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_payment_batch(UUID, TEXT) TO authenticated;

-- =========================================================================
-- 6. Universities & Boards — move off the static catalog into the DB
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.universities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  ranking TEXT,
  affiliation TEXT,
  highlight TEXT,
  logo_url TEXT,
  description TEXT,
  approvals_info TEXT,
  fee_structure_info TEXT,
  eligibility_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.university_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id TEXT NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  eligibility TEXT
);
ALTER TABLE public.university_courses ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.boards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT,
  body TEXT,
  description TEXT,
  eligibility TEXT,
  subjects TEXT[],
  highlight TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads universities" ON public.universities;
CREATE POLICY "Public reads universities" ON public.universities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Super admin writes universities" ON public.universities;
CREATE POLICY "Super admin writes universities" ON public.universities
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Public reads university courses" ON public.university_courses;
CREATE POLICY "Public reads university courses" ON public.university_courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Super admin writes university courses" ON public.university_courses;
CREATE POLICY "Super admin writes university courses" ON public.university_courses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Public reads boards" ON public.boards;
CREATE POLICY "Public reads boards" ON public.boards FOR SELECT USING (true);
DROP POLICY IF EXISTS "Super admin writes boards" ON public.boards;
CREATE POLICY "Super admin writes boards" ON public.boards
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

INSERT INTO public.universities (id, name, city, ranking, affiliation, highlight, description) VALUES
  ('jain', 'Jain (Deemed-to-be) University', 'Bengaluru', '#68 NIRF Ranking', 'UGC-DEB, AICTE Approved', 'Industry-aligned specializations and top-tier placement support.', 'Jain University is a hub for learning in every sense of the word. A regular recipient of NAAC A++ accreditation, it offers a world-class environment for online management and computer application studies.'),
  ('manipal', 'Manipal University', 'Manipal', 'A++ Grade by NAAC', 'UGC-DEB Approved', 'Access to a global alumni network of over 300,000 professionals.', 'Manipal Academy of Higher Education (MAHE) is an Institution of Eminence. Their online vertical brings the same academic rigour and prestige to your home screen.'),
  ('amity', 'Amity University', 'Noida', 'Top 3% Globally', 'UGC-DEB, WASC (USA) Accredited', 'Live interactive sessions with global faculty.', 'Amity University Online is devoted to creating a transformative learning environment. With a presence in London, Dubai, and Singapore, they offer a truly global perspective.'),
  ('nmims', 'NMIMS', 'Mumbai', 'Category 1 Autonomy', 'UGC-DEB Approved', 'Career services that have served over 12,000 learners.', 'Narsee Monjee Institute of Management Studies is India''s premier destination for management education. Their distance programs are powered by the same legendary faculty.'),
  ('sikkim-board', 'Sikkim Board (SBSE)', 'Gangtok', 'Government Recognised', 'State Government of Sikkim', 'Simplified examination patterns and widespread validity for higher studies.', 'The Sikkim Board of Secondary Education (SBSE) provides a recognized and flexible path for students to complete their Class 10 and 12 certifications. It is an ideal board for those returning to education after a gap.'),
  ('lpu', 'LPU (Lovely Professional University)', 'Phagwara', 'Top Private University', 'UGC-DEB, NAAC A++', 'Innovative pedagogy and weekend live masterclasses.', 'LPU Online is known for its technological edge. They offer one of the most sophisticated Learning Management Systems (LMS) in the country, ensuring a seamless student experience.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.university_courses (university_id, name) VALUES
  ('jain', 'Online MBA'), ('jain', 'Online MCA'), ('jain', 'Online BBA'), ('jain', 'Online B.Com'),
  ('manipal', 'Online MBA'), ('manipal', 'Online MCA'), ('manipal', 'Online BBA'), ('manipal', 'Online B.Com'), ('manipal', 'Online BCA'),
  ('amity', 'Online MBA'), ('amity', 'Online BBA'), ('amity', 'Online BCA'), ('amity', 'Online MCA'), ('amity', 'Online BA'),
  ('nmims', 'Online MBA'), ('nmims', 'Post Graduate Diploma'), ('nmims', 'Online BBA'),
  ('sikkim-board', 'Secondary (10th)'), ('sikkim-board', 'Senior Secondary (12th)'),
  ('lpu', 'Online MBA'), ('lpu', 'Online MCA'), ('lpu', 'Online BBA'), ('lpu', 'Online BCA')
ON CONFLICT DO NOTHING;

INSERT INTO public.boards (id, name, level, body, description, eligibility, subjects, highlight) VALUES
  ('sbse-10', 'Sikkim Board (SBSE) — Secondary', '10th', 'Sikkim Board of Secondary Education · Gangtok', 'The SBSE Secondary certificate is a government-recognized Class 10 qualification, designed for learners who left school early and now need a valid matriculation credential to move forward.', 'Previous grade marks card · No upper age limit', ARRAY['English','Mathematics','Science','Social Science','Regional Language'], 'Simplified examination pattern with flexible study schedules.'),
  ('sbse-12', 'Sikkim Board (SBSE) — Senior Secondary', '12th', 'Sikkim Board of Secondary Education · Gangtok', 'The SBSE Senior Secondary certificate is a recognized Class 12 qualification that opens the door to undergraduate study, including the online degree programs listed in our university directory.', 'Class 10 marks card from any recognized board', ARRAY['English','Accountancy','Business Studies','Economics','Political Science'], 'Direct pathway into UGC-DEB approved online degrees.'),
  ('nios-10', 'NIOS — Secondary', '10th', 'National Institute of Open Schooling · NOIDA', 'NIOS is the world''s largest open schooling system, run by the Government of India. Its Secondary course offers Class 10 certification with on-demand examinations and full subject flexibility.', 'Age 14+ · Self-certification of Class 8 level study', ARRAY['English','Mathematics','Science & Technology','Social Science','Data Entry Operations'], 'On-demand exams — appear when you are ready.'),
  ('nios-12', 'NIOS — Senior Secondary', '12th', 'National Institute of Open Schooling · NOIDA', 'The NIOS Senior Secondary course is a Class 12 qualification accepted by universities and government bodies across India, with the freedom to choose your own subject combination.', 'Class 10 pass from any recognized board', ARRAY['English','Accountancy','Business Studies','Economics','Psychology'], 'Choose any subject combination — commerce, arts or science.')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 7. Counters — atomic sequence generator for ADM-YYYY-#### / ENR-... numbers
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.counters (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CRM roles use counters" ON public.counters;
CREATE POLICY "CRM roles use counters" ON public.counters
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'center') OR public.has_role(auth.uid(), 'staff'));

CREATE OR REPLACE FUNCTION public.next_counter(p_key TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v INTEGER;
BEGIN
  INSERT INTO public.counters (key, value) VALUES (p_key, 1)
  ON CONFLICT (key) DO UPDATE SET value = public.counters.value + 1
  RETURNING value INTO v;
  RETURN v;
END;
$$;

GRANT EXECUTE ON FUNCTION public.next_counter(TEXT) TO authenticated;

-- =========================================================================
-- 8. Storage buckets for documents and payment screenshots (private)
-- =========================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', false), ('payment-screenshots', 'payment-screenshots', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "CRM roles manage student document files" ON storage.objects;
CREATE POLICY "CRM roles manage student document files" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'student-documents'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'center') OR public.has_role(auth.uid(), 'staff'))
  )
  WITH CHECK (
    bucket_id = 'student-documents'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'center') OR public.has_role(auth.uid(), 'staff'))
  );

DROP POLICY IF EXISTS "CRM roles manage payment screenshot files" ON storage.objects;
CREATE POLICY "CRM roles manage payment screenshot files" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'payment-screenshots'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'center'))
  )
  WITH CHECK (
    bucket_id = 'payment-screenshots'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'center'))
  );

-- ===================== 20260625000000_audit_notes_timeline.sql =====================
-- =========================================================================
-- Audit & history layer (spec: "Never overwrite history. Always append.",
-- "Every update must be logged.", "UTR must be unique.")
--
-- Adds: student_notes, student_timeline, activity_logs, a UTR uniqueness
-- guard, the 'invoices' storage bucket, and defensive triggers that append
-- timeline + activity entries automatically on key events.
--
-- Idempotent: safe to run multiple times.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Notes — unlimited notes per student; never deleted, edits tracked.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  note TEXT NOT NULL,
  edited_by UUID REFERENCES auth.users(id),
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CRM roles read notes" ON public.student_notes;
CREATE POLICY "CRM roles read notes" ON public.student_notes
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'center') OR public.has_role(auth.uid(),'staff'));

DROP POLICY IF EXISTS "CRM roles add notes" ON public.student_notes;
CREATE POLICY "CRM roles add notes" ON public.student_notes
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'center') OR public.has_role(auth.uid(),'staff'));

-- Authors may edit their own note (history preserved via edited_by/edited_at);
-- no DELETE policy is granted, so notes can never be removed.
DROP POLICY IF EXISTS "Authors edit own notes" ON public.student_notes;
CREATE POLICY "Authors edit own notes" ON public.student_notes
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_student_notes_student ON public.student_notes(student_id);

-- -------------------------------------------------------------------------
-- 2. Timeline — permanent, append-only event log per student.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_timeline ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CRM roles read timeline" ON public.student_timeline;
CREATE POLICY "CRM roles read timeline" ON public.student_timeline
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'center') OR public.has_role(auth.uid(),'staff'));

DROP POLICY IF EXISTS "CRM roles append timeline" ON public.student_timeline;
CREATE POLICY "CRM roles append timeline" ON public.student_timeline
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'center') OR public.has_role(auth.uid(),'staff'));

CREATE INDEX IF NOT EXISTS idx_student_timeline_student ON public.student_timeline(student_id);

-- -------------------------------------------------------------------------
-- 3. Activity logs — every important action, with before/after values.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  entity TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read activity logs" ON public.activity_logs;
CREATE POLICY "Admins read activity logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "CRM roles write activity logs" ON public.activity_logs;
CREATE POLICY "CRM roles write activity logs" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'center') OR public.has_role(auth.uid(),'staff'));

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity, entity_id);

-- -------------------------------------------------------------------------
-- 4. UTR uniqueness — duplicate UTR is not allowed (ignores NULLs).
-- -------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_batches_utr
  ON public.payment_batches (utr_number)
  WHERE utr_number IS NOT NULL AND utr_number <> '';

-- -------------------------------------------------------------------------
-- 5. invoices storage bucket (dashboard invoice uploads).
-- -------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Admins manage invoice files" ON storage.objects;
CREATE POLICY "Admins manage invoice files" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'invoices' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'invoices' AND public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Public reads invoice files" ON storage.objects;
CREATE POLICY "Public reads invoice files" ON storage.objects
  FOR SELECT USING (bucket_id = 'invoices');

-- -------------------------------------------------------------------------
-- 6. Defensive auto-logging triggers.
--    Wrapped in EXCEPTION handlers so an audit-write failure can NEVER
--    block the underlying student/document/payment operation.
-- -------------------------------------------------------------------------

-- Student lifecycle -> timeline + activity_logs
CREATE OR REPLACE FUNCTION public.tg_log_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO public.student_timeline (student_id, actor_id, action, notes)
      VALUES (NEW.id, auth.uid(), 'Student created', NEW.full_name);
      INSERT INTO public.activity_logs (actor_id, entity, entity_id, action, new_value)
      VALUES (auth.uid(), 'student', NEW.id, 'Created student', to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO public.student_timeline (student_id, actor_id, action, notes)
        VALUES (NEW.id, auth.uid(), 'Status changed', COALESCE(OLD.status,'-') || ' -> ' || COALESCE(NEW.status,'-'));
        INSERT INTO public.activity_logs (actor_id, entity, entity_id, action, previous_value, new_value)
        VALUES (auth.uid(), 'student', NEW.id, 'Changed status', to_jsonb(OLD.status), to_jsonb(NEW.status));
      END IF;
      IF NEW.enrollment_number IS DISTINCT FROM OLD.enrollment_number AND NEW.enrollment_number IS NOT NULL THEN
        INSERT INTO public.student_timeline (student_id, actor_id, action, notes)
        VALUES (NEW.id, auth.uid(), 'Enrollment number assigned', NEW.enrollment_number);
        INSERT INTO public.activity_logs (actor_id, entity, entity_id, action, previous_value, new_value)
        VALUES (auth.uid(), 'student', NEW.id, 'Assigned enrollment number', to_jsonb(OLD.enrollment_number), to_jsonb(NEW.enrollment_number));
      END IF;
      IF NEW.final_fee IS DISTINCT FROM OLD.final_fee OR NEW.course_fee IS DISTINCT FROM OLD.course_fee THEN
        INSERT INTO public.student_timeline (student_id, actor_id, action, notes)
        VALUES (NEW.id, auth.uid(), 'Fee structure updated', NULL);
        INSERT INTO public.activity_logs (actor_id, entity, entity_id, action, previous_value, new_value)
        VALUES (auth.uid(), 'student', NEW.id, 'Changed fee', jsonb_build_object('course_fee',OLD.course_fee,'final_fee',OLD.final_fee), jsonb_build_object('course_fee',NEW.course_fee,'final_fee',NEW.final_fee));
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Never let audit logging break the real operation.
    NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_student ON public.students;
CREATE TRIGGER trg_log_student
  AFTER INSERT OR UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.tg_log_student();

-- Document uploads -> timeline + activity
CREATE OR REPLACE FUNCTION public.tg_log_document()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.student_timeline (student_id, actor_id, action, notes)
    VALUES (NEW.student_id, auth.uid(), 'Document uploaded', NEW.doc_type);
    INSERT INTO public.activity_logs (actor_id, entity, entity_id, action, new_value)
    VALUES (auth.uid(), 'document', NEW.id, 'Uploaded ' || NEW.doc_type, to_jsonb(NEW));
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_document ON public.documents;
CREATE TRIGGER trg_log_document
  AFTER INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.tg_log_document();

-- Payment batch lifecycle -> activity (+ timeline per allocated student)
CREATE OR REPLACE FUNCTION public.tg_log_payment_batch()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alloc RECORD;
BEGIN
  BEGIN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO public.activity_logs (actor_id, entity, entity_id, action, new_value, remarks)
      VALUES (auth.uid(), 'payment_batch', NEW.id, 'Payment submitted', to_jsonb(NEW), 'UTR ' || COALESCE(NEW.utr_number,'-'));
    ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.activity_logs (actor_id, entity, entity_id, action, previous_value, new_value, remarks)
      VALUES (auth.uid(), 'payment_batch', NEW.id, 'Payment ' || NEW.status, to_jsonb(OLD.status), to_jsonb(NEW.status), NEW.rejection_reason);
      FOR alloc IN SELECT student_id FROM public.payment_allocations WHERE batch_id = NEW.id LOOP
        INSERT INTO public.student_timeline (student_id, actor_id, action, notes)
        VALUES (alloc.student_id, auth.uid(), 'Payment ' || NEW.status, 'UTR ' || COALESCE(NEW.utr_number,'-'));
      END LOOP;
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_payment_batch ON public.payment_batches;
CREATE TRIGGER trg_log_payment_batch
  AFTER INSERT OR UPDATE ON public.payment_batches
  FOR EACH ROW EXECUTE FUNCTION public.tg_log_payment_batch();

-- Keep edited_at/edited_by honest on note edits.
CREATE OR REPLACE FUNCTION public.tg_note_edit_stamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.note IS DISTINCT FROM OLD.note THEN
    NEW.edited_by := auth.uid();
    NEW.edited_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_note_edit_stamp ON public.student_notes;
CREATE TRIGGER trg_note_edit_stamp
  BEFORE UPDATE ON public.student_notes
  FOR EACH ROW EXECUTE FUNCTION public.tg_note_edit_stamp();
