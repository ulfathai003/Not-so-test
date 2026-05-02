import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GraduationCap, LogOut, Plus, Search, ShieldCheck, Users, Pencil, Trash2, Filter, BookOpen, MapPin, Mail, Phone, User, Home, FileText, Wallet, FolderCheck, ClipboardList } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | EduConnect" }] }),
  component: DashboardPage,
});

type Student = Tables<"students">;
type ProgramType = Student["program"];

const PROGRAMS: ProgramType[] = ["10th", "12th Arts", "12th Commerce", "12th Science", "BBA", "MBA"];
const STATUSES = ["active", "inactive", "graduated", "suspended"] as const;
const UNIVERSITIES = ["Mangalayatan University", "Jain University", "Manipal University", "Amity University", "NMIMS", "IGNOU", "LPU"];
const GENDERS = ["Male", "Female", "Other"];
const CATEGORIES = ["General", "OBC", "SC", "ST", "Other"];
const EMPLOYMENT = ["Employed", "Unemployed", "Self-employed", "Student"];
const MARITAL = ["Single", "Married", "Divorced", "Widowed"];
const RESULTS = ["Pass", "Fail", "Distinction", "First Class", "Second Class"];
const SESSIONS = ["January", "July"];
const STUDY_MODES = ["Online", "Distance", "Hybrid"];
const MEDIUMS = ["English", "Hindi", "Bilingual"];
const PAYMENT_STATUSES = ["Paid", "Partial", "Pending", "Overdue"];
const PAYMENT_MODES = ["UPI", "Net Banking", "Card", "Cash", "Cheque", "EMI"];
const LEAD_SOURCES = ["Website", "Walk-in", "Referral", "Social Media", "Counsellor", "Education Fair"];

function DashboardPage() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-muted-foreground text-sm">Loading your dashboard…</div>
      </div>
    );
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
            <Badge variant="outline" className="capitalize border-primary/30 text-primary">
              {role === "admin" ? <><ShieldCheck className="w-3 h-3 mr-1" /> Admin</> : "Student"}
            </Badge>
            <span className="hidden sm:inline text-sm text-muted-foreground">{user.email}</span>
            <Button size="sm" variant="ghost" onClick={signOut}><LogOut className="w-4 h-4 mr-1" /> Sign out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {role === "admin" ? <AdminPanel /> : <StudentPanel email={user.email!} />}
      </main>
    </div>
  );
}

/* -------------------------- ADMIN -------------------------- */

function AdminPanel() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [editing, setEditing] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("students").select("*").order("batch_year", { ascending: false }).order("full_name");
    if (error) toast.error(error.message);
    setStudents(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const years = useMemo(() => Array.from(new Set(students.map((s) => s.batch_year))).sort((a, b) => b - a), [students]);

  const filtered = students.filter((s) => {
    if (program !== "all" && s.program !== program) return false;
    if (year !== "all" && String(s.batch_year) !== year) return false;
    if (search) {
      const q = search.toLowerCase();
      return [s.full_name, s.email, s.specialization, s.university, s.location].some((v) => (v ?? "").toLowerCase().includes(q));
    }
    return true;
  });

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
    bba: students.filter((s) => s.program === "BBA").length,
    mba: students.filter((s) => s.program === "MBA").length,
  };

  async function handleDelete(id: string) {
    if (!confirm("Delete this student? This cannot be undone.")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Student deleted");
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Admin panel</h1>
        <p className="text-muted-foreground mt-1">Manage every learner across programs, years and universities.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total students" value={stats.total} icon={Users} />
        <StatCard label="Active" value={stats.active} icon={ShieldCheck} />
        <StatCard label="BBA" value={stats.bba} icon={BookOpen} />
        <StatCard label="MBA" value={stats.mba} icon={GraduationCap} />
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search name, email, specialization…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={program} onValueChange={setProgram}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All programs</SelectItem>
                {PROGRAMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-hero shadow-glow"><Plus className="w-4 h-4 mr-1" /> Add student</Button>
            </DialogTrigger>
            <StudentDialog editing={editing} onSaved={() => { setDialogOpen(false); setEditing(null); load(); }} />
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <Th>Name</Th><Th>Program</Th><Th>Specialization</Th><Th>University</Th><Th>Batch</Th><Th>Location</Th><Th>Status</Th><Th>{" "}</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">No students match your filters.</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-4">
                    <div className="font-medium">{s.full_name}</div>
                    <div className="text-xs text-muted-foreground">{s.email}</div>
                  </td>
                  <td className="p-4"><Badge variant="outline">{s.program}</Badge></td>
                  <td className="p-4">{s.specialization}</td>
                  <td className="p-4 text-muted-foreground">{s.university}</td>
                  <td className="p-4">{s.batch_year}</td>
                  <td className="p-4 text-muted-foreground">{s.location}</td>
                  <td className="p-4"><StatusBadge status={s.status} /></td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setDialogOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="p-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">{children}</th>;
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <div className="bg-gradient-card border border-border rounded-2xl p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 text-3xl font-display font-bold text-gradient">{value}</div>
        </div>
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-primary/10 text-primary"><Icon className="w-5 h-5" /></span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Student["status"] }) {
  const map: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    inactive: "bg-muted text-muted-foreground border-border",
    graduated: "bg-primary/10 text-primary border-primary/30",
    suspended: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${map[status]}`}>{status}</span>;
}

/* -------------------------- DIALOG -------------------------- */

function blankForm(): TablesInsert<"students"> {
  return {
    full_name: "", email: "", phone: "",
    batch_year: new Date().getFullYear() + 1,
    program: "MBA", specialization: "", university: "Mangalayatan University",
    location: "", status: "active",
  };
}

function StudentDialog({ editing, onSaved }: { editing: Student | null; onSaved: () => void }) {
  const [form, setForm] = useState<TablesInsert<"students">>(() => editing ?? blankForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(editing ?? blankForm()); }, [editing]);

  function set<K extends keyof TablesInsert<"students">>(key: K, value: TablesInsert<"students">[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      batch_year: Number(form.batch_year),
      phone: form.phone || null,
      // Mirror location from city if location empty
      location: form.location || form.city || "—",
    };
    const { error } = editing
      ? await supabase.from("students").update(payload).eq("id", editing.id)
      : await supabase.from("students").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Student updated" : "Student added");
    onSaved();
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{editing ? "Edit student" : "Add a new student"}</DialogTitle>
        <DialogDescription>Complete enrollment record — personal details, address and education.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Tabs defaultValue="course" className="w-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full h-auto">
            <TabsTrigger value="course"><BookOpen className="w-4 h-4 mr-1.5" /> Course</TabsTrigger>
            <TabsTrigger value="enrollment"><ClipboardList className="w-4 h-4 mr-1.5" /> Enrollment</TabsTrigger>
            <TabsTrigger value="personal"><User className="w-4 h-4 mr-1.5" /> Personal</TabsTrigger>
            <TabsTrigger value="address"><Home className="w-4 h-4 mr-1.5" /> Address</TabsTrigger>
            <TabsTrigger value="education"><FileText className="w-4 h-4 mr-1.5" /> Education</TabsTrigger>
            <TabsTrigger value="fees"><Wallet className="w-4 h-4 mr-1.5" /> Fees</TabsTrigger>
            <TabsTrigger value="docs"><FolderCheck className="w-4 h-4 mr-1.5" /> Docs</TabsTrigger>
          </TabsList>

          {/* COURSE */}
          <TabsContent value="course" className="grid gap-4 sm:grid-cols-2 pt-4">
            <Field label="Course / Program" required>
              <Select value={form.program} onValueChange={(v) => set("program", v as ProgramType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROGRAMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Specialization" required>
              <Input value={form.specialization} onChange={(e) => set("specialization", e.target.value)} maxLength={100} placeholder="e.g. Finance and Management" required />
            </Field>
            <Field label="University" required>
              <Select value={form.university} onValueChange={(v) => set("university", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{UNIVERSITIES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Batch year" required>
              <Input type="number" min={2020} max={2040} value={form.batch_year} onChange={(e) => set("batch_year", Number(e.target.value))} required />
            </Field>
            <Field label="Status" required>
              <Select value={form.status ?? "active"} onValueChange={(v) => set("status", v as Student["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </TabsContent>

          {/* PERSONAL */}
          <TabsContent value="personal" className="grid gap-4 sm:grid-cols-2 pt-4">
            <Field label="Full name (as per SSLC)" required><Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} maxLength={120} required /></Field>
            <Field label="Father name"><Input value={form.father_name ?? ""} onChange={(e) => set("father_name", e.target.value)} maxLength={120} /></Field>
            <Field label="Mother name"><Input value={form.mother_name ?? ""} onChange={(e) => set("mother_name", e.target.value)} maxLength={120} /></Field>
            <Field label="Date of birth"><Input type="date" value={form.dob ?? ""} onChange={(e) => set("dob", e.target.value || null)} /></Field>
            <Field label="Gender">
              <Select value={form.gender ?? ""} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Category">
              <Select value={form.category ?? ""} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue placeholder="Gen / OBC / SC / ST / Other" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Employment status">
              <Select value={form.employment_status ?? ""} onValueChange={(v) => set("employment_status", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{EMPLOYMENT.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Marital status">
              <Select value={form.marital_status ?? ""} onValueChange={(v) => set("marital_status", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{MARITAL.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Religion"><Input value={form.religion ?? ""} onChange={(e) => set("religion", e.target.value)} maxLength={50} /></Field>
            <Field label="Aadhar number"><Input value={form.aadhar_number ?? ""} onChange={(e) => set("aadhar_number", e.target.value)} maxLength={20} /></Field>
            <Field label="ABC ID"><Input value={form.abc_id ?? ""} onChange={(e) => set("abc_id", e.target.value)} maxLength={30} /></Field>
            <Field label="DEB ID"><Input value={form.deb_id ?? ""} onChange={(e) => set("deb_id", e.target.value)} maxLength={30} /></Field>
            <Field label="Email" required><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={255} required /></Field>
            <Field label="Mobile"><Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} maxLength={20} /></Field>
          </TabsContent>

          {/* ADDRESS */}
          <TabsContent value="address" className="grid gap-4 sm:grid-cols-2 pt-4">
            <div className="sm:col-span-2"><Field label="Address"><Textarea value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} maxLength={500} rows={3} /></Field></div>
            <Field label="Pincode"><Input value={form.pincode ?? ""} onChange={(e) => set("pincode", e.target.value)} maxLength={10} /></Field>
            <Field label="City"><Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} maxLength={80} /></Field>
            <Field label="District"><Input value={form.district ?? ""} onChange={(e) => set("district", e.target.value)} maxLength={80} /></Field>
            <Field label="State"><Input value={form.state ?? ""} onChange={(e) => set("state", e.target.value)} maxLength={80} /></Field>
            <div className="sm:col-span-2"><Field label="Location (display)" required><Input value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={120} placeholder="City, State" required /></Field></div>
          </TabsContent>

          {/* EDUCATION */}
          <TabsContent value="education" className="space-y-6 pt-4">
            <EducationBlock title="10th Standard"
              board={form.edu_10_board} year={form.edu_10_year} marks={form.edu_10_marks}
              percentage={form.edu_10_percentage} result={form.edu_10_result}
              onChange={(field, val) => set(`edu_10_${field}` as keyof TablesInsert<"students">, val as never)}
            />
            <EducationBlock title="12th / Diploma"
              board={form.edu_12_board} year={form.edu_12_year} marks={form.edu_12_marks}
              percentage={form.edu_12_percentage} result={form.edu_12_result}
              onChange={(field, val) => set(`edu_12_${field}` as keyof TablesInsert<"students">, val as never)}
            />
            <EducationBlock title="Degree" universityField
              board={form.edu_degree_university} year={form.edu_degree_year} marks={form.edu_degree_marks}
              percentage={form.edu_degree_percentage} result={form.edu_degree_result}
              onChange={(field, val) => {
                const map = { board: "university", year: "year", marks: "marks", percentage: "percentage", result: "result" } as const;
                set(`edu_degree_${map[field]}` as keyof TablesInsert<"students">, val as never);
              }}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="submit" disabled={saving} className="bg-gradient-hero shadow-glow">{saving ? "Saving…" : editing ? "Save changes" : "Add student"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function EducationBlock({
  title, universityField, board, year, marks, percentage, result, onChange,
}: {
  title: string;
  universityField?: boolean;
  board: string | null | undefined;
  year: number | null | undefined;
  marks: string | null | undefined;
  percentage: number | null | undefined;
  result: string | null | undefined;
  onChange: (field: "board" | "year" | "marks" | "percentage" | "result", value: string | number | null) => void;
}) {
  return (
    <div className="rounded-xl border border-border p-4 bg-muted/20">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label={universityField ? "University" : "Board name"}>
          <Input value={board ?? ""} onChange={(e) => onChange("board", e.target.value)} maxLength={120} />
        </Field>
        <Field label="Year of passing">
          <Input type="number" min={1980} max={2040} value={year ?? ""} onChange={(e) => onChange("year", e.target.value ? Number(e.target.value) : null)} />
        </Field>
        <Field label={universityField ? "Consolidated marks" : "Marks"}>
          <Input value={marks ?? ""} onChange={(e) => onChange("marks", e.target.value)} maxLength={50} />
        </Field>
        <Field label={universityField ? "Consolidated %" : "Percentage"}>
          <Input type="number" step="0.01" min={0} max={100} value={percentage ?? ""} onChange={(e) => onChange("percentage", e.target.value ? Number(e.target.value) : null)} />
        </Field>
        <Field label="Result">
          <Select value={result ?? ""} onValueChange={(v) => onChange("result", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{RESULTS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
    </div>
  );
}

/* -------------------------- STUDENT -------------------------- */

function StudentPanel({ email }: { email: string }) {
  const [record, setRecord] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("students").select("*").eq("email", email).maybeSingle();
      setRecord(data);
      setLoading(false);
    })();
  }, [email]);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">My learning</h1>
        <p className="text-muted-foreground mt-1">Your enrollment details, personal info and academic history.</p>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">Loading your record…</div>
      ) : !record ? (
        <div className="bg-gradient-card border border-border rounded-2xl p-10 text-center shadow-card">
          <h3 className="font-display font-semibold text-xl">No enrollment found yet</h3>
          <p className="text-muted-foreground mt-2">Your account is created. Once an admin links your enrollment record, your program details will appear here.</p>
          <p className="text-xs text-muted-foreground mt-4">Signed in as <span className="font-medium">{email}</span></p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-card border border-border rounded-3xl p-8 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-wider text-muted-foreground">Enrolled in</div>
                <h2 className="text-3xl font-display font-bold mt-1">{record.program} · {record.specialization}</h2>
                <div className="text-muted-foreground mt-1">{record.university}</div>
              </div>
              <StatusBadge status={record.status} />
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Info icon={GraduationCap} label="Batch year" value={String(record.batch_year)} />
              <Info icon={BookOpen} label="Enrolled on" value={new Date(record.enrollment_date).toLocaleDateString()} />
              <Info icon={MapPin} label="Location" value={record.location} />
              <Info icon={Mail} label="Email" value={record.email} />
              {record.phone && <Info icon={Phone} label="Phone" value={record.phone} />}
            </div>
          </div>

          <DetailSection title="Personal details" rows={[
            ["Full name", record.full_name],
            ["Father name", record.father_name],
            ["Mother name", record.mother_name],
            ["Date of birth", record.dob],
            ["Gender", record.gender],
            ["Category", record.category],
            ["Employment", record.employment_status],
            ["Marital status", record.marital_status],
            ["Religion", record.religion],
            ["Aadhar", record.aadhar_number],
            ["ABC ID", record.abc_id],
            ["DEB ID", record.deb_id],
          ]} />

          <DetailSection title="Address" rows={[
            ["Address", record.address],
            ["City", record.city],
            ["District", record.district],
            ["State", record.state],
            ["Pincode", record.pincode],
          ]} />

          <DetailSection title="10th Standard" rows={[
            ["Board", record.edu_10_board],
            ["Year", record.edu_10_year],
            ["Marks", record.edu_10_marks],
            ["Percentage", record.edu_10_percentage],
            ["Result", record.edu_10_result],
          ]} />

          <DetailSection title="12th / Diploma" rows={[
            ["Board", record.edu_12_board],
            ["Year", record.edu_12_year],
            ["Marks", record.edu_12_marks],
            ["Percentage", record.edu_12_percentage],
            ["Result", record.edu_12_result],
          ]} />

          <DetailSection title="Degree" rows={[
            ["University", record.edu_degree_university],
            ["Year", record.edu_degree_year],
            ["Marks", record.edu_degree_marks],
            ["Percentage", record.edu_degree_percentage],
            ["Result", record.edu_degree_result],
          ]} />
        </div>
      )}
    </div>
  );
}

function DetailSection({ title, rows }: { title: string; rows: Array<[string, string | number | null | undefined]> }) {
  const hasAny = rows.some(([, v]) => v !== null && v !== undefined && v !== "");
  if (!hasAny) return null;
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
      <h3 className="font-display font-semibold text-lg mb-4">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="text-sm font-medium mt-0.5">{value ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-background/60 border border-border">
      <span className="grid place-items-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0"><Icon className="w-4 h-4" /></span>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium mt-0.5">{value}</div>
      </div>
    </div>
  );
}
