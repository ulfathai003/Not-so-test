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
  head: () => ({ meta: [{ title: "Manager Console | EduConnect" }] }),
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

          <TabsContent value="overview" className="pt-6"><OverviewTab role={role} userEmail={user.email || ""} /></TabsContent>
          <TabsContent value="students" className="pt-6"><StudentsTab role={role} userEmail={user.email || ""} /></TabsContent>
          <TabsContent value="payments" className="pt-6"><PaymentsTab role={role} userEmail={user.email || ""} /></TabsContent>
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
                  <div className="text-xs text-muted-foreground">Batch: {s.batch_year}</div>
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

  const [staffList, setStaffList] = useState<{email: string}[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("allowed_managers" as any).select("email");
      if (data) setStaffList(data);
    })();
  }, []);

  useEffect(() => {
    setForm(student ? { ...student } : { ...emptyForm, batch_year: new Date().getFullYear() });
  }, [student]);

  const f = (field: keyof Student) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  const fn = (field: keyof Student) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value ? Number(e.target.value) : undefined }));
  const fs = (field: keyof Student) => (v: string) =>
    setForm(prev => ({ ...prev, [field]: v }));
  const fdoc = (field: keyof Student) => () =>
    setForm(prev => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, location: form.city || form.state || form.location || "Not specified" };
      if (student?.id) {
        const { error } = await supabase.from("students").update(payload).eq("id", student.id);
        if (error) throw error;
        toast.success("Student record updated");
      } else {
        const { error } = await supabase.from("students").insert([payload as TablesInsert<"students">]);
        if (error) throw error;
        toast.success("New student archived");
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save student");
    } finally {
      setBusy(false);
    }
  };

  const cls = "rounded-none border-2 border-foreground bg-transparent focus-visible:ring-0 focus:ring-0";
  const selCls = "bg-[#fbf6e7] border-4 border-foreground rounded-none shadow-[4px_4px_0px_0px_#1a1410]";
  const selItemCls = "font-bold uppercase tracking-wider text-[10px] rounded-none focus:bg-foreground focus:text-background";
  const trigCls = "rounded-none border-2 border-foreground bg-transparent focus:ring-0 focus-visible:ring-0 font-bold uppercase tracking-wider text-[10px]";

  const SelWrap = ({ field, options, placeholder }: { field: keyof Student; options: string[]; placeholder?: string }) => (
    <Select value={(form[field] as string) || ""} onValueChange={fs(field)}>
      <SelectTrigger className={trigCls}><SelectValue placeholder={placeholder || "Select"} /></SelectTrigger>
      <SelectContent className={selCls}>
        {options.map(v => <SelectItem key={v} value={v} className={selItemCls}>{v}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[#fbf6e7] border-4 border-foreground shadow-[8px_8px_0px_0px_#1a1410] rounded-none p-0">
      <div className="bg-foreground text-background p-4 sticky top-0 z-20 shadow-[0_4px_0_0_#1a1410]">
        <DialogTitle className="font-headline text-2xl uppercase tracking-tight">
          {student ? `Editing: ${student.full_name}` : "New Student Registry"}
        </DialogTitle>
        <DialogDescription className="text-background/60 font-serif-news text-xs italic mt-0.5">
          {student ? `Enrollment: ${student.enrollment_number || "Not assigned"}` : "Complete all required fields to archive a new student."}
        </DialogDescription>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-10">

        {/* SECTION I */}
        <section>
          <h3 className="font-headline text-xl uppercase tracking-tighter border-b-4 border-foreground pb-2 mb-5">I. Identity & Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Full Name" required><Input value={form.full_name || ""} onChange={f("full_name")} required className={cls} /></Field>
            <Field label="Email Address" required><Input type="email" value={form.email || ""} onChange={f("email")} required className={cls} /></Field>
            <Field label="Phone Number" required><Input value={form.phone || ""} onChange={f("phone")} required className={cls} /></Field>
            <Field label="Date of Birth"><Input type="date" value={form.dob || ""} onChange={f("dob")} className={cls} /></Field>
            <Field label="Gender"><SelWrap field="gender" options={["Male", "Female", "Other"]} /></Field>
            <Field label="Category"><SelWrap field="category" options={["General", "OBC", "SC", "ST", "EWS", "Other"]} /></Field>
            <Field label="Religion"><Input value={form.religion || ""} onChange={f("religion")} placeholder="e.g. Hindu" className={cls} /></Field>
            <Field label="Marital Status"><SelWrap field="marital_status" options={["Single", "Married", "Divorced", "Widowed"]} /></Field>
            <Field label="Employment Status"><SelWrap field="employment_status" options={["Employed", "Unemployed", "Self-employed", "Student"]} /></Field>
            <Field label="Father's Name"><Input value={form.father_name || ""} onChange={f("father_name")} className={cls} /></Field>
            <Field label="Mother's Name"><Input value={form.mother_name || ""} onChange={f("mother_name")} className={cls} /></Field>
            <Field label="Aadhaar Number"><Input value={form.aadhar_number || ""} onChange={f("aadhar_number")} placeholder="12-digit Aadhaar Card number" className={cls} /></Field>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Address" full><Input value={form.address || ""} onChange={f("address")} className={cls} /></Field>
            <Field label="City"><Input value={form.city || ""} onChange={f("city")} className={cls} /></Field>
            <Field label="District"><Input value={form.district || ""} onChange={f("district")} className={cls} /></Field>
            <Field label="State"><Input value={form.state || ""} onChange={f("state")} className={cls} /></Field>
            <Field label="Pincode"><Input value={form.pincode || ""} onChange={f("pincode")} className={cls} /></Field>
          </div>
        </section>

        {/* SECTION II */}
        <section>
          <h3 className="font-headline text-xl uppercase tracking-tighter border-b-4 border-foreground pb-2 mb-5">II. Academic History</h3>
          <div className="space-y-4">
            {[
              { title: "Class 10th", yr: "edu_10_year", board: "edu_10_board", pct: "edu_10_percentage", marks: "edu_10_marks", result: "edu_10_result" },
              { title: "Class 12th", yr: "edu_12_year", board: "edu_12_board", pct: "edu_12_percentage", marks: "edu_12_marks", result: "edu_12_result" },
            ].map(row => (
              <div key={row.title} className="bg-foreground/5 border-2 border-foreground/20 p-4">
                <p className="font-sans font-bold uppercase tracking-widest text-[10px] mb-3 border-b border-foreground/20 pb-1">{row.title}</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Field label="Year"><Input type="number" value={(form[row.yr as keyof Student] as number) || ""} onChange={fn(row.yr as keyof Student)} placeholder="YYYY" className={cls} /></Field>
                  <Field label="Board"><Input value={(form[row.board as keyof Student] as string) || ""} onChange={f(row.board as keyof Student)} placeholder="CBSE" className={cls} /></Field>
                  <Field label="%"><Input type="number" step="0.1" value={(form[row.pct as keyof Student] as number) || ""} onChange={fn(row.pct as keyof Student)} placeholder="%" className={cls} /></Field>
                  <Field label="Marks"><Input value={(form[row.marks as keyof Student] as string) || ""} onChange={f(row.marks as keyof Student)} placeholder="e.g. 450/500" className={cls} /></Field>
                  <Field label="Result"><SelWrap field={row.result as keyof Student} options={["Pass", "Fail", "Distinction", "First Class", "Second Class"]} /></Field>
                </div>
              </div>
            ))}
            <div className="bg-foreground/5 border-2 border-foreground/20 p-4">
              <p className="font-sans font-bold uppercase tracking-widest text-[10px] mb-3 border-b border-foreground/20 pb-1">Graduation / Degree (if applicable)</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Field label="Year"><Input type="number" value={form.edu_degree_year || ""} onChange={fn("edu_degree_year")} placeholder="YYYY" className={cls} /></Field>
                <Field label="University"><Input value={form.edu_degree_university || ""} onChange={f("edu_degree_university")} className={cls} /></Field>
                <Field label="%"><Input type="number" step="0.1" value={form.edu_degree_percentage || ""} onChange={fn("edu_degree_percentage")} placeholder="%" className={cls} /></Field>
                <Field label="Marks"><Input value={form.edu_degree_marks || ""} onChange={f("edu_degree_marks")} className={cls} /></Field>
                <Field label="Result"><SelWrap field="edu_degree_result" options={["Pass", "Fail", "Distinction", "First Class", "Second Class"]} /></Field>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION III */}
        <section>
          <h3 className="font-headline text-xl uppercase tracking-tighter border-b-4 border-foreground pb-2 mb-5">III. Enrollment & Program</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Program" required>
              <SelWrap field="program" options={["BBA", "MBA", "BCA", "MCA", "B.Com", "M.Com", "10th", "12th Arts", "12th Commerce", "12th Science"]} />
            </Field>
            <Field label="Specialization" required><Input value={form.specialization || ""} onChange={f("specialization")} placeholder="e.g. Marketing" className={cls} /></Field>
            <Field label="University" required><Input value={form.university || ""} onChange={f("university")} className={cls} /></Field>
            <Field label="Batch Year" required><Input type="number" value={form.batch_year || ""} onChange={fn("batch_year")} className={cls} /></Field>
            <Field label="Admission Session"><SelWrap field="admission_session" options={["January", "July"]} /></Field>
            <Field label="Study Mode"><SelWrap field="study_mode" options={["Online", "Distance", "Hybrid"]} /></Field>
            <Field label="Medium"><SelWrap field="medium_of_instruction" options={["English", "Hindi", "Bilingual"]} /></Field>
            <Field label="Enrollment No."><Input value={form.enrollment_number || ""} onChange={f("enrollment_number")} className={cls} /></Field>
            <Field label="Course Code"><Input value={form.course_code || ""} onChange={f("course_code")} className={cls} /></Field>
            <Field label="Course Name"><Input value={form.course_name || ""} onChange={f("course_name")} className={cls} /></Field>
            <Field label="Duration (Years)"><Input type="number" value={form.duration_years || ""} onChange={fn("duration_years")} className={cls} /></Field>
            <Field label="Total Semesters"><Input type="number" value={form.total_semesters || ""} onChange={fn("total_semesters")} className={cls} /></Field>
            <Field label="Current Semester"><Input type="number" value={form.current_semester || ""} onChange={fn("current_semester")} className={cls} /></Field>
            <Field label="ABC ID"><Input value={form.abc_id || ""} onChange={f("abc_id")} className={cls} /></Field>
            <Field label="DEB ID"><Input value={form.deb_id || ""} onChange={f("deb_id")} className={cls} /></Field>
            <Field label="Account Status"><SelWrap field="status" options={["lead", "active", "inactive", "graduated", "suspended"]} /></Field>
          </div>
        </section>

        {/* SECTION IV */}
        <section>
          <h3 className="font-headline text-xl uppercase tracking-tighter border-b-4 border-foreground pb-2 mb-5">IV. Fee & Financial Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Total Fee (₹)"><Input type="number" value={form.total_fee || ""} onChange={fn("total_fee")} className={cls} /></Field>
            <Field label="Fee Paid (₹)"><Input type="number" value={form.fee_paid || ""} onChange={fn("fee_paid")} className={cls} /></Field>
            <div className="bg-foreground text-background p-4 shadow-[4px_4px_0px_0px_#1a1410] flex flex-col justify-center items-center text-center">
              <span className="font-sans font-bold uppercase tracking-widest text-[10px] opacity-70">Balance Due</span>
              <span className="text-2xl font-headline mt-1">{inr(Number(form.total_fee ?? 0) - Number(form.fee_paid ?? 0))}</span>
            </div>
          </div>
        </section>

        {/* SECTION V */}
        <section>
          <h3 className="font-headline text-xl uppercase tracking-tighter border-b-4 border-foreground pb-2 mb-5">V. Admissions Source & Notes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Lead Source"><SelWrap field="lead_source" options={["Website", "Walk-in", "Referral", "Social Media", "Counsellor", "Education Fair", "Partner College", "WhatsApp"]} /></Field>
            <Field label="Assigned Counsellor (Lead Allocation)" required>
              <Select value={form.counsellor_name || ""} onValueChange={fs("counsellor_name")}>
                <SelectTrigger className={trigCls}><SelectValue placeholder="Assign Staff" /></SelectTrigger>
                <SelectContent className={selCls}>
                  {staffList.map(s => <SelectItem key={s.email} value={s.email} className={selItemCls}>{s.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Referral Name"><Input value={form.referral_name || ""} onChange={f("referral_name")} className={cls} /></Field>
          </div>
          <div className="mt-4">
            <Field label="Internal Notes">
              <Textarea value={form.notes || ""} onChange={f("notes")} rows={3} placeholder="Any special notes about this student…" className={`${cls} resize-y`} />
            </Field>
          </div>
        </section>

        {/* SECTION VI */}
        <section>
          <h3 className="font-headline text-xl uppercase tracking-tighter border-b-4 border-foreground pb-2 mb-5">VI. Document Archive</h3>
          <p className="text-xs font-serif-news italic mb-4 text-[#6b3e1a]">Click each tile to mark a document as verified and received.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { key: "doc_photo", label: "Passport Photo", required: true },
              { key: "doc_id_proof", label: "Aadhaar Card", required: true },
              { key: "doc_marksheet_10", label: "10th Marksheet", required: true },
              { key: "doc_marksheet_12", label: "12th Marksheet", required: form.program === "12th Arts" || form.program === "12th Commerce" || form.program === "12th Science" || (form.program as any) === "MBA" || (form.program as any) === "MCA" },
              { key: "doc_marksheet_degree", label: "Degree Marksheet", required: (form.program as any) === "MBA" || (form.program as any) === "MCA" },
              { key: "doc_signature", label: "Signature" },
            ].map(doc => {
              const uploaded = form[doc.key as keyof Student] as boolean;
              return (
                <div
                  key={doc.key}
                  onClick={fdoc(doc.key as keyof Student)}
                  className={`border-4 border-foreground p-3 cursor-pointer transition-all select-none flex flex-col items-center justify-center text-center gap-2 min-h-[100px] ${uploaded ? "bg-foreground text-background shadow-[4px_4px_0px_0px_#6b3e1a]" : "bg-transparent hover:bg-black/5"} ${doc.required && !uploaded ? "border-red-500/50" : ""}`}
                >
                  {uploaded ? <CheckCircle className="w-7 h-7" /> : <Upload className="w-7 h-7 opacity-50" />}
                  <span className="font-sans font-bold uppercase tracking-widest text-[9px] leading-tight">{doc.label}{doc.required && <span className="text-red-500 ml-1">*</span>}</span>
                  <span className={`text-[8px] border-t pt-1.5 w-full ${uploaded ? "border-background/30 opacity-70" : "border-foreground/20 text-muted-foreground"}`}>
                    {uploaded ? "VERIFIED ✓" : "MANDATORY"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="sticky bottom-0 bg-[#fbf6e7] border-t-4 border-foreground py-4 flex flex-col sm:flex-row justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy} className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] hover:bg-foreground hover:text-background h-12 px-8">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={busy || !form.doc_photo || !form.doc_id_proof || !form.doc_marksheet_10} 
            className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] bg-foreground text-background hover:bg-background hover:text-foreground h-12 px-10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Saving…" : (!form.doc_photo || !form.doc_id_proof || !form.doc_marksheet_10) ? "Upload Mandatory Docs" : student ? "Commit Modifications" : "Archive New Student"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

/* ----------------------- SETTINGS / ACCESS ----------------------- */

const STUDENT_TEMPLATE = `1. Course: 
2. Specilisation:  and Management
3. Full Name (as per sslc): 
4. Father Name: 
5. Mother Name: 
6. DOB: 
7. Gender: 
8. Category (Gen/OBC/SC/ST/Other): OBC
9. Employment Status: 
10. Marital Status: 
11. Religion: 
12. Aadhaar Number: 
13. ABC ID: 
14. DEB ID: 
15. Address: . 
16. Pincode: 590006
17. City: Belagavi
18. District: Belagavi
19. State: Karnataka
20. Email: 
21. Mobile: 

Education Details

1. 10th Board Name, Year of Paasing, Marks, Percentage, Result: 

2. 12th Board Name (Diploma), Year of Paasing, Marks, Percentage, Result:

3. Degree University, Year of Passing, Consolidated Marks, Consolidated Percentage, Result:`;

/* ----------------------- SETTINGS TAB (ADMIN CENTRE) ----------------------- */

const ROLES = [
  { value: "admin", label: "Admin", desc: "Full access � sees all leads, assigns staff, approves enrollment" },
  { value: "center", label: "Center", desc: "Admission entry only � add students & upload documents" },
  { value: "staff", label: "Staff", desc: "Assigned leads only � follow-up, notes & status updates" },
];

function SettingsTab() {
  const [email, setEmail] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState("center");
  const [busy, setBusy] = React.useState(false);
  const [members, setMembers] = React.useState<any[]>([]);

  const loadMembers = async () => {
    const { data } = await supabase.from("allowed_managers" as any).select("*").order("created_at", { ascending: false });
    if (data) setMembers(data);
  };

  React.useEffect(() => { loadMembers(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail === "ulfathai003@gmail.com") throw new Error("Master admin is permanently whitelisted.");
      const { error } = await supabase.from("allowed_managers" as any).upsert([{ email: cleanEmail, role: selectedRole }], { onConflict: "email" });
      if (error) throw error;
      toast.success(`${cleanEmail} invited as ${selectedRole.toUpperCase()}`);
      setEmail("");
      loadMembers();
    } catch (err: any) {
      toast.error(err.message);
    } finally { setBusy(false); }
  };

  const handleChangeRole = async (id: string, memberEmail: string, newRole: string) => {
    if (memberEmail.toLowerCase().trim() === "ulfathai003@gmail.com") return toast.error("Cannot change master admin role.");
    const { error } = await supabase.from("allowed_managers" as any).update({ role: newRole }).eq("id", id);
    if (error) toast.error("Role update failed");
    else { toast.success("Role updated to " + newRole); loadMembers(); }
  };

  const handleRevoke = async (id: string, memberEmail: string) => {
    if (memberEmail.toLowerCase().trim() === "ulfathai003@gmail.com") return toast.error("Cannot revoke master admin.");
    setBusy(true);
    try {
      const { error } = await supabase.from("allowed_managers" as any).delete().eq("id", id);
      if (error) throw error;
      toast.success("Access revoked");
      loadMembers();
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const roleColor: Record<string, string> = {
    admin: "bg-foreground text-background",
    center: "bg-[#6b3e1a] text-[#fbf6e7]",
    staff: "bg-foreground/20 text-foreground",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-foreground text-background border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_#6b3e1a] flex items-start gap-4">
        <ShieldCheck className="w-10 h-10 shrink-0 mt-1" />
        <div>
          <h2 className="font-headline text-3xl uppercase tracking-tight">Admin Centre</h2>
          <p className="text-sm font-serif-news italic mt-1 text-background/80">Only Prashant Bhai controls who can access this system and what role they have. Invite-only.</p>
        </div>
      </div>

      {/* Role Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLES.map(r => (
          <div key={r.value} className="p-4 border-4 border-foreground bg-[#fbf6e7] shadow-[4px_4px_0px_0px_#1a1410]">
            <div className={"inline-block px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-widest mb-2 " + (roleColor[r.value] || "")}>{r.label}</div>
            <p className="text-xs font-serif-news text-foreground/80">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Invite Form */}
      <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] p-6">
        <h3 className="font-headline text-xl uppercase tracking-tighter mb-5 border-b-2 border-foreground pb-2">Invite New Member</h3>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4">
          <Input type="email" placeholder="user@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="rounded-none border-4 border-foreground bg-transparent focus-visible:ring-0 h-12 shadow-[2px_2px_0px_0px_#1a1410] flex-1" />
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="rounded-none border-4 border-foreground bg-transparent h-12 font-sans font-bold uppercase tracking-widest text-[10px] w-40 shadow-[2px_2px_0px_0px_#1a1410]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
              {ROLES.map(r => <SelectItem key={r.value} value={r.value} className="font-sans font-bold uppercase tracking-widest text-[10px]">{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={busy} className="rounded-none border-4 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] bg-foreground text-background hover:bg-background hover:text-foreground h-12 shadow-[2px_2px_0px_0px_#1a1410] whitespace-nowrap">
            <ShieldCheck className="w-4 h-4 mr-2" /> Send Invite
          </Button>
        </form>
        <p className="text-xs font-serif-news italic text-[#6b3e1a] mt-3">User gets the assigned role automatically when they sign up or next log in.</p>
      </div>

      {/* Members Table */}
      <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-x-auto">
        <div className="p-4 bg-foreground text-background border-b-4 border-foreground">
          <h3 className="font-headline text-xl uppercase tracking-tighter">Team Members & Access Levels</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-foreground bg-foreground/5">
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Added On</Th>
              <Th className="text-right">Change Role / Revoke</Th>
            </tr>
          </thead>
          <tbody className="font-serif-news text-sm">
            <tr className="border-b-2 border-foreground/10 bg-foreground/5">
              <td className="p-4 font-bold">ulfathai003@gmail.com</td>
              <td className="p-4"><span className="inline-block px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-widest bg-foreground text-background">Admin � Master</span></td>
              <td className="p-4 text-muted-foreground text-xs">Permanent</td>
              <td className="p-4 text-right"><span className="text-[10px] italic text-muted-foreground">Permanent access</span></td>
            </tr>
            {members.map(m => (
              <tr key={m.id} className="border-b-2 border-foreground/10 hover:bg-black/5 transition-colors">
                <td className="p-4 font-bold">{m.email}</td>
                <td className="p-4">
                  <span className={"inline-block px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-widest " + (roleColor[m.role || "admin"] || "bg-foreground/20 text-foreground")}>
                    {m.role || "admin"}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground text-xs">{new Date(m.created_at).toLocaleDateString("en-IN")}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Select onValueChange={(val) => handleChangeRole(m.id, m.email, val)} defaultValue={m.role || "admin"}>
                      <SelectTrigger className="h-7 w-28 rounded-none border-2 border-foreground text-[9px] uppercase font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                        {ROLES.map(r => <SelectItem key={r.value} value={r.value} className="text-[9px] font-bold uppercase">{r.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => handleRevoke(m.id, m.email)} disabled={busy} className="h-7 rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[9px] text-destructive hover:bg-destructive hover:text-background">
                      Revoke
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground italic">No members invited yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------- ENQUIRIES TAB ----------------------- */

function EnquiriesTab() {
  const [leads, setLeads] = React.useState<Student[]>([]);
  const [staffList, setStaffList] = React.useState<any[]>([]);
  const [busy, setBusy] = React.useState(false);

  const loadData = async () => {
    setBusy(true);
    const [leadsRes, staffRes] = await Promise.all([
      supabase.from("students").select("*").eq("status", "lead").order("created_at", { ascending: false }),
      supabase.from("allowed_managers" as any).select("*"),
    ]);
    if (leadsRes.data) setLeads(leadsRes.data);
    if (staffRes.data) setStaffList(staffRes.data);
    setBusy(false);
  };

  React.useEffect(() => { loadData(); }, []);

  const handleAllocate = async (leadId: string, staffEmail: string) => {
    const { error } = await supabase.from("students").update({ counsellor_name: staffEmail }).eq("id", leadId);
    if (error) toast.error("Allocation failed");
    else { toast.success("Lead allocated to " + staffEmail); loadData(); }
  };

  const handleApprove = async (leadId: string) => {
    const { error } = await supabase.from("students").update({ status: "active" }).eq("id", leadId);
    if (error) toast.error("Conversion failed");
    else { toast.success("Lead converted to Active Student"); loadData(); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-hidden">
        <div className="p-4 bg-foreground text-background border-b-4 border-foreground flex items-center justify-between">
          <h2 className="font-headline text-2xl uppercase tracking-tighter">Inbound Website Enquiries</h2>
          <Button size="sm" onClick={loadData} disabled={busy} className="rounded-none border-2 border-background font-sans font-bold uppercase tracking-widest text-[10px] bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground">Refresh</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-foreground bg-foreground/5">
                <Th>Candidate</Th>
                <Th>Course Interest</Th>
                <Th>Assigned To</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="font-serif-news text-sm">
              {leads.map(lead => (
                <tr key={lead.id} className="border-b-2 border-foreground/10 hover:bg-black/5 transition-colors">
                  <td className="p-4">
                    <div className="font-bold">{lead.full_name}</div>
                    <div className="text-xs text-muted-foreground">{lead.email} | {lead.phone}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{lead.location}</div>
                  </td>
                  <td className="p-4 text-xs">
                    <div className="font-bold">{lead.university}</div>
                    <div>{lead.program}{lead.specialization ? " - " + lead.specialization : ""}</div>
                    <div className="italic text-muted-foreground mt-1 line-clamp-2">{lead.notes}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="border border-foreground rounded-none text-[9px] uppercase font-bold">
                      {lead.counsellor_name || "Unassigned"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <Select onValueChange={(val) => handleAllocate(lead.id, val)}>
                        <SelectTrigger className="h-8 w-36 rounded-none border-2 border-foreground text-[9px] uppercase font-bold">
                          <SelectValue placeholder="Allocate Staff" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                          {staffList.map(s => <SelectItem key={s.id} value={s.email} className="text-[9px] font-bold uppercase">{s.email}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => handleApprove(lead.id)} className="h-8 rounded-none border-2 border-foreground bg-foreground text-background text-[9px] font-bold uppercase hover:bg-background hover:text-foreground">Approve</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && !busy && (
                <tr><td colSpan={4} className="p-10 text-center italic text-muted-foreground">No pending inbound enquiries from the website.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
