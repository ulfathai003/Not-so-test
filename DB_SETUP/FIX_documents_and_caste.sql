-- Documents + caste/sub-caste. (Already applied to production.)
-- 1) students.caste / sub_caste columns.
-- 2) storage bucket for uploaded admission documents + CRM-role policies.

alter table public.students
  add column if not exists caste text,
  add column if not exists sub_caste text;

-- Private bucket (documents are sensitive), 5 MB cap, images/PDF only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('student-documents','student-documents', false, 5242880,
          array['image/png','image/jpeg','image/jpg','image/webp','application/pdf'])
  on conflict (id) do update
    set public = false, file_size_limit = 5242880,
        allowed_mime_types = array['image/png','image/jpeg','image/jpg','image/webp','application/pdf'];

drop policy if exists "crm upload docs" on storage.objects;
create policy "crm upload docs" on storage.objects for insert to authenticated
  with check (bucket_id='student-documents' and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'center') or public.has_role(auth.uid(),'staff')));

drop policy if exists "crm modify docs" on storage.objects;
create policy "crm modify docs" on storage.objects for update to authenticated
  using (bucket_id='student-documents');

-- Private: only logged-in CRM roles can read (used to mint short-lived signed URLs).
drop policy if exists "public read docs" on storage.objects;
drop policy if exists "crm read docs" on storage.objects;
create policy "crm read docs" on storage.objects for select to authenticated
  using (bucket_id='student-documents' and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'center') or public.has_role(auth.uid(),'staff')));
