import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  GraduationCap, 
  PhoneCall, 
  MessageSquare, 
  History, 
  IndianRupee, 
  Search, 
  Clock, 
  Calendar,
  AlertCircle,
  Hash,
  Send,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const Route = createFileRoute("/staff")({
  component: StaffDashboard,
});

type Student = Tables<"students"> & { follow_ups?: any[] };

function StaffDashboard() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || role !== "staff")) {
      navigate({ to: "/login" });
    }
    if (user) loadLeads();
  }, [user, role, loading]);

  async function loadLeads() {
    setFetching(true);
    const { data } = await supabase
      .from("students")
      .select("*, follow_ups(*)")
      .eq("counsellor_name", user?.email)
      .eq("status", "lead")
      .order("updated_at", { ascending: false });
    if (data) setLeads(data);
    setFetching(false);
  }

  const filtered = leads.filter(l => 
    l.full_name.toLowerCase().includes(search.toLowerCase()) || 
    (l.phone || "").includes(search)
  );

  if (loading || role !== "staff") {
    return <div className="grid place-items-center min-h-screen bg-blue-50 font-black italic tracking-tighter text-blue-900 animate-pulse">Initializing Counselor Desk...</div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-blue-900 pb-6">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic text-blue-950">Counselor Desk</h1>
            <p className="text-blue-700/60 font-bold uppercase text-[10px] tracking-widest mt-1 ml-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span> Active Lead Pipeline · {user?.email}
            </p>
          </div>
          
          <div className="bg-blue-100 border-2 border-blue-900 px-4 py-2 flex items-center gap-3">
             <div className="text-xs font-black uppercase text-blue-900">Total Leads:</div>
             <div className="text-2xl font-black italic text-blue-950">{leads.length}</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-900 translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform"></div>
          <div className="relative bg-white border-4 border-blue-900 flex items-center">
            <Search className="ml-6 w-6 h-6 text-blue-900/30" />
            <input 
              placeholder="Search leads by name, phone or university expectations..." 
              className="w-full h-16 px-6 bg-transparent font-black uppercase text-sm focus:outline-none placeholder:text-blue-900/20"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Leads Grid */}
        <div className="grid gap-6">
          {fetching ? (
            <div className="p-20 text-center font-black uppercase text-blue-200 italic animate-pulse text-3xl">Synchronizing Pipeline...</div>
          ) : filtered.length === 0 ? (
            <div className="p-20 text-center bg-white border-4 border-dashed border-blue-200">
              <p className="font-black uppercase text-blue-300 italic">No assigned leads matching criteria.</p>
            </div>
          ) : filtered.map(lead => (
            <LeadCard key={lead.id} lead={lead} onUpdate={loadLeads} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function LeadCard({ lead, onUpdate }: { lead: Student, onUpdate: () => void }) {
  return (
    <div className="bg-white border-4 border-blue-900 p-8 flex flex-col md:flex-row justify-between items-start gap-8 shadow-[10px_10px_0px_0px_rgba(30,58,138,1)] hover:-translate-y-1 transition-transform relative overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 -mr-12 -mt-12 rounded-full border-4 border-blue-100"></div>
      
      <div className="flex-1 space-y-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-blue-950">{lead.full_name}</h3>
            <Badge className="bg-blue-900 text-white rounded-none text-[8px] font-black uppercase px-2 py-0.5">{lead.program}</Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] font-black text-blue-700/60 uppercase">
            <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {lead.phone}</span>
            <span className="flex items-center gap-1 italic lowercase font-bold">{lead.email}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Updated {new Date(lead.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-slate-50 border-l-4 border-blue-400 p-4">
             <div className="text-[8px] font-black uppercase text-blue-900/40 mb-1">Target University</div>
             <div className="text-xs font-black uppercase text-blue-900">{lead.university || "NOT SPECIFIED"}</div>
           </div>
           <div className="bg-slate-50 border-l-4 border-emerald-400 p-4">
             <div className="text-[8px] font-black uppercase text-emerald-900/40 mb-1">Negotiated Fee Level</div>
             <div className="text-xs font-black uppercase text-emerald-900">₹{Number(lead.total_fee || 0).toLocaleString()}</div>
           </div>
        </div>

        {lead.notes && (
          <div className="bg-blue-50/50 border-4 border-blue-900/5 p-4 rounded-none">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3 h-3 text-blue-900/40" />
              <span className="text-[9px] font-black uppercase text-blue-900/40 tracking-widest">Recent Activity Log</span>
            </div>
            <p className="text-xs font-bold text-blue-950 whitespace-pre-line border-l-2 border-blue-900/10 pl-3">
              {lead.notes.split('\n').filter(Boolean).slice(-2).join('\n')}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 shrink-0 w-full md:w-56 relative z-10">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-14 bg-blue-900 text-white rounded-none border-4 border-blue-900 hover:bg-white hover:text-blue-900 font-black uppercase text-xs italic transition-all shadow-[4px_4px_0px_0px_rgba(30,58,138,0.3)]">
              <MessageSquare className="w-4 h-4 mr-2" /> Log Negotiation
            </Button>
          </DialogTrigger>
          <NegotiationDialog lead={lead} onSaved={onUpdate} />
        </Dialog>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-14 border-4 border-blue-900 rounded-none font-black uppercase text-xs italic hover:bg-blue-50 transition-all">
              <History className="w-4 h-4 mr-2" /> Activity Timeline
            </Button>
          </DialogTrigger>
          <TimelineDialog lead={lead} />
        </Dialog>

        <div className="p-3 bg-blue-50 text-[9px] font-black uppercase text-blue-900/60 border-2 border-blue-900/10 text-center">
           Locked Module: Admissions
        </div>
      </div>
    </div>
  );
}

function NegotiationDialog({ lead, onSaved }: { lead: Student, onSaved: () => void }) {
  const [notes, setNotes] = useState("");
  const [fee, setFee] = useState(lead.total_fee?.toString() || "");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!notes.trim()) return toast.error("Notes are mandatory for tracking progress");
    setBusy(true);
    
    const timestamp = new Date().toLocaleString();
    const entry = `\n[ACTION ${timestamp}]: ${notes}`;
    
    // We update student notes and fee
    const { error } = await supabase
      .from("students")
      .update({ 
        notes: (lead.notes || "") + entry,
        total_fee: fee ? Number(fee) : lead.total_fee,
        updated_at: new Date().toISOString()
      })
      .eq("id", lead.id);
    
    // Also log in the follow_ups activity table. Don't fail the whole save if
    // this errors, but surface it instead of swallowing it silently.
    const { error: followErr } = await supabase.from("follow_ups").insert([{
      student_id: lead.id,
      notes: notes,
      follow_up_date: new Date().toISOString(),
      status: "lead"
    }]);
    if (followErr) console.warn("follow_ups log failed:", followErr.message);

    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Progress synchronized with Admin.");
      onSaved();
    }
  };

  return (
    <DialogContent className="rounded-none border-8 border-blue-900 p-0 max-w-xl bg-white">
      <div className="p-6 bg-blue-900 text-white flex justify-between items-center">
        <div>
          <h2 className="font-black uppercase italic text-2xl">Negotiation Desk</h2>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Lead: {lead.full_name}</p>
        </div>
        <PhoneCall className="w-10 h-10 text-white/20" />
      </div>
      
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-blue-700 tracking-widest">Call Notes & Negotiation Details</label>
          <Textarea 
            placeholder="Discussed courses? Fee issues? University doubts?" 
            className="min-h-[150px] rounded-none border-4 border-blue-900 focus-visible:ring-0 font-bold text-sm bg-blue-50/20"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-blue-700 tracking-widest">Target Fee (Negotiated)</label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-900" />
              <input 
                type="number" 
                placeholder="0.00" 
                className="pl-12 h-14 w-full rounded-none border-4 border-blue-900 bg-white font-black text-blue-900 focus:outline-none" 
                value={fee}
                onChange={e => setFee(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-blue-700 tracking-widest">Next Action Date</label>
            <input type="date" className="h-14 w-full rounded-none border-4 border-blue-900 px-4 bg-white font-black text-blue-900 focus:outline-none" />
          </div>
        </div>

        <Button 
          disabled={busy} 
          onClick={save} 
          className="w-full h-16 bg-blue-900 text-white rounded-none border-4 border-blue-900 hover:bg-white hover:text-blue-900 font-black uppercase text-xl italic transition-all shadow-[6px_6px_0px_0px_rgba(30,58,138,0.2)]"
        >
          {busy ? "SYNCING..." : "COMMIT UPDATE"}
        </Button>
      </div>
    </DialogContent>
  );
}

function TimelineDialog({ lead }: { lead: Student }) {
  const activities = (lead.notes || "").split('\n').filter(Boolean);
  
  return (
    <DialogContent className="rounded-none border-8 border-blue-900 p-0 max-w-2xl bg-white h-[80vh] flex flex-col">
      <div className="p-6 bg-blue-900 text-white">
        <h2 className="font-black uppercase italic text-2xl">Activity Timeline</h2>
        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Full Interaction History for {lead.full_name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {activities.length === 0 ? (
          <div className="text-center py-20 text-blue-200 font-black uppercase italic">No history recorded yet.</div>
        ) : activities.map((line, idx) => {
          const isAction = line.includes('[ACTION');
          return (
            <div key={idx} className="relative pl-10 border-l-4 border-blue-100 pb-2">
              <div className="absolute -left-[14px] top-0 w-6 h-6 bg-blue-900 border-4 border-white flex items-center justify-center">
                <div className="w-1 h-1 bg-white"></div>
              </div>
              <div className={isAction ? "bg-blue-50 p-4 border-2 border-blue-900/5 shadow-[4px_4px_0px_0px_rgba(30,58,138,0.05)]" : "p-2"}>
                <p className="text-xs font-bold text-blue-950 leading-relaxed">{line}</p>
              </div>
            </div>
          );
        })}
      </div>
    </DialogContent>
  );
}
