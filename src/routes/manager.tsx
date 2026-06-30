import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GraduationCap, LogOut, Plus, ShieldCheck, Receipt, TrendingUp, Calendar, Trash2, Upload, IndianRupee, ArrowLeft, Pencil, Briefcase, Building, Users, CheckCircle, Settings, Mail } from "lucide-react";
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
  head: () => ({ meta: [{ title: "Manager Console | JoinOnline Education" }] }),
  component: ManagerPage,
});

type Student = Tables<"students">;
type Payment = Tables<"fee_payments">;

const PAYMENT_MODES = ["UPI", "Net Banking", "Card", "Cash", "Cheque", "EMI"];

const inr = (n: number | null | undefined) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n ?? 0));

function ManagerPage() {
  const { user: authUser, role: authRole, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const isBypass = typeof window !== "undefined" && (window.location.search.includes("bypass=true") || localStorage.getItem("admin_bypass") === "true");
  const user = authUser;
  const role = authRole;
  const loading = authLoading;

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
    const r = role as any;
    if (!loading && user && r && r !== "admin" && r !== "center" && r !== "staff") {
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, role, navigate]);

  const r = role as any;
  if (loading || !user || (r !== "admin" && r !== "center" && r !== "staff")) {
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
            JoinOnline
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
          <TabsList className="flex flex-wrap w-full h-auto bg-transparent gap-2 p-0 justify-start">
            <TabsTrigger value="overview" className="border-2 border-foreground rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background font-sans font-bold uppercase tracking-widest text-[10px] py-3"><TrendingUp className="w-4 h-4 mr-1.5" /> Overview</TabsTrigger>
            <TabsTrigger value="students" className="border-2 border-foreground rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background font-sans font-bold uppercase tracking-widest text-[10px] py-3"><Users className="w-4 h-4 mr-1.5" /> Leads & Students</TabsTrigger>
            {role === "admin" && (
              <>
                <TabsTrigger value="enquiries" className="border-2 border-foreground rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background font-sans font-bold uppercase tracking-widest text-[10px] py-3"><Mail className="w-4 h-4 mr-1.5" /> Inbound Enquiries</TabsTrigger>
                <TabsTrigger value="settings" className="border-2 border-foreground rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background font-sans font-bold uppercase tracking-widest text-[10px] py-3"><Settings className="w-4 h-4 mr-1.5" /> Admin Settings</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="overview" className="pt-6"><OverviewTab role={role || ""} userEmail={user?.email || ""} /></TabsContent>
          <TabsContent value="students" className="pt-6"><StudentsTab role={role || ""} userEmail={user?.email || ""} /></TabsContent>
          <TabsContent value="payments" className="pt-6"><PaymentsTab role={role || ""} userEmail={user?.email || ""} /></TabsContent>
          {role === "admin" && (
            <>
              <TabsContent value="enquiries" className="pt-6"><EnquiriesTab /></TabsContent>
              <TabsContent value="settings" className="pt-6"><SettingsTab /></TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
}

/* ----------------------- OVERVIEW ----------------------- */

function OverviewTab({ role, userEmail }: { role: string; userEmail: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    (async () => {
      let studentQuery = supabase.from("students").select("*");
      let paymentQuery = supabase.from("fee_payments").select("*, student:students(*)");
      
      if (role === "center") {
        studentQuery = studentQuery.eq("counsellor_name", userEmail).neq("status", "lead");
      }
      if (role === "staff") {
        studentQuery = studentQuery.eq("counsellor_name", userEmail);
      }
      if (role === "admin") {
        // Admin sees everything
      }

      const [s, p] = await Promise.all([
        studentQuery,
        paymentQuery,
      ]);
      
      const studentsData = s.data ?? [];
      let paymentsData = p.data ?? [];
      
      if (role === "center") {
        // Filter payments for only assigned students on frontend if backend query is complex
        paymentsData = paymentsData.filter((pay: any) => pay.student?.counsellor_name === userEmail);
      }

      setStudents(studentsData);
      setPayments(paymentsData);
    })();
  }, [role, userEmail]);

  const totalBilled = students.reduce((sum, s) => sum + Number(s.total_fee ?? 0), 0);
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = Math.max(totalBilled - totalCollected, 0);
  const netRevenue = totalCollected; // Expenses removed

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
    return m;
  }, [payments]);

  const maxBar = Math.max(1, ...Object.values(monthly).flatMap((v) => [v.in, v.out]));

  // By program
  const byProgram = useMemo(() => {
    const m: Record<string, number> = {};
    students.forEach((s) => { m[s.program] = (m[s.program] ?? 0) + 1; });
    return m;
  }, [students]);

  // Today's follow-ups
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
                <span className="font-sans font-bold uppercase tracking-widest text-[10px] text-[#6b3e1a]">Students with dues</span>
                <span className="font-bold border border-foreground px-2 py-0.5 text-xs">{overdue}</span>
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

function PaymentsTab({ role, userEmail }: { role: string; userEmail: string }) {
  const [payments, setPayments] = useState<(Payment & { student?: Student })[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    let query = supabase.from("fee_payments").select("*, student:students(*)").order("payment_date", { ascending: false });
    let studentQuery = supabase.from("students").select("*").order("full_name");

    const { data: payData } = await query;
    const { data: stuData } = await studentQuery;
    
    let filteredPayments = (payData as any) ?? [];
    let filteredStudents = stuData ?? [];

    if (role === "center") {
      filteredPayments = filteredPayments.filter((p: any) => p.student?.counsellor_name === userEmail);
      filteredStudents = filteredStudents.filter((s: any) => s.counsellor_name === userEmail);
    }

    setPayments(filteredPayments);
    setStudents(filteredStudents);
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
<h1>JoinOnline Education</h1>
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

/* ----------------------- SETTINGS / ACCESS ----------------------- */

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

/* ----------------------- STUDENTS DIRECTORY ----------------------- */

function StudentsTab({ role, userEmail }: { role: string; userEmail: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  async function load() {
    let query = supabase.from("students").select("*").order("created_at", { ascending: false });
    if (role === "center") {
      query = query.eq("counsellor_name", userEmail).neq("status", "lead");
    }
    if (role === "staff") {
      query = query.eq("counsellor_name", userEmail);
    }
    if (role === "admin") {
      // Sees all
    }
    const { data } = await query;
    if (data) setStudents(data);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(s => {
      const matchSearch = !q || s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.phone || "").includes(q) || (s.enrollment_number || "").toLowerCase().includes(q);
      const matchProgram = filterProgram === "all" || s.program === filterProgram;
      const matchStatus = filterStatus === "all" || s.status === filterStatus;
      return matchSearch && matchProgram && matchStatus;
    });
  }, [students, search, filterProgram, filterStatus]);

  const activeCount = students.filter(s => s.status === "active").length;
  const graduatedCount = students.filter(s => s.status === "graduated").length;
  const programCount = new Set(students.map(s => s.program)).size;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <KPI label="Total Students" value={String(students.length)} icon={Users} />
        <KPI label="Active" value={String(activeCount)} icon={GraduationCap} />
        <KPI label="Graduated" value={String(graduatedCount)} icon={Briefcase} />
        <KPI label="Programs" value={String(programCount)} icon={Building} />
      </div>

      <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] p-4 space-y-3">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <h2 className="font-headline text-2xl uppercase tracking-tighter">Student Registry</h2>
          <Button onClick={() => { setEditingStudent(null); setEditorOpen(true); }} className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] bg-foreground text-background hover:bg-background hover:text-foreground">
            <Plus className="w-4 h-4 mr-2" /> Add New Student
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Input placeholder="Search by name, email, phone, enrollment no…" value={search} onChange={e => setSearch(e.target.value)} className="rounded-none border-2 border-foreground bg-transparent focus-visible:ring-0 flex-1 min-w-[200px]" />
          <Select value={filterProgram} onValueChange={setFilterProgram}>
            <SelectTrigger className="rounded-none border-2 border-foreground bg-transparent focus:ring-0 font-bold uppercase tracking-wider text-[10px] w-[140px]"><SelectValue placeholder="Program" /></SelectTrigger>
            <SelectContent className="bg-[#fbf6e7] border-4 border-foreground rounded-none shadow-[4px_4px_0px_0px_#1a1410]">
              {["all", "BBA", "MBA", "BCA", "MCA", "B.Com", "M.Com", "10th", "12th Arts", "12th Commerce", "12th Science"].map(p => (
                <SelectItem key={p} value={p} className="font-bold uppercase tracking-wider text-[10px] rounded-none focus:bg-foreground focus:text-background">{p === "all" ? "All Programs" : p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="rounded-none border-2 border-foreground bg-transparent focus:ring-0 font-bold uppercase tracking-wider text-[10px] w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-[#fbf6e7] border-4 border-foreground rounded-none shadow-[4px_4px_0px_0px_#1a1410]">
              {["all", "active", "inactive", "graduated", "suspended"].map(s => (
                <SelectItem key={s} value={s} className="font-bold uppercase tracking-wider text-[10px] rounded-none focus:bg-foreground focus:text-background">{s === "all" ? "All Statuses" : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-4 border-foreground bg-foreground text-background">
              <Th>Name & Contact</Th>
              <Th>Program & Batch</Th>
              <Th>Location</Th>
              <Th>Fee Status</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody className="font-serif-news text-sm">
            {filtered.map((s) => (
              <tr key={s.id} className="border-b-2 border-foreground/20 hover:bg-black/5 transition-colors">
                <td className="p-4">
                  <div className="font-bold">{s.full_name}</div>
                  <div className="text-xs text-muted-foreground">{s.email}</div>
                  <div className="text-xs text-muted-foreground">{s.phone || "No phone"}</div>
                  {s.enrollment_number && <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#6b3e1a] mt-0.5">#{s.enrollment_number}</div>}
                </td>
                <td className="p-4">
                  <div className="font-bold">{s.program}{s.specialization ? ` — ${s.specialization}` : ""}</div>
                  <div className="text-xs text-muted-foreground">Session: {s.admission_session || s.batch_year}</div>
                  <div className="text-xs text-muted-foreground">{s.university}</div>
                </td>
                <td className="p-4">
                  <div>{s.city || s.location}</div>
                  <div className="text-xs text-muted-foreground">{s.state || ""}{s.pincode ? ` — ${s.pincode}` : ""}</div>
                </td>
                <td className="p-4">
                  {s.payment_status ? (
                    <Badge variant="outline" className={`border-2 border-foreground rounded-none font-sans font-bold uppercase tracking-widest text-[10px] ${s.payment_status === "Paid" ? "bg-foreground text-background" : s.payment_status === "Overdue" ? "bg-red-100 text-red-800 border-red-800" : "bg-background"}`}>
                      {s.payment_status}
                    </Badge>
                  ) : <span className="text-muted-foreground text-xs italic">—</span>}
                  {s.total_fee && <div className="text-xs text-muted-foreground mt-0.5">{inr(s.total_fee)}</div>}
                </td>
                <td className="p-4">
                  <Badge variant="outline" className="border-2 border-foreground rounded-none font-sans font-bold uppercase tracking-widest text-[10px] bg-background">
                    {s.status}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <Button size="sm" variant="outline" onClick={() => { setEditingStudent(s); setEditorOpen(true); }} className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] hover:bg-foreground hover:text-background">
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground italic">No students match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <StudentEditorDialog
          student={editingStudent}
          onClose={() => { setEditorOpen(false); load(); }}
        />
      </Dialog>
    </div>
  );
}


function StudentEditorDialog({ student, onClose }: { student: Student | null; onClose: () => void }) {
  const emptyForm: Partial<Student> = {
    full_name: "", email: "", phone: "", address: "", city: "", district: "", state: "", pincode: "",
    dob: "", gender: "", category: "", religion: "", marital_status: "", employment_status: "",
    father_name: "", mother_name: "", aadhar_number: "", abc_id: "", deb_id: "",
    edu_10_year: undefined, edu_10_board: "", edu_10_percentage: undefined, edu_10_result: "", edu_10_marks: "",
    edu_12_year: undefined, edu_12_board: "", edu_12_percentage: undefined, edu_12_result: "", edu_12_marks: "",
    edu_degree_year: undefined, edu_degree_university: "", edu_degree_percentage: undefined, edu_degree_result: "", edu_degree_marks: "",
    program: "BBA", specialization: "", batch_year: new Date().getFullYear(), university: "",
    enrollment_number: "", admission_session: "", study_mode: "", medium_of_instruction: "",
    current_semester: undefined, total_semesters: undefined, duration_years: undefined, course_code: "", course_name: "",
    total_fee: undefined, fee_paid: undefined, fee_pending: undefined, payment_status: "", payment_mode: "",
    lead_source: "", counsellor_name: "", referral_name: "", notes: "",
    status: "active", location: "",
    doc_photo: false, doc_id_proof: false, doc_marksheet_10: false, doc_marksheet_12: false,
    doc_marksheet_degree: false, doc_signature: false,
  };
  const [form, setForm] = useState<Partial<Student>>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [staffList, setStaffList] = useState<{ email: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("allowed_managers" as any).select("email");
      if (data) setStaffList(data);
    })();
  }, []);

  useEffect(() => {
    if (student) setForm(student);
    else setForm(emptyForm);
  }, [student]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      // Session is free text (e.g. "NIOS - Dec 2026"); keep batch_year in sync
      // by parsing a 4-digit year out of it for sorting/filtering.
      const sessionText = String(form.admission_session ?? "");
      const ym = sessionText.match(/(20\d{2})/);
      const payload = { ...form, batch_year: ym ? Number(ym[1]) : (Number(form.batch_year) || new Date().getFullYear()) };
      if (student) {
        const { error } = await supabase.from("students").update(payload).eq("id", student.id);
        if (error) throw error;
        toast.success("Student updated");
      } else {
        const { error } = await supabase.from("students").insert([payload]);
        if (error) throw error;
        toast.success("Student admitted");
      }
      onClose();
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const docs = [
    { key: "doc_id_proof", label: "Aadhaar Card", required: true },
    { key: "doc_marksheet_10", label: "10th Marks Card", required: true },
    { key: "doc_photo", label: "Photograph", required: true },
    { key: "doc_marksheet_12", label: "12th Marks Card", required: false },
  ];

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-4 border-foreground bg-[#fbf6e7] rounded-none">
      <DialogHeader className="p-6 bg-foreground text-background border-b-4 border-foreground">
        <DialogTitle className="font-headline text-2xl uppercase tracking-tighter">
          {student ? "Edit Student Profile" : "New Student Admission"}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={save} className="p-8 space-y-10">
        <section className="space-y-6">
          <h3 className="font-headline text-xl uppercase tracking-tighter border-b-2 border-foreground pb-2">Mandatory Documents</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {docs.map(doc => {
              const uploaded = (form as any)[doc.key];
              return (
                <div key={doc.key} 
                  onClick={() => setForm({ ...form, [doc.key]: !uploaded })}
                  className={`cursor-pointer p-4 border-4 transition-all flex flex-col justify-between aspect-square ${uploaded ? "bg-foreground text-background border-foreground shadow-[4px_4px_0px_0px_#6b3e1a]" : "bg-background/50 text-foreground border-foreground/20 hover:border-foreground border-dashed"}`}>
                  <span className="font-sans font-bold uppercase tracking-widest text-[9px] leading-tight">{doc.label}{doc.required && <span className="text-red-500 ml-1">*</span>}</span>
                  <span className={`text-[8px] border-t pt-1.5 w-full ${uploaded ? "border-background/30 opacity-70" : "border-foreground/20 text-muted-foreground"}`}>
                    {uploaded ? "VERIFIED ?" : "MANDATORY"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-6 pt-6">
          <h3 className="font-headline text-xl uppercase tracking-tighter border-b-2 border-foreground pb-2">Academic Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="University" required>
              <Input value={form.university || ""} onChange={e => setForm({ ...form, university: e.target.value })} required className="rounded-none border-2 border-foreground" />
            </Field>
            <Field label="Program" required>
              <Select value={form.program || ""} onValueChange={v => setForm({ ...form, program: v as any })}>
                <SelectTrigger className="rounded-none border-2 border-foreground uppercase font-bold text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                  {["BBA", "MBA", "BCA", "MCA", "B.Com", "M.Com", "10th", "12th Arts", "12th Commerce", "12th Science"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Session"><Input value={form.admission_session ?? ""} onChange={e => setForm({ ...form, admission_session: e.target.value })} placeholder="e.g. NIOS - Dec 2026" maxLength={60} className="rounded-none border-2 border-foreground" /></Field>
            <Field label="Enrollment Number (Final)"><Input value={form.enrollment_number || ""} onChange={e => setForm({ ...form, enrollment_number: e.target.value })} placeholder="Provided by Admin later" className="rounded-none border-2 border-foreground" /></Field>
          </div>
        </section>

        <section className="space-y-6 pt-6 pb-20">
          <h3 className="font-headline text-xl uppercase tracking-tighter border-b-2 border-foreground pb-2">Personal Details</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Full Name" required><Input value={form.full_name || ""} onChange={e => setForm({ ...form, full_name: e.target.value })} required className="rounded-none border-2 border-foreground" /></Field>
            <Field label="Email" required><Input type="email" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} required className="rounded-none border-2 border-foreground" /></Field>
            <Field label="Phone" required><Input value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} required className="rounded-none border-2 border-foreground" /></Field>
          </div>
        </section>

        <div className="sticky bottom-0 bg-[#fbf6e7] border-t-4 border-foreground py-4 flex flex-col sm:flex-row justify-end gap-4 z-20">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy} className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] h-12 px-8">
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !form.doc_photo || !form.doc_id_proof || !form.doc_marksheet_10} className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] bg-foreground text-background hover:bg-background hover:text-foreground h-12 px-10 disabled:opacity-50">
            {student ? "Update Profile" : "Submit Admission Request"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

function SettingsTab() {
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("center");
  const [busy, setBusy] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  const loadMembers = async () => {
    const { data } = await supabase.from("allowed_managers" as any).select("*").order("created_at", { ascending: false });
    if (data) setMembers(data);
  };
  useEffect(() => { loadMembers(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.from("allowed_managers" as any).upsert([{ email: email.toLowerCase().trim(), role: selectedRole }], { onConflict: "email" });
      if (error) throw error;
      toast.success("Invited " + email);
      setEmail("");
      loadMembers();
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#fbf6e7] border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_#1a1410]">
        <h3 className="font-headline text-xl uppercase mb-4">Invite Team Member</h3>
        <form onSubmit={handleInvite} className="flex gap-4">
          <Input placeholder="user@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="rounded-none border-2 border-foreground flex-1" />
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-40 rounded-none border-2 border-foreground"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-none border-2 border-foreground bg-[#fbf6e7]">
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={busy} className="rounded-none border-2 border-foreground bg-foreground text-background font-bold tracking-widest text-[10px] uppercase">Invite</Button>
        </form>
      </div>
      <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-foreground text-background border-b-2 border-foreground"><th className="p-4 uppercase text-xs">Email</th><th className="p-4 uppercase text-xs">Role</th></tr></thead>
          <tbody>
            <tr className="border-b border-foreground/10"><td className="p-4 font-bold">ulfathai003@gmail.com</td><td className="p-4 font-bold">MASTER ADMIN</td></tr>
            {members.map(m => (
              <tr key={m.id} className="border-b border-foreground/10"><td className="p-4">{m.email}</td><td className="p-4 uppercase font-bold text-xs">{m.role}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EnquiriesTab() {
  const [leads, setLeads] = useState<Student[]>([]);
  const [busy, setBusy] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);

  const load = async () => {
    setBusy(true);
    const [l, s] = await Promise.all([
      supabase.from("students").select("*").eq("status", "lead").order("created_at", { ascending: false }),
      supabase.from("allowed_managers" as any).select("*")
    ]);
    if (l.data) setLeads(l.data);
    if (s.data) setStaff(s.data);
    setBusy(false);
  };
  useEffect(() => { load(); }, []);

  const allocate = async (id: string, email: string) => {
    const { error } = await supabase.from("students").update({ counsellor_name: email }).eq("id", id);
    if (error) toast.error("Failed to allocate");
    else { toast.success("Lead assigned to " + email); load(); }
  };

  const approve = async (id: string) => {
    const { error } = await supabase.from("students").update({ status: "active" }).eq("id", id);
    if (error) toast.error("Approval failed");
    else { toast.success("Admission approved!"); load(); }
  };

  return (
    <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-hidden">
      <div className="p-4 bg-foreground text-background flex justify-between items-center"><h3 className="font-headline text-xl uppercase tracking-widest">Inbound Enquiries</h3><Button size="sm" onClick={load} className="border-2 border-background">Refresh</Button></div>
      <table className="w-full text-left">
        <thead><tr className="bg-foreground/5 border-b-2 border-foreground"><th className="p-4 text-xs font-bold uppercase">Candidate</th><th className="p-4 text-xs font-bold uppercase">Assign To</th><th className="p-4 text-xs font-bold uppercase text-right">Action</th></tr></thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id} className="border-b border-foreground/10">
              <td className="p-4 text-xs"><b>{lead.full_name}</b><br/>{lead.university} - {lead.program}</td>
              <td className="p-4">
                <Select onValueChange={v => allocate(lead.id, v)} defaultValue={lead.counsellor_name || undefined}>
                  <SelectTrigger className="h-8 w-40 border-2 border-foreground rounded-none"><SelectValue placeholder="Allocate" /></SelectTrigger>
                  <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">{staff.map(s => <SelectItem key={s.id} value={s.email}>{s.email}</SelectItem>)}</SelectContent>
                </Select>
              </td>
              <td className="p-4 text-right"><Button size="sm" onClick={() => approve(lead.id)} className="h-8 border-2 border-foreground bg-foreground text-background rounded-none text-[10px] font-bold uppercase">Approve</Button></td>
            </tr>
          ))}
          {leads.length === 0 && !busy && <tr><td colSpan={3} className="p-10 text-center italic text-muted-foreground">No pending inbound leads.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
