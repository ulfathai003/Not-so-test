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
