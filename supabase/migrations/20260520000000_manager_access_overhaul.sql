-- Create whitelist table for pre-approved managers
CREATE TABLE IF NOT EXISTS public.allowed_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed master admin email to whitelist table for visibility
INSERT INTO public.allowed_managers (email)
VALUES ('ulfathai003@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Enable RLS on allowed_managers
ALTER TABLE public.allowed_managers ENABLE ROW LEVEL SECURITY;

-- 1. Upgrade the public.has_role() function to handle the master superuser email instantly
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_master_admin BOOLEAN;
  has_matching_role BOOLEAN;
BEGIN
  -- Always return true if it's the admin role and user's email matches master superuser
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id AND LOWER(TRIM(email)) = 'ulfathai003@gmail.com'
  ) INTO is_master_admin;

  IF is_master_admin AND _role = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- Otherwise check the user_roles table
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) INTO has_matching_role;

  RETURN has_matching_role;
END;
$$;

-- 2. Upgrade handle_new_user() trigger function to check whitelist on registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_whitelisted BOOLEAN;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));

  -- Check if the email is whitelisted or is the master email
  SELECT EXISTS (
    SELECT 1 FROM public.allowed_managers
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
  ) OR LOWER(TRIM(NEW.email)) = 'ulfathai003@gmail.com' INTO is_whitelisted;

  -- Assign admin role if whitelisted/master, otherwise student
  IF is_whitelisted THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Dynamic triggers on allowed_managers to sync with user_roles in real-time
CREATE OR REPLACE FUNCTION public.sync_manager_role_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  registered_user_id UUID;
BEGIN
  -- Find the user's UUID from auth.users if they have registered already
  SELECT id INTO registered_user_id FROM auth.users WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email));

  IF registered_user_id IS NOT NULL THEN
    -- Remove student role to avoid conflict
    DELETE FROM public.user_roles WHERE user_id = registered_user_id;
    -- Promote to admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (registered_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_manager_role_on_insert ON public.allowed_managers;
CREATE TRIGGER trg_sync_manager_role_on_insert
  AFTER INSERT ON public.allowed_managers
  FOR EACH ROW EXECUTE FUNCTION public.sync_manager_role_on_insert();

CREATE OR REPLACE FUNCTION public.sync_manager_role_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  registered_user_id UUID;
BEGIN
  -- Find the user's UUID from auth.users
  SELECT id INTO registered_user_id FROM auth.users WHERE LOWER(TRIM(email)) = LOWER(TRIM(OLD.email));

  -- Do not downgrade the master account under any circumstance
  IF registered_user_id IS NOT NULL AND LOWER(TRIM(OLD.email)) != 'ulfathai003@gmail.com' THEN
    -- Revoke admin role
    DELETE FROM public.user_roles WHERE user_id = registered_user_id AND role = 'admin';
    -- Re-assign standard student role as fallback
    INSERT INTO public.user_roles (user_id, role)
    VALUES (registered_user_id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_manager_role_on_delete ON public.allowed_managers;
CREATE TRIGGER trg_sync_manager_role_on_delete
  AFTER DELETE ON public.allowed_managers
  FOR EACH ROW EXECUTE FUNCTION public.sync_manager_role_on_delete();

-- 4. Set RLS policies for allowed_managers so only admins can manage it
DROP POLICY IF EXISTS "Admins can manage allowed managers" ON public.allowed_managers;
CREATE POLICY "Admins can manage allowed managers" ON public.allowed_managers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
