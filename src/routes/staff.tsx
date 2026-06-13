import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, LogOut, PhoneCall, MessageSquare, History, CheckCheck, IndianRupee, Pencil, ChevronDown, ShieldCheck, Building, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { CrmShell, type CrmNavItem } from "@/components/crm/CrmShell";

const STAFF_NAV: CrmNavItem[] = [
  { value: "leads", label: "My Leads", icon: PhoneCall },
];
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/staff")({
  component: StaffDashboard,
});

type Student = Tables<"students">;

function StaffDashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Student[]>([]);
  const [search, setSearch] = useState("");

  const isMaster = user?.email?.toLowerCase() === "ulfathai003@gmail.com";

  // Master account (ulfathai003@gmail.com) can access every console.
  const allowed = role === "staff" || isMaster;

  useEffect(() => {
    if (!loading && (!user || !allowed)) {
      navigate({ to: "/login" });
    }
    loadLeads();
  }, [user, role, loading, allowed]);

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

  if (loading || !allowed) return <div className="grid place-items-center min-h-screen news-paper font-headline text-2xl">Validating Counsellor Access…</div>;

  return (
    <CrmShell
      brand="Staff Pipeline"
      roleLabel="Staff"
      email={user?.email || ""}
      nav={STAFF_NAV}
      active="leads"
      onSelect={() => {}}
      isMaster={isMaster}
      currentPortal="/staff"
      onSignOut={signOut}
    >
      <div className="mb-8">
        <p className="news-kicker">Assigned to you by Prashant Bhai</p>
        <h2 className="font-headline text-3xl md:text-4xl tracking-tight mt-1">Active Lead Pipeline</h2>
      </div>

      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Search leads by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-14 border-2 border-foreground rounded-none bg-white font-serif-news"
        />
      </div>

      <div className="grid gap-4">
          {filtered.length === 0 ? (
            <div className="p-20 text-center news-card border border-dashed border-foreground/30">
              <p className="font-serif-news uppercase tracking-widest text-foreground/30 text-sm">No assigned leads currently active.</p>
            </div>
          ) : filtered.map(lead => (
            <div key={lead.id} className="news-card p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[6px_6px_0px_0px_#1a1410]">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-headline text-2xl tracking-tight">{lead.full_name}</h3>
                  <Badge className="bg-foreground text-background rounded-none text-[10px] uppercase font-bold">{lead.program}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 text-sm font-serif-news text-[#6b3e1a] uppercase">
                  <span className="flex items-center gap-1"><PhoneCall className="w-3 h-3" /> {lead.phone}</span>
                  <span className="flex items-center gap-1 lowercase italic">{lead.email}</span>
                </div>
                {lead.notes && (
                  <div className="mt-4 p-3 bg-white border-l-4 border-foreground text-xs font-serif-news text-foreground/70">
                    <span className="font-bold block mb-1 uppercase">MOM / Last Note:</span>
                    {lead.notes}
                  </div>
                )}
              </div>

              <div className="flex gap-3 shrink-0">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="h-12 bg-foreground text-background rounded-none border-2 border-foreground hover:bg-background hover:text-foreground font-serif-news uppercase tracking-widest text-xs px-6 transition-all">
                      <MessageSquare className="w-4 h-4 mr-2" /> Log Interaction
                    </Button>
                  </DialogTrigger>
                  <InteractionDialog lead={lead} onSaved={() => { loadLeads(); }} />
                </Dialog>

                <Button variant="outline" className="h-12 border-2 border-foreground rounded-none font-serif-news uppercase tracking-widest text-xs px-6 hover:bg-foreground hover:text-background">
                  <History className="w-4 h-4 mr-2" /> History
                </Button>
              </div>
            </div>
          ))}
        </div>
    </CrmShell>
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
        notes: (lead.notes || "") + `\n[FOLLOWUP ${new Date().toLocaleDateString()}]: ${form.fee_negotiation}`,
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
            <input type="date" className="h-10 rounded-none border-2 border-blue-900 px-3 bg-white font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-blue-700">Negotiated Fee (Optional)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-blue-900" />
              <input type="number" placeholder="0.00" className="pl-10 h-10 w-full rounded-none border-2 border-blue-900 bg-white font-bold" />
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
