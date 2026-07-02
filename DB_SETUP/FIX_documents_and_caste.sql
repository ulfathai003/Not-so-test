-- Documents + caste/sub-caste. (Already applied to production.)
-- 1) students.caste / sub_caste columns.
-- 2) storage bucket for uploaded admission documents + CRM-role policies.

alter table public.students
  add column if not exists caste text,
  add column if not exists sub_caste text;

insert into storage.buckets (id, name, public) values ('student-documents','student-documents', true)
  on conflict (id) do update set public = true;

drop policy if exists "crm upload docs" on storage.objects;
create policy "crm upload docs" on storage.objects for insert to authenticated
  with check (bucket_id='student-documents' and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'center') or public.has_role(auth.uid(),'staff')));

drop policy if exists "crm modify docs" on storage.objects;
create policy "crm modify docs" on storage.objects for update to authenticated
  using (bucket_id='student-documents');

drop policy if exists "public read docs" on storage.objects;
create policy "public read docs" on storage.objects for select using (bucket_id='student-documents');

-- NOTE: bucket is public for simple viewing. Aadhaar etc. are sensitive — for
-- production, switch to a private bucket + signed URLs on view.
