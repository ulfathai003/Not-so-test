-- FIX: staff/center "Log Negotiation" silently failed to write the follow_ups
-- activity log — the table only had an admin policy, so non-admin inserts were
-- denied by RLS (and the app ignores that error). Allow CRM roles to log and
-- read follow-ups. Run once in Supabase SQL Editor. Idempotent.

drop policy if exists "CRM roles read followups" on public.follow_ups;
create policy "CRM roles read followups" on public.follow_ups
  for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'center') or public.has_role(auth.uid(),'staff'));

drop policy if exists "CRM roles add followups" on public.follow_ups;
create policy "CRM roles add followups" on public.follow_ups
  for insert to authenticated
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'center') or public.has_role(auth.uid(),'staff'));

drop policy if exists "CRM roles update followups" on public.follow_ups;
create policy "CRM roles update followups" on public.follow_ups
  for update to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'center') or public.has_role(auth.uid(),'staff'));
