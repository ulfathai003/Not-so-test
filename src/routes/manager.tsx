import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GraduationCap, LogOut, Plus, ShieldCheck, Wallet, Receipt, PhoneCall, TrendingUp, Calendar, Trash2, Download, Upload, IndianRupee, FileSpreadsheet, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";

export const Route = createFileRoute("/manager")({
  head: () => ({ meta: [{ title: "Manager Console | EduConnect" }] }),
  component: ManagerPage,
});

type Student = Tables<"students">;
type Payment = Tables<"fee_payments">;
type FollowUp = Tables<"follow_ups">;
type Expense = Tables<"expenses">;

const PAYMENT_MODES = ["UPI", "Net Banking", "Card", "Cash", "Cheque", "EMI"];
const EXPENSE_CATEGORIES = ["Marketing", "Salaries", "Rent", "Utilities", "Software", "Travel", "Office Supplies", "Commission", "Other"];
const CONTACT_METHODS = ["Phone", "Email", "WhatsApp", "In-person", "SMS"];
const FOLLOWUP_STATUSES = ["pending", "completed", "missed"];

const inr = (n: number | null | undefined) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n ?? 0));

function ManagerPage() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
    if (!loading && user && role && role !== "admin") navigate({ to: "/dashboard" });
  }, [loading, user, role, navigate]);

  if (loading || !user || role !== "admin") {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading manager console…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container mx-auto h-16 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-gradient-hero shadow-glow">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </span>
            EduConnect
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard"><Button size="sm" variant="ghost"><ArrowLeft className="w-4 h-4 mr-1" /> Students</Button></Link>
            <Badge variant="outline" className="border-primary/30 text-primary"><ShieldCheck className="w-3 h-3 mr-1" /> Manager</Badge>
            <Button size="sm" variant="ghost" onClick={signOut}><LogOut className="w-4 h-4 mr-1" /> Sign out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Manager console</h1>
          <p className="text-muted-foreground mt-1">Bookkeeping, collections, follow-ups and analytics — all in one place.</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto">
            <TabsTrigger value="overview"><TrendingUp className="w-4 h-4 mr-1.5" /> Overview</TabsTrigger>
            <TabsTrigger value="payments"><Receipt className="w-4 h-4 mr-1.5" /> Payments</TabsTrigger>
            <TabsTrigger value="followups"><PhoneCall className="w-4 h-4 mr-1.5" /> Follow-ups</TabsTrigger>
            <TabsTrigger value="expenses"><Wallet className="w-4 h-4 mr-1.5" /> Expenses</TabsTrigger>
            <TabsTrigger value="exports"><FileSpreadsheet className="w-4 h-4 mr-1.5" /> Import / Export</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-6"><OverviewTab /></TabsContent>
          <TabsContent value="payments" className="pt-6"><PaymentsTab /></TabsContent>
          <TabsContent value="followups" className="pt-6"><FollowUpsTab /></TabsContent>
          <TabsContent value="expenses" className="pt-6"><ExpensesTab /></TabsContent>
          <TabsContent value="exports" className="pt-6"><ExportsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ----------------------- OVERVIEW ----------------------- */

function OverviewTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);

  useEffect(() => {
    (async () => {
      const [s, p, e, f] = await Promise.all([
        supabase.from("students").select("*"),
        supabase.from("fee_payments").select("*"),
        supabase.from("expenses").select("*"),
        supabase.from("follow_ups").select("*"),
      ]);
      setStudents(s.data ?? []);
      setPayments(p.data ?? []);
      setExpenses(e.data ?? []);
      setFollowups(f.data ?? []);
    })();
  }, []);

  const totalBilled = students.reduce((sum, s) => sum + Number(s.total_fee ?? 0), 0);
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = Math.max(totalBilled - totalCollected, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netRevenue = totalCollected - totalExpenses;

  // Monthly collections (last 6 months)
  const monthly = useMemo(() => {
    const m: Record<string, { in: number; out: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = d.toLocaleString("default", { month: "short", year: "2-digit" });
      m[k] = { in: 0, out: 0 };
    }
    payments.forEach((p) => {
      const d = new Date(p.payment_date);
      const k = d.toLocaleString("default", { month: "short", year: "2-digit" });
      if (m[k]) m[k].in += Number(p.amount);
    });
    expenses.forEach((e) => {
      const d = new Date(e.expense_date);
      const k = d.toLocaleString("default", { month: "short", year: "2-digit" });
      if (m[k]) m[k].out += Number(e.amount);
    });
    return m;
  }, [payments, expenses]);

  const maxBar = Math.max(1, ...Object.values(monthly).flatMap((v) => [v.in, v.out]));

  // By program
  const byProgram = useMemo(() => {
    const m: Record<string, number> = {};
    students.forEach((s) => { m[s.program] = (m[s.program] ?? 0) + 1; });
    return m;
  }, [students]);

  // Today's follow-ups
  const today = new Date().toISOString().slice(0, 10);
  const dueToday = followups.filter((f) => f.next_follow_up && f.next_follow_up <= today && f.status === "pending");
  const overdue = students.filter((s) => Number(s.fee_pending ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Total billed" value={inr(totalBilled)} icon={IndianRupee} tone="primary" />
        <KPI label="Collected" value={inr(totalCollected)} icon={Receipt} tone="success" />
        <KPI label="Pending" value={inr(totalPending)} icon={Calendar} tone="warning" />
        <KPI label="Net revenue" value={inr(netRevenue)} icon={TrendingUp} tone={netRevenue >= 0 ? "success" : "danger"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-card p-6">
          <h3 className="font-semibold mb-4">Cashflow — last 6 months</h3>
          <div className="space-y-3">
            {Object.entries(monthly).map(([k, v]) => (
              <div key={k} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{k}</span>
                  <span>In {inr(v.in)} · Out {inr(v.out)}</span>
                </div>
                <div className="flex gap-1 h-6">
                  <div className="bg-emerald-500/80 rounded" style={{ width: `${(v.in / maxBar) * 100}%` }} />
                </div>
                <div className="flex gap-1 h-2">
                  <div className="bg-destructive/70 rounded" style={{ width: `${(v.out / maxBar) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl shadow-card p-6">
            <h3 className="font-semibold mb-3">Students by program</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(byProgram).map(([p, n]) => (
                <div key={p} className="flex justify-between"><span>{p}</span><Badge variant="outline">{n}</Badge></div>
              ))}
              {Object.keys(byProgram).length === 0 && <div className="text-muted-foreground">No students yet.</div>}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-card p-6">
            <h3 className="font-semibold mb-3">Action items</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Follow-ups due</span><Badge>{dueToday.length}</Badge></div>
              <div className="flex justify-between"><span>Students with dues</span><Badge variant="outline">{overdue}</Badge></div>
              <div className="flex justify-between"><span>Total expenses</span><span className="text-muted-foreground">{inr(totalExpenses)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone: "primary" | "success" | "warning" | "danger" }) {
  const t: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    danger: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="bg-gradient-card border border-border rounded-2xl p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-display font-bold">{value}</div>
        </div>
        <span className={`grid place-items-center w-10 h-10 rounded-xl ${t[tone]}`}><Icon className="w-5 h-5" /></span>
      </div>
    </div>
  );
}

/* ----------------------- PAYMENTS ----------------------- */

function PaymentsTab() {
  const [payments, setPayments] = useState<(Payment & { student?: Student })[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const { data } = await supabase.from("fee_payments").select("*, student:students(*)").order("payment_date", { ascending: false });
    setPayments((data as any) ?? []);
    const { data: s } = await supabase.from("students").select("*").order("full_name");
    setStudents(s ?? []);
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Delete this payment? Student balance will be recalculated.")) return;
    const { error } = await supabase.from("fee_payments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Payment removed");
    load();
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Fee payments ledger</h2>
          <p className="text-xs text-muted-foreground mt-1">Each entry auto-updates the student's paid / pending balance.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-hero shadow-glow"><Plus className="w-4 h-4 mr-1" /> Record payment</Button></DialogTrigger>
          <PaymentDialog students={students} onSaved={() => { setOpen(false); load(); }} />
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <Th>Date</Th><Th>Student</Th><Th>Amount</Th><Th>Mode</Th><Th>Receipt #</Th><Th>Notes</Th><Th>{" "}</Th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No payments recorded yet.</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                <td className="p-4">{p.payment_date}</td>
                <td className="p-4">
                  <div className="font-medium">{p.student?.full_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{p.student?.email}</div>
                </td>
                <td className="p-4 font-medium">{inr(Number(p.amount))}</td>
                <td className="p-4 text-muted-foreground">{p.payment_mode ?? "—"}</td>
                <td className="p-4 text-muted-foreground">{p.receipt_number ?? "—"}</td>
                <td className="p-4 text-muted-foreground max-w-xs truncate">{p.notes ?? ""}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => printReceipt(p, p.student)}><Receipt className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentDialog({ students, onSaved }: { students: Student[]; onSaved: () => void }) {
  const [form, setForm] = useState<TablesInsert<"fee_payments">>({
    student_id: "", amount: 0, payment_date: new Date().toISOString().slice(0, 10),
    payment_mode: "UPI", receipt_number: "", transaction_ref: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student_id) return toast.error("Select a student");
    setSaving(true);
    const receipt = form.receipt_number || `RCP-${Date.now()}`;
    const { error } = await supabase.from("fee_payments").insert({ ...form, receipt_number: receipt, amount: Number(form.amount) });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Payment recorded");
    onSaved();
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Record fee payment</DialogTitle>
        <DialogDescription>This auto-updates the student's paid/pending balance.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Student" required>
          <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
            <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
            <SelectContent>
              {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name} — {s.program}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Amount (INR)" required>
          <Input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required />
        </Field>
        <Field label="Date" required>
          <Input type="date" value={form.payment_date ?? ""} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} required />
        </Field>
        <Field label="Mode">
          <Select value={form.payment_mode ?? ""} onValueChange={(v) => setForm({ ...form, payment_mode: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PAYMENT_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Receipt number"><Input value={form.receipt_number ?? ""} onChange={(e) => setForm({ ...form, receipt_number: e.target.value })} placeholder="Auto if blank" /></Field>
        <Field label="Transaction ref"><Input value={form.transaction_ref ?? ""} onChange={(e) => setForm({ ...form, transaction_ref: e.target.value })} /></Field>
        <Field label="Notes" full><Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
        <DialogFooter className="sm:col-span-2">
          <Button type="submit" disabled={saving} className="bg-gradient-hero">{saving ? "Saving…" : "Record payment"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function printReceipt(p: Payment, s?: Student) {
  const html = `
<!doctype html><html><head><title>Receipt ${p.receipt_number}</title>
<style>body{font-family:system-ui;padding:40px;max-width:600px;margin:auto}h1{color:#4f46e5}table{width:100%;border-collapse:collapse;margin-top:20px}td{padding:8px;border-bottom:1px solid #eee}.r{text-align:right}.muted{color:#666;font-size:12px}</style>
</head><body>
<h1>EduConnect Distance Learning</h1>
<p class="muted">Official Fee Payment Receipt</p>
<hr/>
<h2>Receipt #${p.receipt_number}</h2>
<table>
<tr><td>Date</td><td class="r">${p.payment_date}</td></tr>
<tr><td>Student</td><td class="r">${s?.full_name ?? ""}</td></tr>
<tr><td>Email</td><td class="r">${s?.email ?? ""}</td></tr>
<tr><td>Program</td><td class="r">${s?.program ?? ""} — ${s?.specialization ?? ""}</td></tr>
<tr><td>University</td><td class="r">${s?.university ?? ""}</td></tr>
<tr><td>Mode</td><td class="r">${p.payment_mode ?? ""}</td></tr>
<tr><td>Transaction ref</td><td class="r">${p.transaction_ref ?? "—"}</td></tr>
<tr><td><b>Amount paid</b></td><td class="r"><b>₹ ${Number(p.amount).toLocaleString("en-IN")}</b></td></tr>
</table>
<p class="muted" style="margin-top:40px">This is a computer-generated receipt and does not require a signature.</p>
<script>window.print()</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

/* ----------------------- FOLLOW-UPS ----------------------- */

function FollowUpsTab() {
  const [items, setItems] = useState<(FollowUp & { student?: Student })[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const { data } = await supabase.from("follow_ups").select("*, student:students(*)").order("next_follow_up", { ascending: true, nullsFirst: false });
    setItems((data as any) ?? []);
    const { data: s } = await supabase.from("students").select("*").order("full_name");
    setStudents(s ?? []);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("follow_ups").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }
  async function del(id: string) {
    if (!confirm("Delete this follow-up?")) return;
    await supabase.from("follow_ups").delete().eq("id", id);
    load();
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Follow-ups & call log</h2>
          <p className="text-xs text-muted-foreground mt-1">Schedule next contacts and track every interaction.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-hero shadow-glow"><Plus className="w-4 h-4 mr-1" /> New follow-up</Button></DialogTrigger>
          <FollowUpDialog students={students} onSaved={() => { setOpen(false); load(); }} />
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr><Th>Status</Th><Th>Student</Th><Th>Last contact</Th><Th>Next</Th><Th>Method</Th><Th>Outcome / Notes</Th><Th>{" "}</Th></tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No follow-ups yet.</td></tr>
            ) : items.map((f) => {
              const due = f.next_follow_up && f.next_follow_up <= today && f.status === "pending";
              return (
                <tr key={f.id} className={`border-t border-border hover:bg-muted/30 ${due ? "bg-amber-500/5" : ""}`}>
                  <td className="p-4">
                    <Select value={f.status} onValueChange={(v) => setStatus(f.id, v)}>
                      <SelectTrigger className="h-8 w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{FOLLOWUP_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{f.student?.full_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{f.student?.phone ?? f.student?.email}</div>
                  </td>
                  <td className="p-4">{f.follow_up_date}</td>
                  <td className="p-4">{f.next_follow_up ?? "—"}{due && <Badge className="ml-2 bg-amber-500">Due</Badge>}</td>
                  <td className="p-4 text-muted-foreground">{f.contact_method ?? "—"}</td>
                  <td className="p-4 max-w-md">
                    {f.outcome && <div className="text-xs font-medium">{f.outcome}</div>}
                    <div className="text-xs text-muted-foreground truncate">{f.notes}</div>
                  </td>
                  <td className="p-4 text-right"><Button size="icon" variant="ghost" onClick={() => del(f.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FollowUpDialog({ students, onSaved }: { students: Student[]; onSaved: () => void }) {
  const [form, setForm] = useState<TablesInsert<"follow_ups">>({
    student_id: "", follow_up_date: new Date().toISOString().slice(0, 10),
    next_follow_up: null, contact_method: "Phone", outcome: "", notes: "", status: "pending",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student_id) return toast.error("Select a student");
    const { error } = await supabase.from("follow_ups").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Follow-up logged");
    onSaved();
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader><DialogTitle>Log a follow-up</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Student" required>
          <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
            <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
            <SelectContent>{students.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Method">
          <Select value={form.contact_method ?? ""} onValueChange={(v) => setForm({ ...form, contact_method: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CONTACT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Contact date" required><Input type="date" value={form.follow_up_date ?? ""} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} required /></Field>
        <Field label="Next follow-up"><Input type="date" value={form.next_follow_up ?? ""} onChange={(e) => setForm({ ...form, next_follow_up: e.target.value || null })} /></Field>
        <Field label="Outcome" full><Input value={form.outcome ?? ""} onChange={(e) => setForm({ ...form, outcome: e.target.value })} placeholder="Interested, Not reachable, Will pay next week..." /></Field>
        <Field label="Notes" full><Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
        <DialogFooter className="sm:col-span-2"><Button type="submit" className="bg-gradient-hero">Save follow-up</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}

/* ----------------------- EXPENSES ----------------------- */

function ExpensesTab() {
  const [items, setItems] = useState<Expense[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const { data } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Delete this expense?")) return;
    await supabase.from("expenses").delete().eq("id", id);
    load();
  }

  const total = items.reduce((s, i) => s + Number(i.amount), 0);
  const byCat: Record<string, number> = {};
  items.forEach((i) => { byCat[i.category] = (byCat[i.category] ?? 0) + Number(i.amount); });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Total expenses" value={inr(total)} icon={Wallet} tone="warning" />
        {Object.entries(byCat).slice(0, 3).map(([c, v]) => (
          <KPI key={c} label={c} value={inr(v)} icon={Receipt} tone="primary" />
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Expense book</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="bg-gradient-hero shadow-glow"><Plus className="w-4 h-4 mr-1" /> Add expense</Button></DialogTrigger>
            <ExpenseDialog onSaved={() => { setOpen(false); load(); }} />
          </Dialog>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr><Th>Date</Th><Th>Category</Th><Th>Vendor</Th><Th>Amount</Th><Th>Mode</Th><Th>Description</Th><Th>{" "}</Th></tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No expenses yet.</td></tr>
              ) : items.map((e) => (
                <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-4">{e.expense_date}</td>
                  <td className="p-4"><Badge variant="outline">{e.category}</Badge></td>
                  <td className="p-4 text-muted-foreground">{e.vendor ?? "—"}</td>
                  <td className="p-4 font-medium">{inr(Number(e.amount))}</td>
                  <td className="p-4 text-muted-foreground">{e.payment_mode ?? "—"}</td>
                  <td className="p-4 text-muted-foreground max-w-xs truncate">{e.description}</td>
                  <td className="p-4 text-right"><Button size="icon" variant="ghost" onClick={() => del(e.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ExpenseDialog({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState<TablesInsert<"expenses">>({
    expense_date: new Date().toISOString().slice(0, 10),
    category: "Marketing", amount: 0, vendor: "", payment_mode: "UPI", description: "",
  });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("expenses").insert({ ...form, amount: Number(form.amount) });
    if (error) return toast.error(error.message);
    toast.success("Expense recorded");
    onSaved();
  }
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader><DialogTitle>Add expense</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Date" required><Input type="date" value={form.expense_date ?? ""} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} required /></Field>
        <Field label="Category" required>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Amount (INR)" required><Input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required /></Field>
        <Field label="Vendor / Paid to"><Input value={form.vendor ?? ""} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></Field>
        <Field label="Mode">
          <Select value={form.payment_mode ?? ""} onValueChange={(v) => setForm({ ...form, payment_mode: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PAYMENT_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Description" full><Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <DialogFooter className="sm:col-span-2"><Button type="submit" className="bg-gradient-hero">Save expense</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}

/* ----------------------- IMPORT / EXPORT ----------------------- */

function ExportsTab() {
  const [busy, setBusy] = useState(false);

  async function exportCsv(table: "students" | "fee_payments" | "expenses" | "follow_ups") {
    setBusy(true);
    const { data, error } = await supabase.from(table).select("*");
    setBusy(false);
    if (error) return toast.error(error.message);
    if (!data || data.length === 0) return toast.error("Nothing to export");
    const keys = Object.keys(data[0] as object);
    const escape = (v: any) => {
      if (v === null || v === undefined) return "";
      const s = typeof v === "object" ? JSON.stringify(v) : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [keys.join(","), ...data.map((row: any) => keys.map((k) => escape(row[k])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${table}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} rows`);
  }

  async function importStudents(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const [head, ...rows] = text.split(/\r?\n/).filter(Boolean);
    const keys = head.split(",").map((s) => s.trim());
    const records = rows.map((line) => {
      // simple CSV split (no quoted commas)
      const vals = line.split(",");
      const obj: any = {};
      keys.forEach((k, i) => { obj[k] = vals[i] === "" ? null : vals[i]; });
      return obj;
    });
    setBusy(true);
    const { error } = await supabase.from("students").insert(records);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Imported ${records.length} students`);
    e.target.value = "";
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-3">
        <h3 className="font-semibold flex items-center gap-2"><Download className="w-4 h-4" /> Export to CSV</h3>
        <p className="text-sm text-muted-foreground">Download data for accounting, mail-merge or backup.</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" disabled={busy} onClick={() => exportCsv("students")}>Students</Button>
          <Button variant="outline" disabled={busy} onClick={() => exportCsv("fee_payments")}>Payments</Button>
          <Button variant="outline" disabled={busy} onClick={() => exportCsv("expenses")}>Expenses</Button>
          <Button variant="outline" disabled={busy} onClick={() => exportCsv("follow_ups")}>Follow-ups</Button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-3">
        <h3 className="font-semibold flex items-center gap-2"><Upload className="w-4 h-4" /> Bulk import students</h3>
        <p className="text-sm text-muted-foreground">Upload a CSV with column headers matching the students table (full_name, email, batch_year, program, specialization, university, location, status…).</p>
        <Input type="file" accept=".csv" onChange={importStudents} disabled={busy} />
      </div>
    </div>
  );
}

/* ----------------------- HELPERS ----------------------- */

function Field({ label, children, required, full }: { label: string; children: React.ReactNode; required?: boolean; full?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label className="text-xs">{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="p-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">{children}</th>;
}
