import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, LogOut, Plus, Upload, UserPlus, ClipboardList, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/center")({
  component: CenterDashboard,
});

type Student = Tables<"students">;

function CenterDashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || role !== "center")) {
      navigate({ to: "/login" });
    }
    load();
  }, [user, role, loading]);

  async function load() {
    if (!user) return;
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("counsellor_name", user.email)
      .neq("status", "lead")
      .order("created_at", { ascending: false });
    if (data) setStudents(data);
  }

  if (loading || role !== "center") return <div className="grid place-items-center min-h-screen">Loading Center Portal...</div>;

  return (
    <div className="min-h-screen bg-[#f4f4f4] font-sans">
      {/* Center Navbar */}
      <header className="bg-white border-b-2 border-black p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl uppercase tracking-tighter italic">
            <span className="bg-black text-white p-1"><GraduationCap /></span>
            EduConnect Partner
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase hidden md:block">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut} className="border-2 border-black rounded-none font-bold uppercase text-[10px]">
              <LogOut className="w-3 h-3 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Admission Desk</h1>
            <p className="text-muted-foreground font-medium uppercase text-xs mt-1">Regional Center Dashboard</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white rounded-none border-2 border-black hover:bg-white hover:text-black transition-all font-black uppercase italic px-8 h-12 shadow-[4px_4px_0px_0px_#000]">
                <UserPlus className="mr-2" /> New Student Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-none border-4 border-black p-0">
               {/* Reusing existing logic but isolated */}
               <div className="p-6 bg-black text-white">
                 <h2 className="text-2xl font-black uppercase italic">Create Admission Record</h2>
               </div>
               <AdmissionForm onClose={() => { setOpen(false); load(); }} centerEmail={user?.email || ""} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6">
            <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" /> Recent Submissions
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-4 border-black text-xs uppercase font-black">
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Program</th>
                    <th className="pb-3">Doc Status</th>
                    <th className="pb-3 text-right">Admission Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {students.length === 0 ? (
                    <tr><td colSpan={4} className="py-10 text-center font-bold text-muted-foreground uppercase text-xs italic">No admissions entered yet.</td></tr>
                  ) : students.map((s) => (
                    <tr key={s.id} className="group hover:bg-black/[0.02]">
                      <td className="py-4">
                        <div className="font-black uppercase text-sm">{s.full_name}</div>
                        <div className="text-[10px] font-bold text-muted-foreground">{s.email}</div>
                      </td>
                      <td className="py-4 font-bold text-xs uppercase">{s.program}</td>
                      <td className="py-4">
                        <div className="flex gap-1">
                          {s.doc_photo && <Badge className="bg-green-100 text-green-800 rounded-none text-[8px] border border-green-800">PHOTO</Badge>}
                          {s.doc_id_proof && <Badge className="bg-green-100 text-green-800 rounded-none text-[8px] border border-green-800">ID</Badge>}
                          {s.doc_marksheet_10 && <Badge className="bg-green-100 text-green-800 rounded-none text-[8px] border border-green-800">10TH</Badge>}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <Badge className={`rounded-none font-black uppercase text-[10px] py-1 border-2 border-black ${s.status === 'active' ? 'bg-green-400 text-black' : 'bg-yellow-300 text-black'}`}>
                          {s.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1 inline" /> : null}
                          {s.status === 'active' ? 'Approved' : 'Pending Approval'}
                        </Badge>
                        {s.enrollment_number && <div className="text-[9px] font-black mt-1">ID: {s.enrollment_number}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AdmissionForm({ onClose, centerEmail }: { onClose: () => void, centerEmail: string }) {
  const [form, setForm] = useState<any>({
    full_name: "", email: "", phone: "", program: "BBA", university: "",
    doc_photo: false, doc_id_proof: false, doc_marksheet_10: false, counsellor_name: centerEmail
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.doc_photo || !form.doc_id_proof || !form.doc_marksheet_10) {
      return toast.error("All mandatory documents must be checked (uploaded)");
    }
    setBusy(true);
    const { error } = await supabase.from("students").insert([{ ...form, status: "active" }]); // Admission is usually pending initially but status handled by RLS/Trigger
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Admission entry submitted successfully!");
      onClose();
    }
  };

  return (
    <form onSubmit={submit} className="p-8 space-y-8 bg-[#f9f9f9]">
      <section className="space-y-4">
        <h3 className="font-bold uppercase text-xs border-b-2 border-black pb-1">Mandatory Document Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { k: 'doc_photo', l: 'Student Photograph' },
            { k: 'doc_id_proof', l: 'Aadhaar Card' },
            { k: 'doc_marksheet_10', l: '10th Marksheet' }
          ].map(doc => (
            <div 
              key={doc.k}
              onClick={() => setForm({ ...form, [doc.k]: !form[doc.k] })}
              className={`p-4 border-2 cursor-pointer transition-all ${form[doc.k] ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]' : 'bg-white border-black/20 hover:border-black'}`}
            >
              <div className="font-black uppercase text-[10px]">{doc.l}</div>
              <div className="text-[8px] mt-2 font-bold">{form[doc.k] ? '✓ UPLOADED' : '+ CLICK TO UPLOAD'}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground">Full Name</label>
          <input required className="w-full h-12 px-4 border-2 border-black rounded-none focus:bg-yellow-50 outline-none font-bold uppercase transition-colors" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground">Email Address</label>
          <input type="email" required className="w-full h-12 px-4 border-2 border-black rounded-none focus:bg-yellow-50 outline-none font-bold transition-colors" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground">Phone Number</label>
          <input required className="w-full h-12 px-4 border-2 border-black rounded-none focus:bg-yellow-50 outline-none font-bold transition-colors" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground">Desired Program</label>
          <select className="w-full h-12 px-4 border-2 border-black rounded-none focus:bg-yellow-50 outline-none font-bold uppercase transition-colors appearance-none" value={form.program} onChange={e => setForm({...form, program: e.target.value})}>
            {["BBA", "MBA", "BCA", "MCA", "B.Com", "M.Com", "10th", "12th"].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </section>

      <Button disabled={busy} type="submit" className="w-full h-14 bg-black text-white hover:bg-white hover:text-black border-2 border-black rounded-none font-black uppercase text-lg transition-all shadow-[6px_6px_0px_0px_#ffd700]">
        {busy ? "Processing Enrollment..." : "Finalize Admission Entry"}
      </Button>
    </form>
  );
}
