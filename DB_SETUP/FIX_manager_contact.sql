-- Adds Name + Mobile to the manager whitelist so admins can create a Center /
-- Employee with: Center Name, Email, and Mobile number. The mobile number is
-- used as the person's first-login password (handled on the login screen).
--
-- Run once in Supabase SQL Editor (project qwgrkodsxhcvzmlduatb). Idempotent.

alter table public.allowed_managers
  add column if not exists name  text,
  add column if not exists phone text;
