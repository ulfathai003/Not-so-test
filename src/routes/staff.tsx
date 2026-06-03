import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, LogOut, PhoneCall, MessageSquare, History, CheckCheck, IndianRupee, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/staff")({
  component: StaffDashboard,
});

type Student = Tables<"students">;

function StaffDashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Student[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && (!user || role !== "staff")) {
      navigate({ to: "/login" });
    }
    loadLeads();
  }, [user, role, loading]);

  async function loadLeads() {
    if (!user) return;
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("counsellor_name", user.email)
      .eq("status", "lead")
      .order("created_at", { ascending: false });
    if (data) setLeads(data);
  }

  const filtered = leads.filter(l => 
    l.full_name.toLowerCase().includes(search.toLowerCase()) || 
    (l.phone || "").includes(search)
  );

  if (loading || role !== "staff") return <div className="grid place-items-center min-h-screen font-bold uppercase italic">Validating Counselor Access...</div>;

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-slate-900">
      {/* Staff Header */}
      <header className="bg-white border-b-4 border-blue-900 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-2xl uppercase tracking-tighter text-blue-900">
            <PhoneCall className="w-6 h-6" /> Counselor Desk
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-blue-900 text-white rounded-none hidden md:block">{user?.email}</Badge>
            <Button variant="ghost" onClick={signOut} className="font-bold uppercase text-[10px] hover:bg-red-50 text-red-600">
              <LogOut className="w-3 h-3 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-10">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-blue-950">Active Lead Pipeline</h1>
          <p className="text-blue-700 font-bold uppercase text-[10px] tracking-widest mt-2 bg-blue-100 inline-block px-2 py-0.5">Assigned to you by Prashant Bhai</p>
        </div>

        <div className="mb-6 flex gap-4">
          <Input 
            placeholder="Search leads by name or phone..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="h-14 border-2 border-blue-900 rounded-none bg-white font-bold"
          />
        </div>

        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <div className="p-20 text-center bg-white border-4 border-dashed border-blue-200">
              <p className="font-black uppercase text-blue-300 italic">No assigned leads currently active.</p>
            </div>
          ) : filtered.map(lead => (
            <div key={lead.id} className="bg-white border-4 border-blue-900 p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[8px_8px_0px_0px_rgba(30,58,138,1)]">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black uppercase italic tracking-tight">{lead.full_name}</h3>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-800 rounded-none text-[10px] uppercase font-bold">{lead.program}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-sm font-bold text-slate-500 uppercase">
                  <span className="flex items-center gap-1"><PhoneCall className="w-3 h-3" /> {lead.phone}</span>
                  <span className="flex items-center gap-1 lowercase font-medium italic">{lead.email}</span>
                </div>
                {lead.notes && (
                  <div className="mt-4 p-3 bg-slate-50 border-l-4 border-blue-400 text-xs font-medium text-slate-600">
                    <span className="font-bold block mb-1">MOM / Last Note:</span>
                    {lead.notes}
                  </div>
                )}
              </div>

              <div className="flex gap-3 shrink-0">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="h-12 bg-blue-900 text-white rounded-none border-2 border-blue-900 hover:bg-white hover:text-blue-900 font-black uppercase text-xs italic px-6 transition-all">
                      <MessageSquare className="w-4 h-4 mr-2" /> Log Interaction
                    </Button>
                  </DialogTrigger>
                  <InteractionDialog lead={lead} onSaved={() => { loadLeads(); }} />
                </Dialog>
                
                <Button variant="outline" className="h-12 border-2 border-blue-900 rounded-none font-black uppercase text-xs italic px-6 hover:bg-blue-50">
                  <History className="w-4 h-4 mr-2" /> History
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function InteractionDialog({ lead, onSaved }: { lead: Student, onSaved: () => void }) {
  const [form, setForm] = useState({ notes: lead.notes || "", fee_negotiation: "", follow_up_date: "" });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("students")
      .update({ 
        notes: form.notes + `\n[FOLLOWUP ${new Date().toLocaleDateString()}]: ${form.fee_negotiation}`,
        updated_at: new Date().toISOString()
      })
      .eq("id", lead.id);
    
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Interaction logged successfully!");
      onSaved();
    }
  };

  return (
    <DialogContent className="rounded-none border-4 border-blue-900 p-0 max-w-xl">
      <div className="p-4 bg-blue-900 text-white font-black uppercase italic text-lg">Update Lead Progress</div>
      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-blue-700">Follow-up Notes & Negotiation Details</label>
          <Textarea 
            placeholder="What did you discuss? What were the fee concerns?" 
            className="min-h-[120px] rounded-none border-2 border-blue-900 focus-visible:ring-0 font-medium"
            value={form.fee_negotiation}
            onChange={e => setForm({...form, fee_negotiation: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-blue-700">Next Follow-up Date</label>
            <Input type="date" className="h-10 rounded-none border-2 border-blue-900" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-blue-700">Negotiated Fee (Optional)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-blue-900" />
              <Input type="number" placeholder="0.00" className="pl-10 h-10 rounded-none border-2 border-blue-900" />
            </div>
          </div>
        </div>
        <Button disabled={busy} onClick={save} className="w-full h-12 bg-blue-900 text-white rounded-none border-2 border-blue-900 hover:bg-white hover:text-blue-900 font-black uppercase tracking-tighter font-lg transition-all shadow-[4px_4px_0px_0px_#60a5fa]">
          {busy ? "Saving Progress..." : "Commit Update to CRM"}
        </Button>
      </div>
    </DialogContent>
  );
}
