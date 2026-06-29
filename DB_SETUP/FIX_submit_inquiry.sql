-- FIX: public lead intake (submit_inquiry) was failing with
--   42804 "column program is of type program_type but expression is of type text"
-- because norm_program (text) was inserted into students.program (enum) without a
-- cast, and it could also produce values outside the enum (MCA/BCom/BA/...).
--
-- program_type enum has exactly: '10th','12th Arts','12th Commerce','12th Science','BBA','MBA'.
-- This version maps any free-form course text to one of those and casts explicitly.
--
-- Run once in Supabase SQL Editor (project qwgrkodsxhcvzmlduatb). Idempotent.

create or replace function public.submit_inquiry(
  p_full_name      text,
  p_email          text,
  p_phone          text default null,
  p_university     text default null,
  p_program        text default null,
  p_specialization text default null,
  p_notes          text default null,
  p_location       text default 'Website Inbound'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  new_id uuid;
  p text;
  mapped public.program_type;
begin
  if p_full_name is null or btrim(p_full_name) = '' then
    raise exception 'Full name is required';
  end if;
  if p_email is null or btrim(p_email) = '' then
    raise exception 'Email is required';
  end if;

  p := lower(coalesce(p_program, ''));
  mapped := case
    when p ~ '12.*sci'                 then '12th Science'::public.program_type
    when p ~ '12.*comm'                then '12th Commerce'::public.program_type
    when p ~ '12.*art'                 then '12th Arts'::public.program_type
    when p ~ '12'                      then '12th Commerce'::public.program_type
    when p ~ '10'                      then '10th'::public.program_type
    when p ~ 'bba|bca|b\.?com|^ba\M|diploma|bachelor|under' then 'BBA'::public.program_type
    else 'MBA'::public.program_type   -- MBA/MCA/MA/PG and anything unknown
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
    mapped,
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

grant execute on function public.submit_inquiry(
  text, text, text, text, text, text, text, text
) to anon, authenticated;
