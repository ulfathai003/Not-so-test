-- =========================================================================
-- Audit & history layer (spec: "Never overwrite history. Always append.",
-- "Every update must be logged.", "UTR must be unique.")
--
-- Adds: student_notes, student_timeline, activity_logs, a UTR uniqueness
-- guard, the 'invoices' storage bucket, and defensive triggers that append
-- timeline + activity entries automatically on key events.
--
-- Idempotent: safe to run multiple times.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Notes — unlimited notes per student; never deleted, edits tracked.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  note TEXT NOT NULL,
  edited_by UUID REFERENCES auth.users(id),
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CRM roles read notes" ON public.student_notes;
CREATE POLICY "CRM roles read notes" ON public.student_notes
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'center') OR public.has_role(auth.uid(),'staff'));

DROP POLICY IF EXISTS "CRM roles add notes" ON public.student_notes;
CREATE POLICY "CRM roles add notes" ON public.student_notes
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'center') OR public.has_role(auth.uid(),'staff'));

-- Authors may edit their own note (history preserved via edited_by/edited_at);
-- no DELETE policy is granted, so notes can never be removed.
DROP POLICY IF EXISTS "Authors edit own notes" ON public.student_notes;
CREATE POLICY "Authors edit own notes" ON public.student_notes
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_student_notes_student ON public.student_notes(student_id);

-- -------------------------------------------------------------------------
-- 2. Timeline — permanent, append-only event log per student.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_timeline ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CRM roles read timeline" ON public.student_timeline;
CREATE POLICY "CRM roles read timeline" ON public.student_timeline
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'center') OR public.has_role(auth.uid(),'staff'));

DROP POLICY IF EXISTS "CRM roles append timeline" ON public.student_timeline;
CREATE POLICY "CRM roles append timeline" ON public.student_timeline
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'center') OR public.has_role(auth.uid(),'staff'));

CREATE INDEX IF NOT EXISTS idx_student_timeline_student ON public.student_timeline(student_id);

-- -------------------------------------------------------------------------
-- 3. Activity logs — every important action, with before/after values.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  entity TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read activity logs" ON public.activity_logs;
CREATE POLICY "Admins read activity logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "CRM roles write activity logs" ON public.activity_logs;
CREATE POLICY "CRM roles write activity logs" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'center') OR public.has_role(auth.uid(),'staff'));

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity, entity_id);

-- -------------------------------------------------------------------------
-- 4. UTR uniqueness — duplicate UTR is not allowed (ignores NULLs).
-- -------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_batches_utr
  ON public.payment_batches (utr_number)
  WHERE utr_number IS NOT NULL AND utr_number <> '';

-- -------------------------------------------------------------------------
-- 5. invoices storage bucket (dashboard invoice uploads).
-- -------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Admins manage invoice files" ON storage.objects;
CREATE POLICY "Admins manage invoice files" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'invoices' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'invoices' AND public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Public reads invoice files" ON storage.objects;
CREATE POLICY "Public reads invoice files" ON storage.objects
  FOR SELECT USING (bucket_id = 'invoices');

-- -------------------------------------------------------------------------
-- 6. Defensive auto-logging triggers.
--    Wrapped in EXCEPTION handlers so an audit-write failure can NEVER
--    block the underlying student/document/payment operation.
-- -------------------------------------------------------------------------

-- Student lifecycle -> timeline + activity_logs
CREATE OR REPLACE FUNCTION public.tg_log_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO public.student_timeline (student_id, actor_id, action, notes)
      VALUES (NEW.id, auth.uid(), 'Student created', NEW.full_name);
      INSERT INTO public.activity_logs (actor_id, entity, entity_id, action, new_value)
      VALUES (auth.uid(), 'student', NEW.id, 'Created student', to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO public.student_timeline (student_id, actor_id, action, notes)
        VALUES (NEW.id, auth.uid(), 'Status changed', COALESCE(OLD.status,'-') || ' -> ' || COALESCE(NEW.status,'-'));
        INSERT INTO public.activity_logs (actor_id, entity, entity_id, action, previous_value, new_value)
        VALUES (auth.uid(), 'student', NEW.id, 'Changed status', to_jsonb(OLD.status), to_jsonb(NEW.status));
      END IF;
      IF NEW.enrollment_number IS DISTINCT FROM OLD.enrollment_number AND NEW.enrollment_number IS NOT NULL THEN
        INSERT INTO public.student_timeline (student_id, actor_id, action, notes)
        VALUES (NEW.id, auth.uid(), 'Enrollment number assigned', NEW.enrollment_number);
        INSERT INTO public.activity_logs (actor_id, entity, entity_id, action, previous_value, new_value)
        VALUES (auth.uid(), 'student', NEW.id, 'Assigned enrollment number', to_jsonb(OLD.enrollment_number), to_jsonb(NEW.enrollment_number));
      END IF;
      IF NEW.final_fee IS DISTINCT FROM OLD.final_fee OR NEW.course_fee IS DISTINCT FROM OLD.course_fee THEN
        INSERT INTO public.student_timeline (student_id, actor_id, action, notes)
        VALUES (NEW.id, auth.uid(), 'Fee structure updated', NULL);
        INSERT INTO public.activity_logs (actor_id, entity, entity_id, action, previous_value, new_value)
        VALUES (auth.uid(), 'student', NEW.id, 'Changed fee', jsonb_build_object('course_fee',OLD.course_fee,'final_fee',OLD.final_fee), jsonb_build_object('course_fee',NEW.course_fee,'final_fee',NEW.final_fee));
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Never let audit logging break the real operation.
    NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_student ON public.students;
CREATE TRIGGER trg_log_student
  AFTER INSERT OR UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.tg_log_student();

-- Document uploads -> timeline + activity
CREATE OR REPLACE FUNCTION public.tg_log_document()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.student_timeline (student_id, actor_id, action, notes)
    VALUES (NEW.student_id, auth.uid(), 'Document uploaded', NEW.doc_type);
    INSERT INTO public.activity_logs (actor_id, entity, entity_id, action, new_value)
    VALUES (auth.uid(), 'document', NEW.id, 'Uploaded ' || NEW.doc_type, to_jsonb(NEW));
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_document ON public.documents;
CREATE TRIGGER trg_log_document
  AFTER INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.tg_log_document();

-- Payment batch lifecycle -> activity (+ timeline per allocated student)
CREATE OR REPLACE FUNCTION public.tg_log_payment_batch()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alloc RECORD;
BEGIN
  BEGIN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO public.activity_logs (actor_id, entity, entity_id, action, new_value, remarks)
      VALUES (auth.uid(), 'payment_batch', NEW.id, 'Payment submitted', to_jsonb(NEW), 'UTR ' || COALESCE(NEW.utr_number,'-'));
    ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.activity_logs (actor_id, entity, entity_id, action, previous_value, new_value, remarks)
      VALUES (auth.uid(), 'payment_batch', NEW.id, 'Payment ' || NEW.status, to_jsonb(OLD.status), to_jsonb(NEW.status), NEW.rejection_reason);
      FOR alloc IN SELECT student_id FROM public.payment_allocations WHERE batch_id = NEW.id LOOP
        INSERT INTO public.student_timeline (student_id, actor_id, action, notes)
        VALUES (alloc.student_id, auth.uid(), 'Payment ' || NEW.status, 'UTR ' || COALESCE(NEW.utr_number,'-'));
      END LOOP;
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_payment_batch ON public.payment_batches;
CREATE TRIGGER trg_log_payment_batch
  AFTER INSERT OR UPDATE ON public.payment_batches
  FOR EACH ROW EXECUTE FUNCTION public.tg_log_payment_batch();

-- Keep edited_at/edited_by honest on note edits.
CREATE OR REPLACE FUNCTION public.tg_note_edit_stamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.note IS DISTINCT FROM OLD.note THEN
    NEW.edited_by := auth.uid();
    NEW.edited_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_note_edit_stamp ON public.student_notes;
CREATE TRIGGER trg_note_edit_stamp
  BEFORE UPDATE ON public.student_notes
  FOR EACH ROW EXECUTE FUNCTION public.tg_note_edit_stamp();
