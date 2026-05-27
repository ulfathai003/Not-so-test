
-- ENQUIRIES
CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  course_interested TEXT,
  course_description TEXT,
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to UUID,
  assigned_at TIMESTAMPTZ,
  converted_student_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit enquiries" ON public.enquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins manage all enquiries" ON public.enquiries
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff view assigned enquiries" ON public.enquiries
  FOR SELECT TO authenticated USING (assigned_to = auth.uid());
CREATE POLICY "Staff update assigned enquiries" ON public.enquiries
  FOR UPDATE TO authenticated USING (assigned_to = auth.uid());
CREATE TRIGGER enquiries_updated_at BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ENQUIRY ACTIVITIES
CREATE TABLE public.enquiry_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL DEFAULT 'note',
  notes TEXT,
  next_action_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiry_activities TO authenticated;
GRANT ALL ON public.enquiry_activities TO service_role;
ALTER TABLE public.enquiry_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage all activities" ON public.enquiry_activities
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff manage activities on assigned" ON public.enquiry_activities
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.enquiries WHERE id = enquiry_id AND assigned_to = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.enquiries WHERE id = enquiry_id AND assigned_to = auth.uid()));

-- STUDENTS - workflow fields
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS submitted_by UUID,
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS temp_enrollment_id TEXT,
  ADD COLUMN IF NOT EXISTS doc_aadhaar_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_marksheet_10_url TEXT,
  ADD COLUMN IF NOT EXISTS doc_photo_url TEXT;

CREATE OR REPLACE FUNCTION public.generate_temp_enrollment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.temp_enrollment_id IS NULL THEN
    NEW.temp_enrollment_id := 'TMP-' || to_char(now(), 'YYYYMM') || '-' || lpad((floor(random() * 100000))::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS set_temp_enrollment ON public.students;
CREATE TRIGGER set_temp_enrollment BEFORE INSERT ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.generate_temp_enrollment();

DROP POLICY IF EXISTS "Center inserts students" ON public.students;
CREATE POLICY "Center inserts students" ON public.students
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'center') AND submitted_by = auth.uid());
DROP POLICY IF EXISTS "Center view own submissions" ON public.students;
CREATE POLICY "Center view own submissions" ON public.students
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'center') AND submitted_by = auth.uid());
DROP POLICY IF EXISTS "Staff view assigned students" ON public.students;
CREATE POLICY "Staff view assigned students" ON public.students
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.enquiries e WHERE e.converted_student_id = students.id AND e.assigned_to = auth.uid()));

-- FEE PAYMENTS - screenshot + duplicate prevention
ALTER TABLE public.fee_payments
  ADD COLUMN IF NOT EXISTS screenshot_url TEXT,
  ADD COLUMN IF NOT EXISTS upi_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS fee_payments_txn_unique
  ON public.fee_payments(transaction_ref) WHERE transaction_ref IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS fee_payments_upi_unique
  ON public.fee_payments(upi_id) WHERE upi_id IS NOT NULL;
DROP POLICY IF EXISTS "Center view payments of own students" ON public.fee_payments;
CREATE POLICY "Center view payments of own students" ON public.fee_payments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = fee_payments.student_id AND s.submitted_by = auth.uid()));

-- STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES
  ('student-docs', 'student-docs', false),
  ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Auth upload student docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('student-docs', 'payment-proofs'));
CREATE POLICY "Auth read student docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id IN ('student-docs', 'payment-proofs'));
CREATE POLICY "Auth update student docs" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('student-docs', 'payment-proofs'));
