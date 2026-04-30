import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GraduationCap, LogOut, Plus, Search, ShieldCheck, Users, Pencil, Trash2, Filter, BookOpen, MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

const PROGRAMS = ["BBA", "MBA"] as const;
const STATUSES = ["active", "inactive", "graduated", "suspended"] as const;
const UNIVERSITIES = ["Jain University", "Manipal University", "Amity University", "NMIMS", "IGNOU", "LPU"];

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
      return [s.full_name, s.email, s.specialization, s.university, s.location].some((v) => v.toLowerCase().includes(q));
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
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All programs</SelectItem>
                <SelectItem value="BBA">BBA</SelectItem>
                <SelectItem value="MBA">MBA</SelectItem>
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
                <Th>Name</Th><Th>Program</Th><Th>Specialization</Th><Th>University</Th><Th>Batch</Th><Th>Location</Th><Th>Status</Th><Th></Th>
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

function StudentDialog({ editing, onSaved }: { editing: Student | null; onSaved: () => void }) {
  const [form, setForm] = useState<TablesInsert<"students">>(() => editing ?? {
    full_name: "", email: "", phone: "", batch_year: new Date().getFullYear() + 1,
    program: "MBA", specialization: "", university: "Jain University", location: "", status: "active",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm(editing);
  }, [editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      batch_year: Number(form.batch_year),
      phone: form.phone || null,
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
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{editing ? "Edit student" : "Add a new student"}</DialogTitle>
        <DialogDescription>Manual records for batches across years and specializations.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} required /></Field>
        <Field label="Email" required><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} required /></Field>
        <Field label="Phone"><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} /></Field>
        <Field label="Batch year" required><Input type="number" min={2020} max={2040} value={form.batch_year} onChange={(e) => setForm({ ...form, batch_year: Number(e.target.value) })} required /></Field>
        <Field label="Program" required>
          <Select value={form.program} onValueChange={(v) => setForm({ ...form, program: v as "BBA" | "MBA" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PROGRAMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Specialization" required><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} maxLength={100} required /></Field>
        <Field label="University" required>
          <Select value={form.university} onValueChange={(v) => setForm({ ...form, university: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{UNIVERSITIES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Location" required><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={120} required /></Field>
        <Field label="Status" required>
          <Select value={form.status ?? "active"} onValueChange={(v) => setForm({ ...form, status: v as Student["status"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <DialogFooter className="sm:col-span-2">
          <Button type="submit" disabled={saving} className="bg-gradient-hero shadow-glow">{saving ? "Saving…" : editing ? "Save changes" : "Add student"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
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
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">My learning</h1>
        <p className="text-muted-foreground mt-1">Your enrollment details and program info.</p>
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
      )}
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
