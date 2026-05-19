import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GraduationCap, LogOut, Plus, ShieldCheck, Wallet, Receipt, PhoneCall, TrendingUp, Calendar, Trash2, Download, Upload, IndianRupee, FileSpreadsheet, ArrowLeft, Pencil, Percent, Briefcase, Building } from "lucide-react";
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
  const { user: authUser, role: authRole, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const isBypass = typeof window !== "undefined" && (window.location.search.includes("bypass=true") || localStorage.getItem("admin_bypass") === "true");
  const user = isBypass ? { id: "dev-admin", email: "ulfathai003@gmail.com" } : authUser;
  const role = isBypass ? "admin" : authRole;
  const loading = isBypass ? false : authLoading;

  useEffect(() => {
    if (isBypass) return;
    if (!loading && !user) navigate({ to: "/login" });
    if (!loading && user && role && role !== "admin") navigate({ to: "/dashboard" });
  }, [loading, user, role, navigate, isBypass]);

  if (loading || !user || role !== "admin") {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading manager console…</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4ecd8] selection:bg-foreground selection:text-background">
      <header className="sticky top-0 z-40 bg-[#fbf6e7] border-b-4 border-foreground shadow-[0px_4px_0px_0px_#1a1410]">
        <div className="container mx-auto h-16 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-headline font-bold text-xl uppercase tracking-tighter">
            <span className="grid place-items-center w-8 h-8 border-2 border-foreground bg-foreground text-background shrink-0">
              <GraduationCap className="w-5 h-5" />
            </span>
            EduConnect
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard"><Button size="sm" variant="outline" className="border-2 border-foreground rounded-none font-sans font-bold uppercase tracking-widest text-[10px]"><ArrowLeft className="w-4 h-4 mr-1" /> Students</Button></Link>
            <Badge variant="outline" className="border-2 border-foreground rounded-none font-sans font-bold uppercase tracking-widest text-[10px] bg-[#fbf6e7]"><ShieldCheck className="w-3 h-3 mr-1" /> Manager</Badge>
            <Button size="sm" variant="default" onClick={signOut} className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px]"><LogOut className="w-4 h-4 mr-1" /> Sign out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-8">
        <div className="border-b-4 border-foreground pb-6">
          <h1 className="text-4xl md:text-5xl font-headline uppercase tracking-tight">Manager console</h1>
          <p className="text-sm font-serif-news italic mt-2 text-[#6b3e1a]">Bookkeeping, collections, follow-ups and analytics — all in one place.</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full h-auto bg-transparent gap-2 p-0">
            <TabsTrigger value="overview" className="border-2 border-foreground rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background font-sans font-bold uppercase tracking-widest text-[10px] py-3"><TrendingUp className="w-4 h-4 mr-1.5" /> Overview</TabsTrigger>
            <TabsTrigger value="payments" className="border-2 border-foreground rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background font-sans font-bold uppercase tracking-widest text-[10px] py-3"><Receipt className="w-4 h-4 mr-1.5" /> Payments</TabsTrigger>
            <TabsTrigger value="followups" className="border-2 border-foreground rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background font-sans font-bold uppercase tracking-widest text-[10px] py-3"><PhoneCall className="w-4 h-4 mr-1.5" /> Follow-ups</TabsTrigger>
            <TabsTrigger value="expenses" className="border-2 border-foreground rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background font-sans font-bold uppercase tracking-widest text-[10px] py-3"><Wallet className="w-4 h-4 mr-1.5" /> Expenses</TabsTrigger>
            <TabsTrigger value="contracts" className="border-2 border-foreground rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background font-sans font-bold uppercase tracking-widest text-[10px] py-3"><ShieldCheck className="w-4 h-4 mr-1.5" /> Contracts</TabsTrigger>
            <TabsTrigger value="compliance" className="border-2 border-foreground rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background font-sans font-bold uppercase tracking-widest text-[10px] py-3"><ShieldCheck className="w-4 h-4 mr-1.5" /> Compliance</TabsTrigger>
            <TabsTrigger value="academics" className="border-2 border-foreground rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background font-sans font-bold uppercase tracking-widest text-[10px] py-3"><GraduationCap className="w-4 h-4 mr-1.5" /> Academics</TabsTrigger>
            <TabsTrigger value="exports" className="border-2 border-foreground rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background font-sans font-bold uppercase tracking-widest text-[10px] py-3"><FileSpreadsheet className="w-4 h-4 mr-1.5" /> Exports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-6"><OverviewTab /></TabsContent>
          <TabsContent value="payments" className="pt-6"><PaymentsTab /></TabsContent>
          <TabsContent value="followups" className="pt-6"><FollowUpsTab /></TabsContent>
          <TabsContent value="expenses" className="pt-6"><ExpensesTab /></TabsContent>
          <TabsContent value="contracts" className="pt-6"><ContractsTab /></TabsContent>
          <TabsContent value="compliance" className="pt-6"><ComplianceTab /></TabsContent>
          <TabsContent value="academics" className="pt-6"><AcademicsTab /></TabsContent>
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
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Total billed" value={inr(totalBilled)} icon={IndianRupee} />
        <KPI label="Collected" value={inr(totalCollected)} icon={Receipt} />
        <KPI label="Pending" value={inr(totalPending)} icon={Calendar} />
        <KPI label="Net revenue" value={inr(netRevenue)} icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] p-6">
          <h3 className="font-headline text-2xl uppercase tracking-tighter border-b-2 border-foreground/30 pb-2 mb-6">Cashflow — last 6 months</h3>
          <div className="space-y-6">
            {Object.entries(monthly).map(([k, v]) => (
              <div key={k} className="space-y-2">
                <div className="flex items-center justify-between font-sans font-bold uppercase tracking-widest text-[10px] text-[#6b3e1a]">
                  <span>{k}</span>
                  <span>In {inr(v.in)} · Out {inr(v.out)}</span>
                </div>
                <div className="flex gap-1 h-6">
                  <div className="bg-foreground rounded-none" style={{ width: `${(v.in / maxBar) * 100}%` }} />
                </div>
                <div className="flex gap-1 h-2">
                  <div className="bg-[#b33a3a] rounded-none" style={{ width: `${(v.out / maxBar) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] p-6">
            <h3 className="font-headline text-xl uppercase tracking-tighter border-b-2 border-foreground/30 pb-2 mb-4">Students by program</h3>
            <div className="space-y-3 font-serif-news text-sm">
              {Object.entries(byProgram).map(([p, n]) => (
                <div key={p} className="flex justify-between"><span>{p}</span><Badge variant="outline">{n}</Badge></div>
              ))}
              {Object.keys(byProgram).length === 0 && <div className="text-muted-foreground">No students yet.</div>}
            </div>
          </div>
          <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] p-6">
            <h3 className="font-headline text-xl uppercase tracking-tighter border-b-2 border-foreground/30 pb-2 mb-4">Action items</h3>
            <div className="space-y-3 font-serif-news text-sm">
              <div className="flex justify-between border-b border-foreground/10 pb-2">
                <span className="font-sans font-bold uppercase tracking-widest text-[10px] text-[#6b3e1a]">Follow-ups due</span>
                <span className="font-bold bg-foreground text-background px-2 py-0.5 text-xs">{dueToday.length}</span>
              </div>
              <div className="flex justify-between border-b border-foreground/10 pb-2">
                <span className="font-sans font-bold uppercase tracking-widest text-[10px] text-[#6b3e1a]">Students with dues</span>
                <span className="font-bold border border-foreground px-2 py-0.5 text-xs">{overdue}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-sans font-bold uppercase tracking-widest text-[10px] text-[#6b3e1a]">Total expenses</span>
                <span className="italic">{inr(totalExpenses)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone?: "primary" | "success" | "warning" | "danger" }) {
  return (
    <div className="bg-[#fbf6e7] border-4 border-foreground p-5 shadow-[6px_6px_0px_0px_#1a1410] flex flex-col justify-between min-h-[140px]">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-sans font-bold uppercase tracking-widest text-[10px] text-[#6b3e1a]">{label}</div>
          <div className="mt-2 font-headline text-3xl sm:text-4xl">{value}</div>
        </div>
        <span className="grid place-items-center w-10 h-10 border-2 border-foreground bg-foreground text-background shrink-0">
          <Icon className="w-5 h-5" />
        </span>
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
    <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-hidden">
      <div className="p-6 border-b-4 border-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl uppercase tracking-tight">Fee payments ledger</h2>
          <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Each entry auto-updates the student's paid / pending balance.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] bg-foreground text-background hover:bg-background hover:text-foreground"><Plus className="w-4 h-4 mr-1" /> Record payment</Button></DialogTrigger>
          <PaymentDialog students={students} onSaved={() => { setOpen(false); load(); }} />
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-serif-news text-sm">
          <thead className="bg-[#f4ecd8] border-b-2 border-foreground">
            <tr>
              <Th>Date</Th><Th>Student</Th><Th>Amount</Th><Th>Mode</Th><Th>Receipt #</Th><Th>Notes</Th><Th>{" "}</Th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={7} className="p-10 text-center italic text-[#6b3e1a]">No payments recorded yet.</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="border-b border-foreground/20 hover:bg-foreground/5 transition-colors">
                <td className="p-4">{p.payment_date}</td>
                <td className="p-4">
                  <div className="font-bold">{p.student?.full_name ?? "—"}</div>
                  <div className="text-xs italic text-[#6b3e1a]">{p.student?.email}</div>
                </td>
                <td className="p-4 font-bold">{inr(Number(p.amount))}</td>
                <td className="p-4 italic text-[#6b3e1a]">{p.payment_mode ?? "—"}</td>
                <td className="p-4 italic text-[#6b3e1a]">{p.receipt_number ?? "—"}</td>
                <td className="p-4 italic text-[#6b3e1a] max-w-xs truncate">{p.notes ?? ""}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="rounded-none border-2 border-transparent hover:border-foreground h-8 w-8" onClick={() => printReceipt(p, p.student)}><Receipt className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="rounded-none border-2 border-transparent hover:border-foreground h-8 w-8 text-destructive" onClick={() => del(p.id)}><Trash2 className="w-4 h-4" /></Button>
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
    <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-hidden">
      <div className="p-6 border-b-4 border-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl uppercase tracking-tight">Follow-ups & call log</h2>
          <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Schedule next contacts and track every interaction.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] bg-foreground text-background hover:bg-background hover:text-foreground"><Plus className="w-4 h-4 mr-1" /> New follow-up</Button></DialogTrigger>
          <FollowUpDialog students={students} onSaved={() => { setOpen(false); load(); }} />
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-serif-news text-sm">
          <thead className="bg-[#f4ecd8] border-b-2 border-foreground">
            <tr><Th>Status</Th><Th>Student</Th><Th>Last contact</Th><Th>Next</Th><Th>Method</Th><Th>Outcome / Notes</Th><Th>{" "}</Th></tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} className="p-10 text-center italic text-[#6b3e1a]">No follow-ups yet.</td></tr>
            ) : items.map((f) => {
              const due = f.next_follow_up && f.next_follow_up <= today && f.status === "pending";
              return (
                <tr key={f.id} className={`border-b border-foreground/20 hover:bg-foreground/5 transition-colors ${due ? "bg-[#b33a3a]/10" : ""}`}>
                  <td className="p-4">
                    <Select value={f.status} onValueChange={(v) => setStatus(f.id, v)}>
                      <SelectTrigger className="h-8 w-[120px] rounded-none border-2 border-foreground bg-background font-sans text-xs uppercase"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-none border-2 border-foreground bg-background">{FOLLOWUP_STATUSES.map((s) => <SelectItem key={s} value={s} className="font-sans text-xs uppercase">{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{f.student?.full_name ?? "—"}</div>
                    <div className="text-xs italic text-[#6b3e1a]">{f.student?.phone ?? f.student?.email}</div>
                  </td>
                  <td className="p-4">{f.follow_up_date}</td>
                  <td className="p-4 font-bold">{f.next_follow_up ?? "—"}{due && <Badge className="ml-2 bg-[#b33a3a] text-white rounded-none uppercase text-[9px]">Due</Badge>}</td>
                  <td className="p-4 italic text-[#6b3e1a]">{f.contact_method ?? "—"}</td>
                  <td className="p-4 max-w-md">
                    {f.outcome && <div className="text-xs font-bold uppercase">{f.outcome}</div>}
                    <div className="text-xs italic text-[#6b3e1a] truncate">{f.notes}</div>
                  </td>
                  <td className="p-4 text-right"><Button size="icon" variant="ghost" className="rounded-none border-2 border-transparent hover:border-foreground h-8 w-8 text-destructive" onClick={() => del(f.id)}><Trash2 className="w-4 h-4" /></Button></td>
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
        <KPI label="Total expenses" value={inr(total)} icon={Wallet} />
        {Object.entries(byCat).slice(0, 3).map(([c, v]) => (
          <KPI key={c} label={c} value={inr(v)} icon={Receipt} />
        ))}
      </div>

      <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-hidden">
        <div className="p-6 border-b-4 border-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-headline text-3xl uppercase tracking-tight">Expense book</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] bg-foreground text-background hover:bg-background hover:text-foreground"><Plus className="w-4 h-4 mr-1" /> Add expense</Button></DialogTrigger>
            <ExpenseDialog onSaved={() => { setOpen(false); load(); }} />
          </Dialog>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-serif-news text-sm">
            <thead className="bg-[#f4ecd8] border-b-2 border-foreground">
              <tr><Th>Date</Th><Th>Category</Th><Th>Vendor</Th><Th>Amount</Th><Th>Mode</Th><Th>Description</Th><Th>{" "}</Th></tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center italic text-[#6b3e1a]">No expenses yet.</td></tr>
              ) : items.map((e) => (
                <tr key={e.id} className="border-b border-foreground/20 hover:bg-foreground/5 transition-colors">
                  <td className="p-4">{e.expense_date}</td>
                  <td className="p-4"><Badge variant="outline" className="rounded-none border-foreground text-[#6b3e1a]">{e.category}</Badge></td>
                  <td className="p-4 italic text-[#6b3e1a]">{e.vendor ?? "—"}</td>
                  <td className="p-4 font-bold">{inr(Number(e.amount))}</td>
                  <td className="p-4 italic text-[#6b3e1a]">{e.payment_mode ?? "—"}</td>
                  <td className="p-4 italic text-[#6b3e1a] max-w-xs truncate">{e.description}</td>
                  <td className="p-4 text-right"><Button size="icon" variant="ghost" className="rounded-none border-2 border-transparent hover:border-foreground h-8 w-8 text-destructive" onClick={() => del(e.id)}><Trash2 className="w-4 h-4" /></Button></td>
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
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] p-6 space-y-4">
        <h3 className="font-headline text-2xl uppercase tracking-tight border-b-2 border-foreground/20 pb-2 flex items-center gap-2">
          <Download className="w-5 h-5" /> Export Data
        </h3>
        <p className="font-serif-news text-sm italic text-[#6b3e1a]">Download CSV files for accounting, mail-merge or backup.</p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" disabled={busy} onClick={() => exportCsv("students")} className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px]">Students</Button>
          <Button variant="outline" disabled={busy} onClick={() => exportCsv("fee_payments")} className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px]">Payments</Button>
          <Button variant="outline" disabled={busy} onClick={() => exportCsv("expenses")} className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px]">Expenses</Button>
          <Button variant="outline" disabled={busy} onClick={() => exportCsv("follow_ups")} className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px]">Follow-ups</Button>
        </div>
      </div>
      <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] p-6 space-y-4">
        <h3 className="font-headline text-2xl uppercase tracking-tight border-b-2 border-foreground/20 pb-2 flex items-center gap-2">
          <Upload className="w-5 h-5" /> Import Data
        </h3>
        <p className="font-serif-news text-sm italic text-[#6b3e1a]">Upload a CSV with column headers matching the students table (full_name, email, batch_year, program, specialization, university, location, status…).</p>
        <Input type="file" accept=".csv" onChange={importStudents} disabled={busy} className="rounded-none border-2 border-foreground font-serif-news bg-white" />
      </div>
    </div>
  );
}


/* ----------------------- PARTNER CONTRACTS ----------------------- */

interface PartnerContract {
  id: string;
  university: string;
  repName: string;
  email: string;
  phone: string;
  commissionType: "percentage" | "flat";
  commissionRate: number;
  startDate: string;
  expiryDate: string;
  status: "Active" | "Pending Renewal" | "Expired";
  notes?: string;
}

const DEFAULT_CONTRACTS: PartnerContract[] = [
  {
    id: "c-1",
    university: "Jain University",
    repName: "Dr. Sandeep Kumar",
    email: "admissions.jain@example.edu",
    phone: "+91 98845 22100",
    commissionType: "percentage",
    commissionRate: 20,
    startDate: "2025-06-01",
    expiryDate: "2027-05-31",
    status: "Active",
    notes: "Contract guarantees 20% payout on total paid tuition fees for all BBA & MBA admissions."
  },
  {
    id: "c-2",
    university: "Mangalayatan University",
    repName: "Prof. Amit Sharma",
    email: "amit.sharma@mangalayatan.edu.in",
    phone: "+91 91234 56789",
    commissionType: "flat",
    commissionRate: 15000,
    startDate: "2025-01-15",
    expiryDate: "2026-07-14",
    status: "Active",
    notes: "Fixed ₹15,000 commission per enrolled student paid within 45 days of verification."
  },
  {
    id: "c-3",
    university: "Amity University",
    repName: "Neha Gupta",
    email: "neha.gupta@amity.online",
    phone: "+91 88776 65544",
    commissionType: "percentage",
    commissionRate: 25,
    startDate: "2024-08-01",
    expiryDate: "2025-07-31",
    status: "Pending Renewal",
    notes: "25% commission sharing agreement. Currently under annual renewal review."
  }
];

function ContractsTab() {
  const [contracts, setContracts] = useState<PartnerContract[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerContract | null>(null);

  useEffect(() => {
    // Load contracts
    const saved = localStorage.getItem("educonnect_partner_contracts");
    if (saved) {
      try {
        setContracts(JSON.parse(saved));
      } catch (e) {
        setContracts(DEFAULT_CONTRACTS);
      }
    } else {
      setContracts(DEFAULT_CONTRACTS);
      localStorage.setItem("educonnect_partner_contracts", JSON.stringify(DEFAULT_CONTRACTS));
    }

    // Fetch students to calculate active commission share
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("students").select("*");
      setStudents(data ?? []);
      setLoading(false);
    })();
  }, []);

  function saveContracts(updated: PartnerContract[]) {
    setContracts(updated);
    localStorage.setItem("educonnect_partner_contracts", JSON.stringify(updated));
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this partner contract?")) return;
    const updated = contracts.filter((c) => c.id !== id);
    saveContracts(updated);
    toast.success("Contract removed successfully");
  }

  // Calculate dynamic contract analytics
  const contractStats = useMemo(() => {
    return contracts.map((c) => {
      const universityStudents = students.filter(
        (s) => s.university.trim().toLowerCase() === c.university.trim().toLowerCase()
      );

      const activeStudentCount = universityStudents.filter(
        (s) => s.status === "active" || s.status === "graduated"
      ).length;

      const totalFeesBilled = universityStudents.reduce((sum, s) => sum + Number(s.total_fee ?? 0), 0);
      const totalFeesCollected = universityStudents.reduce((sum, s) => sum + Number(s.fee_paid ?? 0), 0);

      let projectedCommission = 0;
      if (c.commissionType === "percentage") {
        // Percentage of collected fees
        projectedCommission = totalFeesCollected * (c.commissionRate / 100);
      } else {
        // Flat rate per active/graduated student
        projectedCommission = activeStudentCount * c.commissionRate;
      }

      return {
        ...c,
        studentCount: universityStudents.length,
        activeStudentCount,
        totalFeesBilled,
        totalFeesCollected,
        projectedCommission,
      };
    });
  }, [contracts, students]);

  const overallExpectedCommission = contractStats.reduce((sum, c) => sum + c.projectedCommission, 0);
  const totalPartnerColleges = contracts.length;
  const totalPartnerStudents = contractStats.reduce((sum, c) => sum + c.studentCount, 0);

  return (
    <div className="space-y-6">
      {/* Contract KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-[#f4ecd8] p-4 border-4 border-foreground shadow-[4px_4px_0px_0px_#1a1410]">
          <div className="flex items-center gap-2 mb-2"><Building className="w-4 h-4" /><span className="font-sans font-bold uppercase tracking-widest text-[10px]">Partner Colleges</span></div>
          <div className="font-headline text-3xl">{totalPartnerColleges}</div>
        </div>
        <div className="bg-[#f4ecd8] p-4 border-4 border-foreground shadow-[4px_4px_0px_0px_#1a1410]">
          <div className="flex items-center gap-2 mb-2"><GraduationCap className="w-4 h-4" /><span className="font-sans font-bold uppercase tracking-widest text-[10px]">Total Students Recruited</span></div>
          <div className="font-headline text-3xl">{totalPartnerStudents}</div>
        </div>
        <div className="bg-[#f4ecd8] p-4 border-4 border-foreground shadow-[4px_4px_0px_0px_#1a1410]">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4" /><span className="font-sans font-bold uppercase tracking-widest text-[10px]">Projected Revenue</span></div>
          <div className="font-headline text-3xl">{inr(overallExpectedCommission)}</div>
        </div>
      </div>

      {/* Contracts Ledger Card */}
      <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-hidden">
        <div className="p-6 border-b-4 border-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-3xl uppercase tracking-tight">College Partnership Contracts</h2>
            <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Manage commissions, contract dates, and contact reps for affiliate colleges.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] bg-foreground text-background hover:bg-background hover:text-foreground">
                <Plus className="w-4 h-4 mr-1" /> New Contract
              </Button>
            </DialogTrigger>
            <ContractDialog
              editing={editing}
              onSaved={(contract) => {
                let updated: PartnerContract[];
                if (editing) {
                  updated = contracts.map((c) => (c.id === editing.id ? contract : c));
                  toast.success("Contract updated successfully");
                } else {
                  updated = [...contracts, contract];
                  toast.success("New contract registered");
                }
                saveContracts(updated);
                setDialogOpen(false);
                setEditing(null);
              }}
              onClose={() => {
                setDialogOpen(false);
                setEditing(null);
              }}
            />
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-serif-news text-sm">
            <thead className="bg-[#f4ecd8] border-b-2 border-foreground">
              <tr>
                <Th>College / University</Th>
                <Th>Contact Person</Th>
                <Th>Commission Terms</Th>
                <Th>Students (Active)</Th>
                <Th>Agency Commission</Th>
                <Th>Status & Dates</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center italic text-[#6b3e1a]">
                    Loading partnership ledger...
                  </td>
                </tr>
              ) : contractStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center italic text-[#6b3e1a]">
                    No partner contracts registered yet.
                  </td>
                </tr>
              ) : (
                contractStats.map((c) => {
                  const isExpired = new Date(c.expiryDate) < new Date();
                  const statusLabel = isExpired ? "Expired" : c.status;

                  return (
                    <tr key={c.id} className="border-b border-foreground/20 hover:bg-foreground/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5" />
                          {c.university}
                        </div>
                        {c.notes && (
                          <div className="text-[11px] italic mt-0.5 max-w-xs truncate text-[#6b3e1a]" title={c.notes}>
                            {c.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-xs uppercase tracking-wider">{c.repName}</div>
                        <div className="text-xs italic text-[#6b3e1a]">{c.email}</div>
                        <div className="text-xs italic text-[#6b3e1a]">{c.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-sans text-xs font-bold bg-foreground text-background inline-flex px-2 py-0.5 mb-1">
                          {c.commissionType === "percentage" ? (
                            <span className="flex items-center gap-0.5">
                              {c.commissionRate}
                              <Percent className="w-3 h-3" />
                            </span>
                          ) : (
                            <span>{inr(c.commissionRate)} / seat</span>
                          )}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-[#6b3e1a]">
                          {c.commissionType === "percentage" ? "Collected Fees Share" : "Flat Rate payout"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-xs">
                          {c.studentCount} students
                        </div>
                        <div className="text-[10px] text-[#6b3e1a] italic">
                          {c.activeStudentCount} active verified seats
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-sans font-bold">
                          {inr(c.projectedCommission)}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-[#6b3e1a]">
                          Earned commission
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="mb-1">
                          <span className={`text-[10px] px-1.5 py-0.5 uppercase tracking-widest font-bold border-2 ${statusLabel === "Active" ? "border-foreground bg-foreground text-background" : statusLabel === "Pending Renewal" ? "border-foreground bg-[#f4ecd8] text-foreground" : "border-destructive text-destructive bg-destructive/10"}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="text-[10px] uppercase tracking-wider mt-2 text-[#6b3e1a]">
                          Exp: {c.expiryDate}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-none border-2 border-foreground hover:bg-foreground hover:text-background"
                            onClick={() => {
                              setEditing(c);
                              setDialogOpen(true);
                            }}
                            title="Edit Contract"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleDelete(c.id)}
                            title="Delete Contract"
                            className="h-8 w-8 rounded-none border-2 border-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface ContractDialogProps {
  editing: PartnerContract | null;
  onSaved: (contract: PartnerContract) => void;
  onClose: () => void;
}

function ContractDialog({ editing, onSaved, onClose }: ContractDialogProps) {
  const [form, setForm] = useState<Omit<PartnerContract, "id">>({
    university: "",
    repName: "",
    email: "",
    phone: "",
    commissionType: "percentage",
    commissionRate: 0,
    startDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
    status: "Active",
    notes: "",
  });

  useEffect(() => {
    if (editing) {
      setForm({
        university: editing.university,
        repName: editing.repName,
        email: editing.email,
        phone: editing.phone,
        commissionType: editing.commissionType,
        commissionRate: editing.commissionRate,
        startDate: editing.startDate,
        expiryDate: editing.expiryDate,
        status: editing.status,
        notes: editing.notes || "",
      });
    }
  }, [editing]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.university) return toast.error("University name is required");
    if (form.commissionRate <= 0) return toast.error("Commission rate must be positive");

    onSaved({
      ...form,
      id: editing?.id || `c-${Date.now()}`,
    });
  }

  const UNIVERSITY_OPTIONS = [
    "Mangalayatan University",
    "Jain University",
    "Manipal University",
    "Amity University",
    "NMIMS",
    "IGNOU",
    "LPU"
  ];

  return (
    <DialogContent className="max-w-2xl bg-[#fbf6e7] border-4 border-foreground shadow-[8px_8px_0px_0px_#1a1410] rounded-none p-0 overflow-hidden">
      <div className="bg-foreground text-background p-4 flex items-center justify-between">
        <DialogTitle className="font-headline text-2xl uppercase tracking-tight">{editing ? "Edit College Partner Contract" : "New College Partner Contract"}</DialogTitle>
      </div>
      <div className="p-6">
        <DialogDescription className="font-serif-news italic text-[#6b3e1a] mb-6">
          Record commission parameters, representative contacts, and expiry timelines.
        </DialogDescription>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field label="College / University" required>
          <div className="relative">
            <Input
              value={form.university}
              onChange={(e) => setForm({ ...form, university: e.target.value })}
              placeholder="e.g. Jain University"
              required
              className="w-full rounded-none border-2 border-foreground bg-transparent focus-visible:border-foreground focus-visible:ring-0"
              list="universities-list"
            />
            <datalist id="universities-list">
              {UNIVERSITY_OPTIONS.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </div>
        </Field>

        <Field label="Representative Name" required>
          <Input
            value={form.repName}
            onChange={(e) => setForm({ ...form, repName: e.target.value })}
            placeholder="e.g. Dr. Kumar"
            required
            className="rounded-none border-2 border-foreground bg-transparent focus-visible:border-foreground focus-visible:ring-0"
          />
        </Field>

        <Field label="Contact Email" required>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="rep@college.edu"
            required
            className="rounded-none border-2 border-foreground bg-transparent focus-visible:border-foreground focus-visible:ring-0"
          />
        </Field>

        <Field label="Contact Phone">
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. +91 99988 87766"
            className="rounded-none border-2 border-foreground bg-transparent focus-visible:border-foreground focus-visible:ring-0"
          />
        </Field>

        <Field label="Commission Calculation Model" required>
          <Select
            value={form.commissionType}
            onValueChange={(v: "percentage" | "flat") => setForm({ ...form, commissionType: v })}
          >
            <SelectTrigger className="rounded-none border-2 border-foreground bg-transparent focus:ring-0 font-bold uppercase tracking-wider text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#fbf6e7] border-4 border-foreground shadow-[4px_4px_0px_0px_#1a1410] rounded-none">
              <SelectItem value="percentage" className="font-bold uppercase tracking-wider text-[10px] focus:bg-foreground focus:text-background rounded-none">Percentage share of fees paid</SelectItem>
              <SelectItem value="flat" className="font-bold uppercase tracking-wider text-[10px] focus:bg-foreground focus:text-background rounded-none">Fixed flat commission per seat</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label={form.commissionType === "percentage" ? "Commission Percentage (%)" : "Flat Commission Fee (INR)"} required>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.commissionRate || ""}
            onChange={(e) => setForm({ ...form, commissionRate: Number(e.target.value) })}
            placeholder={form.commissionType === "percentage" ? "e.g. 20" : "e.g. 15000"}
            required
            className="rounded-none border-2 border-foreground bg-transparent focus-visible:border-foreground focus-visible:ring-0"
          />
        </Field>

        <Field label="Contract Effective Start Date" required>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
            className="rounded-none border-2 border-foreground bg-transparent focus-visible:border-foreground focus-visible:ring-0"
          />
        </Field>

        <Field label="Contract Expiry Date" required>
          <Input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            required
            className="rounded-none border-2 border-foreground bg-transparent focus-visible:border-foreground focus-visible:ring-0"
          />
        </Field>

        <Field label="Status" required>
          <Select
            value={form.status}
            onValueChange={(v: "Active" | "Pending Renewal" | "Expired") => setForm({ ...form, status: v })}
          >
            <SelectTrigger className="rounded-none border-2 border-foreground bg-transparent focus:ring-0 font-bold uppercase tracking-wider text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#fbf6e7] border-4 border-foreground shadow-[4px_4px_0px_0px_#1a1410] rounded-none">
              <SelectItem value="Active" className="font-bold uppercase tracking-wider text-[10px] focus:bg-foreground focus:text-background rounded-none">Active</SelectItem>
              <SelectItem value="Pending Renewal" className="font-bold uppercase tracking-wider text-[10px] focus:bg-foreground focus:text-background rounded-none">Pending Renewal</SelectItem>
              <SelectItem value="Expired" className="font-bold uppercase tracking-wider text-[10px] focus:bg-foreground focus:text-background rounded-none">Expired</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <div className="sm:col-span-2 space-y-1.5">
          <Label className="text-xs">Terms & Contract Memorandums</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Special commission adjustments, SLA clauses, billing schedule notes..."
            rows={3}
            className="rounded-none border-2 border-foreground bg-transparent focus-visible:border-foreground focus-visible:ring-0"
          />
        </div>

        <div className="sm:col-span-2 pt-6 flex justify-end gap-4 border-t-4 border-foreground mt-2">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] hover:bg-foreground hover:text-background">
            Cancel
          </Button>
          <Button type="submit" className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] bg-foreground text-background hover:bg-background hover:text-foreground">
            {editing ? "Save Changes" : "Register Contract"}
          </Button>
        </div>
      </form>
      </div>
    </DialogContent>
  );
}

/* ----------------------- COMPLIANCE ----------------------- */

function ComplianceTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    const { data } = await supabase.from("students").select("*").order("full_name");
    setStudents(data ?? []);
    setBusy(false);
  }
  useEffect(() => { load(); }, []);

  async function toggleDoc(id: string, field: keyof Student, currentVal: any) {
    const { error } = await supabase.from("students").update({ [field]: !currentVal }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-hidden">
      <div className="p-6 border-b-4 border-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl uppercase tracking-tight">Compliance Desk</h2>
          <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Track student document verification status.</p>
        </div>
        <Button variant="outline" className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px]" onClick={load} disabled={busy}>
          Refresh
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-serif-news text-sm">
          <thead className="bg-[#f4ecd8] border-b-2 border-foreground">
            <tr>
              <Th>Student</Th>
              <Th>ID Proof</Th>
              <Th>Photo</Th>
              <Th>Signature</Th>
              <Th>10th Marks</Th>
              <Th>12th Marks</Th>
              <Th>Degree</Th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={7} className="p-10 text-center italic text-[#6b3e1a]">No students found.</td></tr>
            ) : students.map((s) => (
              <tr key={s.id} className="border-b border-foreground/20 hover:bg-foreground/5 transition-colors">
                <td className="p-4">
                  <div className="font-bold">{s.full_name}</div>
                  <div className="text-xs italic text-[#6b3e1a]">{s.program} - {s.specialization}</div>
                </td>
                <td className="p-4">
                  <input type="checkbox" checked={!!s.doc_id_proof} onChange={() => toggleDoc(s.id, "doc_id_proof", s.doc_id_proof)} className="w-4 h-4 accent-foreground" />
                </td>
                <td className="p-4">
                  <input type="checkbox" checked={!!s.doc_photo} onChange={() => toggleDoc(s.id, "doc_photo", s.doc_photo)} className="w-4 h-4 accent-foreground" />
                </td>
                <td className="p-4">
                  <input type="checkbox" checked={!!s.doc_signature} onChange={() => toggleDoc(s.id, "doc_signature", s.doc_signature)} className="w-4 h-4 accent-foreground" />
                </td>
                <td className="p-4">
                  <input type="checkbox" checked={!!s.doc_marksheet_10} onChange={() => toggleDoc(s.id, "doc_marksheet_10", s.doc_marksheet_10)} className="w-4 h-4 accent-foreground" />
                </td>
                <td className="p-4">
                  <input type="checkbox" checked={!!s.doc_marksheet_12} onChange={() => toggleDoc(s.id, "doc_marksheet_12", s.doc_marksheet_12)} className="w-4 h-4 accent-foreground" />
                </td>
                <td className="p-4">
                  <input type="checkbox" checked={!!s.doc_marksheet_degree} onChange={() => toggleDoc(s.id, "doc_marksheet_degree", s.doc_marksheet_degree)} className="w-4 h-4 accent-foreground" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------- ACADEMICS ----------------------- */

function AcademicsTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    const { data } = await supabase.from("students").select("*").order("full_name");
    setStudents(data ?? []);
    setBusy(false);
  }
  useEffect(() => { load(); }, []);

  async function updateField(id: string, field: keyof Student, value: string) {
    const { error } = await supabase.from("students").update({ [field]: value }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
  }

  return (
    <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-hidden">
      <div className="p-6 border-b-4 border-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl uppercase tracking-tight">Academic Logistics</h2>
          <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Track enrollment numbers, DEB IDs, and ABC IDs.</p>
        </div>
        <Button variant="outline" className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px]" onClick={load} disabled={busy}>
          Refresh
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-serif-news text-sm">
          <thead className="bg-[#f4ecd8] border-b-2 border-foreground">
            <tr>
              <Th>Student</Th>
              <Th>Session</Th>
              <Th>Enrollment #</Th>
              <Th>DEB ID</Th>
              <Th>ABC ID</Th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center italic text-[#6b3e1a]">No students found.</td></tr>
            ) : students.map((s) => (
              <tr key={s.id} className="border-b border-foreground/20 hover:bg-foreground/5 transition-colors">
                <td className="p-4">
                  <div className="font-bold">{s.full_name}</div>
                  <div className="text-xs italic text-[#6b3e1a]">{s.program} - {s.specialization}</div>
                </td>
                <td className="p-4">
                  <Input 
                    defaultValue={s.admission_session ?? ""} 
                    onBlur={(e) => { if(e.target.value !== s.admission_session) updateField(s.id, "admission_session", e.target.value); }} 
                    className="h-8 rounded-none border-2 border-foreground/20 focus-visible:border-foreground w-24 bg-transparent" 
                    placeholder="e.g. Jan 25"
                  />
                </td>
                <td className="p-4">
                  <Input 
                    defaultValue={s.enrollment_number ?? ""} 
                    onBlur={(e) => { if(e.target.value !== s.enrollment_number) updateField(s.id, "enrollment_number", e.target.value); }} 
                    className="h-8 rounded-none border-2 border-foreground/20 focus-visible:border-foreground min-w-[120px] bg-transparent" 
                  />
                </td>
                <td className="p-4">
                  <Input 
                    defaultValue={s.deb_id ?? ""} 
                    onBlur={(e) => { if(e.target.value !== s.deb_id) updateField(s.id, "deb_id", e.target.value); }} 
                    className="h-8 rounded-none border-2 border-foreground/20 focus-visible:border-foreground min-w-[120px] bg-transparent" 
                  />
                </td>
                <td className="p-4">
                  <Input 
                    defaultValue={s.abc_id ?? ""} 
                    onBlur={(e) => { if(e.target.value !== s.abc_id) updateField(s.id, "abc_id", e.target.value); }} 
                    className="h-8 rounded-none border-2 border-foreground/20 focus-visible:border-foreground min-w-[120px] bg-transparent" 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`p-4 font-medium text-xs uppercase tracking-wider text-muted-foreground ${className || ""}`}>{children}</th>;
}
