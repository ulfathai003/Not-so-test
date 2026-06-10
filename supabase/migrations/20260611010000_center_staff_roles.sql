-- Enable real "center" and "staff" roles so the manager Settings invite flow
-- actually grants those roles (previously the enum only had admin/student).

-- 1. Extend the role enum. (Safe in PG12+: values are only referenced at
--    runtime by the trigger functions below, never within this transaction.)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'center';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';

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
