import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { 
  GraduationCap, 
  Plus, 
  Upload, 
  UserPlus, 
  ClipboardList, 
  CheckCircle, 
  Search, 
  LayoutDashboard, 
  CreditCard, 
  History, 
  Filter,
  Eye,
  AlertCircle,
  FileText,
  BadgeIndianRupee,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const Route = createFileRoute("/center")({
  component: CenterDashboardPage,
});

type Student = Tables<"students"> & { payments?: any[] };

function CenterDashboardPage() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || role !== "center")) {
      navigate({ to: "/login" });
    }
    if (user) loadData();
  }, [user, role, loading]);

  async function loadData() {
    setFetching(true);
    const { data: studentsData } = await supabase
      .from("students")
      .select("*, payments:fee_payments(*)")
      .eq("counsellor_name", user?.email)
      .neq("status", "lead")
      .order("created_at", { ascending: false });
    
    if (studentsData) setStudents(studentsData);
    setFetching(false);
  }

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.full_name.toLowerCase().includes(search.toLowerCase()) || 
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone || "").includes(search)
    );
  }, [students, search]);

  const stats = useMemo(() => {
    return {
      total: students.length,
      pendingApproval: students.filter(s => s.status === 'inactive').length,
      approved: students.filter(s => s.status === 'active').length,
      feePending: students.filter(s => (s.fee_pending || 0) > 0).length,
      enrollmentPending: students.filter(s => !s.enrollment_number).length,
      enrollmentAssigned: students.filter(s => !!s.enrollment_number).length,
    };
  }, [students]);

  if (loading || role !== "center") {
    return <div className="grid place-items-center min-h-screen bg-[#f8f9fc] font-bold text-slate-400 animate-pulse">Initializing Center Workspace...</div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-6">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic text-black">Center Operations</h1>
            <p className="text-black/60 font-bold uppercase text-[10px] tracking-widest mt-1 ml-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> Live Admissions Desk · {user?.email}
            </p>
          </div>
          
          <div className="flex gap-2">
            <NewStudentDialog onSaved={loadData} centerEmail={user?.email || ""} />
            <NewPaymentDialog students={students.filter(s => s.status === 'active')} onSaved={loadData} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b-2 border-black/10 w-full justify-start p-0 h-auto gap-1 mb-8 overflow-x-auto overflow-y-hidden">
            <TabTrigger value="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <TabTrigger value="tracking" icon={ClipboardList} label="Status Tracking" />
            <TabTrigger value="records" icon={FileText} label="Student Records" />
            <TabTrigger value="payments" icon={History} label="Payment History" />
          </TabsList>

          {/* 1. DASHBOARD MODULE */}
          <TabsContent value="dashboard" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <KPI label="Total Submitted" value={stats.total} icon={Users} color="bg-blue-50" />
              <KPI label="Pending Approval" value={stats.pendingApproval} icon={AlertCircle} color="bg-amber-50" sublabel="Waiting for Prashant Bhai" />
              <KPI label="Approved Students" value={stats.approved} icon={CheckCircle} color="bg-emerald-50" />
              <KPI label="Fee Pending" value={stats.feePending} icon={BadgeIndianRupee} color="bg-red-50" />
              <KPI label="Enrollment Pending" value={stats.enrollmentPending} icon={AlertCircle} color="bg-slate-50" />
              <KPI label="Enrollment Assigned" value={stats.enrollmentAssigned} icon={GraduationCap} color="bg-purple-50" />
            </div>

            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000]">
              <h3 className="font-black uppercase italic text-xl mb-6 border-b-2 border-black/10 pb-2">Recent Notifications</h3>
              <div className="space-y-4">
                {stats.pendingApproval > 0 && (
                  <div className="flex items-center gap-4 p-4 bg-amber-50 border-2 border-amber-900/10 font-bold text-amber-900">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>You have {stats.pendingApproval} students awaiting verification from Prashant Bhai.</span>
                  </div>
                )}
                {stats.feePending > 0 && (
                  <div className="flex items-center gap-4 p-4 bg-red-50 border-2 border-red-900/10 font-bold text-red-900">
                    <BadgeIndianRupee className="w-5 h-5 shrink-0" />
                    <span>{stats.feePending} students have pending fee payments.</span>
                  </div>
                )}
                {stats.total === 0 && (
                  <div className="p-12 text-center text-slate-400 font-bold italic uppercase border-2 border-dashed border-slate-200">
                    No recent activity to display.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 4. STUDENT STATUS TRACKING MODULE */}
          <TabsContent value="tracking" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black text-white text-[10px] uppercase font-black tracking-widest">
                      <th className="p-4">Student</th>
                      <th className="p-4">University/Course</th>
                      <th className="p-4">Current Status</th>
                      <th className="p-4">Fee Status</th>
                      <th className="p-4">Enrollment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black/5">
                    {fetching ? (
                       <tr><td colSpan={5} className="p-20 text-center font-bold text-slate-300 animate-pulse">FETCHING RECORDS...</td></tr>
                    ) : students.length === 0 ? (
                      <tr><td colSpan={5} className="p-20 text-center font-bold text-slate-400 uppercase italic">No students in your tracking list.</td></tr>
                    ) : students.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-black uppercase text-sm">{s.full_name}</div>
                          <div className="text-[10px] font-bold text-slate-400">{s.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[10px] uppercase">{s.university}</div>
                          <div className="font-black text-xs text-blue-600 uppercase italic">{s.program} · {s.specialization}</div>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="p-4">
                          <FeeBadge pending={Number(s.fee_pending || 0)} />
                        </td>
                        <td className="p-4">
                          {s.enrollment_number ? (
                            <div className="bg-black text-white px-2 py-1 text-[10px] font-black inline-block uppercase italic">
                              {s.enrollment_number}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 uppercase italic">Pending Assign</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* 6. STUDENT RECORDS MODULE (Search/Filter) */}
          <TabsContent value="records" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search by name, email, phone..." 
                  className="pl-12 h-14 border-4 border-black rounded-none font-black uppercase text-xs focus:ring-0 focus:border-blue-600"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Button className="h-14 bg-white border-4 border-black text-black px-8 font-black uppercase italic rounded-none hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_#000]">
                <Filter className="w-4 h-4 mr-2" /> Filter Registry
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map(s => (
                <div key={s.id} className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_#000] group hover:-translate-y-1 transition-transform">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-black text-white grid place-items-center font-black italic">
                      {s.full_name.charAt(0)}
                    </div>
                    {s.status === 'active' && <CheckCircle className="text-emerald-500 w-5 h-5" />}
                  </div>
                  <h4 className="font-black uppercase text-lg leading-tight">{s.full_name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">{s.email}</p>
                  
                  <div className="space-y-2 border-t-2 border-slate-100 pt-4">
                    <RecordRow label="Program" value={s.program} />
                    <RecordRow label="University" value={s.university} />
                    <RecordRow label="Enrollment" value={s.enrollment_number || "NOT ASSIGNED"} />
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <div className="col-span-full p-20 text-center font-bold text-slate-400 text-xl uppercase italic">No records found.</div>
              )}
            </div>
          </TabsContent>

          {/* 7. PAYMENT HISTORY MODULE */}
          <TabsContent value="payments" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]">
               <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b-4 border-black text-[10px] uppercase font-black">
                      <th className="p-4">Date</th>
                      <th className="p-4">Student</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">UTR Number</th>
                      <th className="p-4">Proof</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black/5">
                    {students.flatMap(s => (s.payments || []).map(p => ({ ...p, studentName: s.full_name, studentEmail: s.email }))).length === 0 ? (
                      <tr><td colSpan={6} className="p-20 text-center font-bold text-slate-400 uppercase italic">No payment history recorded.</td></tr>
                    ) : students.flatMap(s => (s.payments || []).map(p => ({ ...p, studentName: s.full_name, studentEmail: s.email })))
                        .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                        .map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-xs">{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td className="p-4">
                          <div className="font-black text-xs uppercase">{p.studentName}</div>
                          <div className="text-[10px] text-slate-400">{p.studentEmail}</div>
                        </td>
                        <td className="p-4 font-black text-sm">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                        <td className="p-4 font-mono text-[10px] font-bold">{p.transaction_ref || p.utr_number || "—"}</td>
                        <td className="p-4">
                          {p.screenshot_url ? (
                            <a href={p.screenshot_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold text-[10px] flex items-center gap-1">
                              <Eye className="w-3 h-3" /> View Proof
                            </a>
                          ) : <span className="text-slate-300 italic text-[10px]">No Link</span>}
                        </td>
                        <td className="p-4">
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-500/20 rounded-none text-[8px] font-black uppercase">Verified</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

{/* HELPER COMPONENTS */}

function TabTrigger({ value, icon: Icon, label }: { value: string; icon: any; label: string }) {
  return (
    <TabsTrigger 
      value={value} 
      className="rounded-none border-b-4 border-transparent data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white px-6 py-3 font-black uppercase italic text-xs flex items-center gap-2 transition-all"
    >
      <Icon className="w-4 h-4" /> {label}
    </TabsTrigger>
  );
}

function KPI({ label, value, icon: Icon, color, sublabel }: { label: string; value: number; icon: any; color: string; sublabel?: string }) {
  return (
    <div className={`${color} border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between min-h-[140px]`}>
      <div className="flex justify-between items-start">
        <h4 className="font-black uppercase text-[10px] tracking-widest text-black/60">{label}</h4>
        <Icon className="w-5 h-5 text-black/40" />
      </div>
      <div>
        <div className="text-5xl font-black italic tracking-tighter">{value}</div>
        {sublabel && <div className="text-[10px] font-bold mt-1 text-black/40 uppercase">{sublabel}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string, color: string }> = {
    active: { label: "Approved", color: "bg-emerald-100 text-emerald-800 border-emerald-800/10" },
    inactive: { label: "Pending Approval", color: "bg-amber-100 text-amber-800 border-amber-800/10" },
    graduated: { label: "Completed", color: "bg-blue-100 text-blue-800 border-blue-800/10" },
    lead: { label: "Enquiry", color: "bg-slate-100 text-slate-800 border-slate-800/10" },
  };
  const c = cfg[status] || { label: status, color: "bg-slate-100" };
  return (
    <Badge className={`${c.color} rounded-none border text-[9px] font-black uppercase tracking-widest px-2 py-0.5`}>
      {c.label}
    </Badge>
  );
}

function FeeBadge({ pending }: { pending: number }) {
  if (pending <= 0) return <Badge className="bg-emerald-500 text-white rounded-none text-[8px] font-black uppercase">Paid Full</Badge>;
  return (
    <div className="text-red-600 font-black text-xs">
      ₹{pending.toLocaleString('en-IN')} <span className="text-[8px] uppercase opacity-50 block -mt-1">Pending</span>
    </div>
  );
}

function RecordRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between text-[10px]">
      <span className="font-bold text-slate-400 capitalize">{label}:</span>
      <span className="font-black uppercase text-black">{value}</span>
    </div>
  );
}

const UNIVERSITIES = ["Mangalayatan University", "Manipal University", "Amity University", "NMIMS", "IGNOU", "LPU"];
const PROGRAMS = ["BBA", "MBA", "BCA", "MCA", "B.Com", "M.Com", "10th", "12th Arts", "12th Commerce", "12th Science"];
const BOARDS = [
  "CBSE", "ICSE", "NIOS", 
  "Karnataka State Board", 
  "Maharashtra State Board", 
  "UP Board", 
  "Other"
];

{/* 2. STUDENT ADMISSION ENTRY DIALOG */}
function NewStudentDialog({ onSaved, centerEmail }: { onSaved: () => void, centerEmail: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<any>({
    full_name: "", email: "", phone: "", university: UNIVERSITIES[0], 
    program: PROGRAMS[0], specialization: "", aadhar_number: "",
    edu_10_board: BOARDS[0], edu_12_board: BOARDS[0],
    doc_photo: false, doc_id_proof: false, doc_marksheet_10: false, doc_marksheet_12: false
  });

  const canSubmit = form.doc_photo && form.doc_id_proof && form.doc_marksheet_10 && form.full_name && form.email && form.phone;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return toast.error("Missing mandatory fields or documents");
    
    setBusy(true);
    const { error } = await supabase.from("students").insert([{ 
      ...form, 
      status: "inactive", 
      counsellor_name: centerEmail,
      batch_year: 2026,
      location: "Center Entry",
      total_fee: form.program.includes("MBA") ? 75000 : 45000, // Example default
      fee_paid: 0,
      fee_pending: form.program.includes("MBA") ? 75000 : 45000
    }]);
    
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Student admission record created successfully!");
      setOpen(false);
      onSaved();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black text-white hover:bg-white hover:text-black border-4 border-black rounded-none font-black uppercase italic h-14 px-8 shadow-[4px_4px_0px_0px_#ffd700] transition-all">
          <UserPlus className="mr-2 w-5 h-5" /> New Admission Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-none border-8 border-black p-0">
        <div className="bg-black text-white p-6 sticky top-0 z-10">
          <h2 className="text-3xl font-black uppercase italic">Student Admission Intake</h2>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Center Portal · Mandatory Verification Required</p>
        </div>
        
        <form onSubmit={submit} className="p-8 space-y-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VField label="Student Full Name" required>
              <Input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="h-12 border-2 border-black rounded-none font-bold uppercase focus:ring-0" />
            </VField>
            <VField label="Active Mobile Number" required>
              <Input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="h-12 border-2 border-black rounded-none font-bold focus:ring-0" />
            </VField>
            <VField label="Email Address" required>
              <Input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="h-12 border-2 border-black rounded-none font-bold focus:ring-0" />
            </VField>
            <VField label="Aadhaar Number" required>
              <Input required value={form.aadhar_number} onChange={e => setForm({...form, aadhar_number: e.target.value})} className="h-12 border-2 border-black rounded-none font-bold focus:ring-0" />
            </VField>
            <VField label="Select University" required>
              <select value={form.university} onChange={e => setForm({...form, university: e.target.value})} className="w-full h-12 px-4 border-2 border-black rounded-none font-bold uppercase focus:ring-0 outline-none">
                {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </VField>
             <VField label="Select Course / Program" required>
              <select value={form.program} onChange={e => setForm({...form, program: e.target.value})} className="w-full h-12 px-4 border-2 border-black rounded-none font-bold uppercase focus:ring-0 outline-none">
                {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </VField>
            <VField label="10th Board Name" required>
              <select value={form.edu_10_board} onChange={e => setForm({...form, edu_10_board: e.target.value})} className="w-full h-12 px-4 border-2 border-black rounded-none font-bold uppercase focus:ring-0 outline-none">
                {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </VField>
            <VField label="12th Board Name (if applicable)" required>
              <select value={form.edu_12_board} onChange={e => setForm({...form, edu_12_board: e.target.value})} className="w-full h-12 px-4 border-2 border-black rounded-none font-bold uppercase focus:ring-0 outline-none">
                {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </VField>
          </div>

          <div className="space-y-4">
            <h3 className="font-black uppercase text-sm border-b-2 border-black mb-4">Mandatory Upload Verification</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <UploadBox label="Aadhaar Card" checked={form.doc_id_proof} onClick={() => setForm({...form, doc_id_proof: !form.doc_id_proof})} />
              <UploadBox label="Passport Photo" checked={form.doc_photo} onClick={() => setForm({...form, doc_photo: !form.doc_photo})} />
              <UploadBox label="10th Marks Card" checked={form.doc_marksheet_10} onClick={() => setForm({...form, doc_marksheet_10: !form.doc_marksheet_10})} />
              <UploadBox label="12th Marks Card" checked={form.doc_marksheet_12} onClick={() => setForm({...form, doc_marksheet_12: !form.doc_marksheet_12})} />
            </div>
            <p className="text-[10px] font-bold text-red-500 uppercase italic">* Admission button remains disabled until all files are verified.</p>
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={!canSubmit || busy} 
              className="w-full h-16 bg-black text-white rounded-none border-4 border-black font-black uppercase text-xl italic hover:bg-white hover:text-black transition-all shadow-[6px_6px_0px_0px_#ffd700] disabled:opacity-30"
            >
              {busy ? "COMMITTING TO REGISTRY..." : "FINALIZE STUDENT ADMISSION"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

{/* 3. PAYMENT ENTRY DIALOG */}
function NewPaymentDialog({ students, onSaved }: { students: Student[], onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ student_id: "", amount: "", utr_number: "", doc_proof: false });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id || !form.amount || !form.utr_number || !form.doc_proof) {
      return toast.error("All payment details and screenshot proof are mandatory");
    }

    setBusy(true);
    // 1. Check for duplicate UTR
    const { data: existing } = await supabase.from("fee_payments").select("id").eq("transaction_ref", form.utr_number).maybeSingle();
    if (existing) {
      setBusy(false);
      return toast.error("Duplicate UTR Number detected! This transaction already exists.");
    }

    // 2. Record payment
    const { error: payError } = await supabase.from("fee_payments").insert([{
      student_id: form.student_id,
      amount: Number(form.amount),
      transaction_ref: form.utr_number,
      payment_date: new Date().toISOString(),
      payment_mode: "UPI/Bank Transfer",
      notes: "Center Payment Entry",
      receipt_number: `CTR-${Date.now()}`
    }]);

    if (payError) {
      setBusy(false);
      return toast.error(payError.message);
    }

    // 3. Update student balance (simpler than trigger for now)
    const s = students.find(x => x.id === form.student_id);
    if (s) {
      const newPaid = Number(s.fee_paid || 0) + Number(form.amount);
      const newPending = Math.max(0, Number(s.total_fee || 0) - newPaid);
      await supabase.from("students").update({ 
        fee_paid: newPaid, 
        fee_pending: newPending,
        payment_status: newPending === 0 ? 'Paid' : 'Partial'
      }).eq("id", s.id);
    }

    setBusy(false);
    toast.success("Payment recorded and verified!");
    setOpen(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-14 border-4 border-black rounded-none font-black uppercase italic px-8 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_#000]">
          <BadgeIndianRupee className="mr-2 w-5 h-5" /> Record Payment Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-none border-8 border-black p-0">
        <div className="bg-blue-600 text-white p-6">
          <h2 className="text-3xl font-black uppercase italic">Payment Collection</h2>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Verify UTR & Amount with Precision</p>
        </div>

        <form onSubmit={submit} className="p-8 space-y-6">
          <VField label="Select Student" required>
            <select required value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} className="w-full h-12 px-4 border-2 border-black rounded-none font-bold uppercase focus:border-blue-600 outline-none">
              <option value="">— CHOOSE STUDENT —</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.program})</option>)}
            </select>
          </VField>

          <div className="grid grid-cols-2 gap-4">
            <VField label="Amount Paid (₹)" required>
              <Input type="number" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="h-12 border-2 border-black rounded-none font-bold focus:ring-0" placeholder="0.00" />
            </VField>
            <VField label="UTR / Transaction Number" required>
              <Input required value={form.utr_number} onChange={e => setForm({...form, utr_number: e.target.value})} className="h-12 border-2 border-black rounded-none font-bold focus:ring-0" placeholder="12-digit UTR" />
            </VField>
          </div>

          <div className="p-4 bg-slate-100 border-2 border-black/10">
            <label className="flex items-center gap-4 cursor-pointer" onClick={() => setForm({...form, doc_proof: !form.doc_proof})}>
              <div className={`w-8 h-8 rounded-none border-2 border-black flex items-center justify-center transition-all ${form.doc_proof ? 'bg-black text-white' : 'bg-white'}`}>
                {form.doc_proof ? '✓' : ''}
              </div>
              <div>
                <div className="font-black uppercase text-xs">Payment Screenshot Uploaded</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase italic">Confirm proof of transaction is clear</div>
              </div>
            </label>
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={busy} 
              className="w-full h-14 bg-blue-600 text-white rounded-none border-4 border-black font-black uppercase text-lg italic hover:bg-black transition-all shadow-[6px_6px_0px_0px_#000]"
            >
              {busy ? "VERIFYING UTR..." : "RECORD FINANCIAL TRANSACTION"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VField({ label, required, children }: { label: string, required?: boolean, children: any }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}

function UploadBox({ label, checked, onClick }: { label: string, checked: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`p-3 border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center h-24 ${checked ? 'bg-black text-white border-black' : 'border-black/20 hover:border-black'}`}
    >
      <Upload className={`w-4 h-4 mb-2 ${checked ? 'text-white' : 'text-black/40'}`} />
      <div className="font-black text-[9px] uppercase leading-tight">{label}</div>
      <div className="text-[7px] mt-1 font-bold tracking-widest">{checked ? '✓ VERIFIED' : '+ UPLOAD'}</div>
    </div>
  );
}
