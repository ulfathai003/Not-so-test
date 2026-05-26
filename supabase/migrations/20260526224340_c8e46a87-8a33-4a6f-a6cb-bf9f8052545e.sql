
CREATE TABLE IF NOT EXISTS public.access_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role app_role NOT NULL,
  invited_by UUID,
  note TEXT,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.access_invites
  DROP CONSTRAINT IF EXISTS access_invites_role_check;
ALTER TABLE public.access_invites
  ADD CONSTRAINT access_invites_role_check CHECK (role IN ('admin','staff'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_invites TO authenticated;
GRANT ALL ON public.access_invites TO service_role;

ALTER TABLE public.access_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage invites" ON public.access_invites;
CREATE POLICY "Admins manage invites"
ON public.access_invites
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.activate_invite_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv_role app_role;
  norm_email TEXT;
BEGIN
  norm_email := lower(trim(NEW.email));
  SELECT role INTO inv_role FROM public.access_invites
    WHERE lower(email) = norm_email AND activated_at IS NULL LIMIT 1;
  IF inv_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, inv_role)
      ON CONFLICT DO NOTHING;
    UPDATE public.access_invites SET activated_at = now()
      WHERE lower(email) = norm_email;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.activate_invite_for_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_activate_invite ON auth.users;
CREATE TRIGGER on_auth_user_activate_invite
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.activate_invite_for_user();
