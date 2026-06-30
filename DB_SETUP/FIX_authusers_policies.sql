-- ROOT-CAUSE FIX for the app-wide "Invalid session" / "permission denied for
-- table users" errors. Several RLS policies queried auth.users INLINE, which the
-- `authenticated` role cannot read — so EVERY logged-in action on students failed.
-- Rewritten to use the security-definer helper public.current_email().
--
-- Run once in Supabase SQL Editor. Idempotent. (Already applied to production.)

-- students: applicant self-service
drop policy if exists "Applicants can view own student row"   on public.students;
create policy "Applicants can view own student row" on public.students
  for select to authenticated using (lower(email) = public.current_email());

drop policy if exists "Applicants can insert own student row" on public.students;
create policy "Applicants can insert own student row" on public.students
  for insert to authenticated with check (lower(email) = public.current_email());

drop policy if exists "Applicants can update own student row" on public.students;
create policy "Applicants can update own student row" on public.students
  for update to authenticated using (lower(email) = public.current_email())
  with check (lower(email) = public.current_email());

-- students: the duplicate "Students can ..." set
drop policy if exists "Students can insert own record" on public.students;
create policy "Students can insert own record" on public.students
  for insert to authenticated with check (lower(email) = public.current_email());

drop policy if exists "Students can update own record" on public.students;
create policy "Students can update own record" on public.students
  for update to authenticated using (lower(email) = public.current_email())
  with check (lower(email) = public.current_email());

-- invites: admin management (was reading auth.users inline for the master email)
drop policy if exists "admins manage invites" on public.invites;
create policy "admins manage invites" on public.invites
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

notify pgrst, 'reload schema';
