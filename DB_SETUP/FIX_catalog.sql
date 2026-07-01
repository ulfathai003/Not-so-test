-- Course/Session catalog. (Already applied to production.)
-- 1) Expand program_type with the real courses universities offer.
-- 2) academic_sessions: admin-managed sessions per university (e.g. "December 2026").

alter type public.program_type add value if not exists 'BCA';
alter type public.program_type add value if not exists 'MCA';
alter type public.program_type add value if not exists 'BCom';
alter type public.program_type add value if not exists 'MCom';
alter type public.program_type add value if not exists 'BA';
alter type public.program_type add value if not exists 'MA';
alter type public.program_type add value if not exists 'PGDM';
alter type public.program_type add value if not exists 'PhD';

create table if not exists public.academic_sessions (
  id uuid primary key default gen_random_uuid(),
  university text not null,
  label text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (university, label)
);
alter table public.academic_sessions enable row level security;

drop policy if exists "Public reads sessions" on public.academic_sessions;
create policy "Public reads sessions" on public.academic_sessions for select using (true);

drop policy if exists "Admins manage sessions" on public.academic_sessions;
create policy "Admins manage sessions" on public.academic_sessions
  for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.academic_sessions (university, label) values
  ('Mangalayatan University','December 2026'),
  ('Mangalayatan University','June 2026'),
  ('Subharti University','December 2026'),
  ('Subharti University','July 2026')
on conflict (university, label) do nothing;
