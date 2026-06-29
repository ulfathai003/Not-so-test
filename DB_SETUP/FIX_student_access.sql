-- FIX: role-based visibility of students was broken.
--
-- The whole app assigns/filters students by `counsellor_name` (the assignee's
-- login email): manager.tsx does update({counsellor_name: email}); center.tsx
-- and staff.tsx query .eq("counsellor_name", userEmail). But the RLS policies
-- authorized center/staff by `center_id` / `assigned_staff_id` — columns the
-- app NEVER populates. Result: center & staff users see ZERO students even
-- after an admin assigns work to them; cross-person hand-off doesn't work.
--
-- This realigns RLS with the app: center/staff can access the student rows
-- whose counsellor_name equals their own login email, and admin/super_admin
-- keep full access. Run once in Supabase SQL Editor. Idempotent.

-- Helper: the caller's email (lower-cased), used to match counsellor_name.
create or replace function public.current_email()
returns text language sql stable security definer set search_path = public, auth as $$
  select lower(trim(email)) from auth.users where id = auth.uid()
$$;

-- 1. Admin / super_admin: full access to every student row.
drop policy if exists "Admins manage students" on public.students;
create policy "Admins manage students" on public.students
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 2. Center: rows assigned to them (counsellor_name = their email).
drop policy if exists "Center sees own students"    on public.students;
drop policy if exists "Center inserts own students" on public.students;
drop policy if exists "Center updates own students" on public.students;

create policy "Center sees own students" on public.students
  for select to authenticated
  using (public.has_role(auth.uid(), 'center') and lower(trim(counsellor_name)) = public.current_email());

create policy "Center inserts own students" on public.students
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'center') and lower(trim(counsellor_name)) = public.current_email());

create policy "Center updates own students" on public.students
  for update to authenticated
  using (public.has_role(auth.uid(), 'center') and lower(trim(counsellor_name)) = public.current_email())
  with check (public.has_role(auth.uid(), 'center') and lower(trim(counsellor_name)) = public.current_email());

-- 3. Staff: same model (they assign-by-email too).
drop policy if exists "Staff sees assigned students"    on public.students;
drop policy if exists "Staff updates assigned students" on public.students;

create policy "Staff sees assigned students" on public.students
  for select to authenticated
  using (public.has_role(auth.uid(), 'staff') and lower(trim(counsellor_name)) = public.current_email());

create policy "Staff updates assigned students" on public.students
  for update to authenticated
  using (public.has_role(auth.uid(), 'staff') and lower(trim(counsellor_name)) = public.current_email())
  with check (public.has_role(auth.uid(), 'staff') and lower(trim(counsellor_name)) = public.current_email());

-- Applicant own-row policies (by email) are left intact.
