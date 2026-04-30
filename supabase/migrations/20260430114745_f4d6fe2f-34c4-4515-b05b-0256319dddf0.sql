-- Fix students RLS policy that references auth.users (causes 403 for non-admins)
DROP POLICY IF EXISTS "Students can view own record" ON public.students;

CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = auth.uid()
$$;

CREATE POLICY "Students can view own record"
ON public.students
FOR SELECT
TO authenticated
USING (email = public.current_user_email());