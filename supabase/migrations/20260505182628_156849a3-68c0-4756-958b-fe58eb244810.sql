-- Fee payments ledger
CREATE TABLE public.fee_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode TEXT,
  receipt_number TEXT,
  transaction_ref TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage payments" ON public.fee_payments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Students view own payments" ON public.fee_payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM students s WHERE s.id = student_id AND s.email = current_user_email()));
CREATE TRIGGER fee_payments_updated BEFORE UPDATE ON public.fee_payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_fee_payments_student ON public.fee_payments(student_id);
CREATE INDEX idx_fee_payments_date ON public.fee_payments(payment_date);

-- Follow-ups / call logs
CREATE TABLE public.follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  follow_up_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_follow_up DATE,
  contact_method TEXT,
  outcome TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage followups" ON public.follow_ups FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER follow_ups_updated BEFORE UPDATE ON public.follow_ups FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_followups_student ON public.follow_ups(student_id);
CREATE INDEX idx_followups_next ON public.follow_ups(next_follow_up);

-- Expenses
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  vendor TEXT,
  payment_mode TEXT,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage expenses" ON public.expenses FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER expenses_updated BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_expenses_date ON public.expenses(expense_date);

-- Auto-update student fee_paid/pending when fee_payments change
CREATE OR REPLACE FUNCTION public.recalc_student_fees()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  sid UUID;
  paid NUMERIC;
BEGIN
  sid := COALESCE(NEW.student_id, OLD.student_id);
  SELECT COALESCE(SUM(amount), 0) INTO paid FROM public.fee_payments WHERE student_id = sid;
  UPDATE public.students
    SET fee_paid = paid,
        fee_pending = GREATEST(COALESCE(total_fee, 0) - paid, 0),
        payment_status = CASE
          WHEN COALESCE(total_fee, 0) = 0 THEN payment_status
          WHEN paid >= COALESCE(total_fee, 0) THEN 'Paid'
          WHEN paid > 0 THEN 'Partial'
          ELSE 'Pending'
        END,
        last_payment_date = (SELECT MAX(payment_date) FROM public.fee_payments WHERE student_id = sid)
    WHERE id = sid;
  RETURN NEW;
END;
$$;
CREATE TRIGGER fee_payments_recalc AFTER INSERT OR UPDATE OR DELETE ON public.fee_payments
  FOR EACH ROW EXECUTE FUNCTION public.recalc_student_fees();