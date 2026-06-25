import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, PhoneCall, MessageSquare, Lock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export const Route = createFileRoute("/enquiries")({
  head: () => ({ meta: [{ title: "Enquiries | JoinOnline Education" }] }),
  component: EnquiriesPage,
});

type Student = Tables<"students">;

function EnquiriesPage() {
  const { role, user, loading } = useAuth();

  if (loading) {
    return <DashboardLayout><div className="font-serif-news italic text-sm">Loading enquiries…</div></DashboardLayout>;
  }

  if (role !== "super_admin" && role !== "admin" && role !== "staff") {
    return (
      <DashboardLayout>
        <div className="bg-[#fbf6e7] border-4 border-foreground p-20 text-center shadow-[6px_6px_0px_0px_#1a1410]">
          <Lock className="w-16 h-16 mx-auto mb-4 text-[#6b3e1a]" />
          <h2 className="font-headline text-3xl uppercase">Restricted</h2>
          <p className="font-serif-news text-sm italic mt-2 text-[#6b3e1a]">Only admin staff can access the enquiries desk.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {role === "staff" ? <StaffLeadPipeline userEmail={user?.email || ""} /> : <AdminInbox />}
    </DashboardLayout>
  );
}

/* -------------------------- ADMIN / SUPER ADMIN: full inbox -------------------------- */

function AdminInbox() {
  const [leads, setLeads] = useState<Student[]>([]);
  const [staff, setStaff] = useState<{ email: string; role: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    const [l, s] = await Promise.all([
      supabase.from("students").select("*").eq("status", "lead").order("created_at", { ascending: false }),
      supabase.from("allowed_managers" as any).select("email, role"),
    ]);
    if (l.data) setLeads(l.data as Student[]);
    if (s.data) setStaff(s.data as any);
    setBusy(false);
  };
  useEffect(() => { load(); }, []);

  const allocate = async (id: string, email: string) => {
    const { error } = await supabase.from("students").update({ counsellor_name: email }).eq("id", id);
    if (error) toast.error("Failed to allocate");
    else { toast.success("Lead assigned to " + email); load(); }
  };

  const convert = async (id: string) => {
    const { error } = await supabase.from("students").update({ status: "inactive" }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Converted to applicant — now awaiting approval."); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="border-b-4 border-foreground pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-4xl uppercase tracking-tight">Student Intake Enquiries</h1>
          <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Inbound website &amp; admission-desk leads awaiting routing.</p>
        </div>
        <Button onClick={load} variant="outline" className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-wider text-[10px]">Refresh</Button>
      </div>

      <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-x-auto">
        <table className="w-full text-left font-serif-news text-sm">
          <thead className="bg-[#f4ecd8] border-b border-foreground/30">
            <tr>
              <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Candidate</th>
              <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Contact</th>
              <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Assign To</th>
              <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a] text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-foreground/10 hover:bg-[#f4ecd8]/40">
                <td className="p-4">
                  <div className="font-bold">{lead.full_name}</div>
                  <div className="text-xs text-[#6b3e1a]">{lead.university} · {lead.program}</div>
                </td>
                <td className="p-4 text-xs">
                  <div>{lead.email}</div>
                  <div className="text-[#6b3e1a]">{lead.phone}</div>
                </td>
                <td className="p-4">
                  <Select onValueChange={(v) => allocate(lead.id, v)} defaultValue={lead.counsellor_name || undefined}>
                    <SelectTrigger className="h-8 w-44 rounded-none border border-foreground bg-transparent text-xs"><SelectValue placeholder="Allocate to…" /></SelectTrigger>
                    <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">
                      {staff.map((s) => <SelectItem key={s.email} value={s.email}>{s.email} ({s.role})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4 text-right">
                  <Button size="sm" onClick={() => convert(lead.id)} className="rounded-none bg-foreground text-background border-2 border-foreground font-sans font-bold uppercase tracking-wider text-[10px]">
                    Convert to Applicant
                  </Button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && !busy && (
              <tr><td colSpan={4} className="p-10 text-center italic text-[#6b3e1a]">No pending inbound leads.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------- STAFF: assigned lead pipeline -------------------------- */

function StaffLeadPipeline({ userEmail }: { userEmail: string }) {
  const [leads, setLeads] = useState<Student[]>([]);
  const [search, setSearch] = useState("");

  const loadLeads = async () => {
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("counsellor_name", userEmail)
      .eq("status", "lead")
      .order("created_at", { ascending: false });
    if (data) setLeads(data as Student[]);
  };
  useEffect(() => { loadLeads(); }, [userEmail]);

  const filtered = leads.filter((l) =>
    l.full_name.toLowerCase().includes(search.toLowerCase()) || (l.phone || "").includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="border-b-4 border-foreground pb-4">
        <h1 className="font-headline text-4xl uppercase tracking-tight">Active Lead Pipeline</h1>
        <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Leads assigned to you by the admissions office.</p>
      </div>

      <Input
        placeholder="Search leads by name or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-none border border-foreground bg-transparent"
      />

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="bg-[#fbf6e7] border-4 border-foreground p-20 text-center shadow-[6px_6px_0px_0px_#1a1410]">
            <p className="font-serif-news italic text-[#6b3e1a]">No assigned leads currently active.</p>
          </div>
        ) : filtered.map((lead) => (
          <div key={lead.id} className="bg-[#fbf6e7] border-4 border-foreground p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[6px_6px_0px_0px_#1a1410]">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-headline text-2xl uppercase tracking-tight">{lead.full_name}</h3>
                <span className="font-sans font-bold uppercase text-[10px] border border-foreground/40 px-1 py-0.5">{lead.program}</span>
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-xs font-sans font-bold text-[#6b3e1a] uppercase">
                <span className="flex items-center gap-1"><PhoneCall className="w-3 h-3" /> {lead.phone}</span>
                <span className="flex items-center gap-1 lowercase font-medium italic"><Mail className="w-3 h-3" /> {lead.email}</span>
              </div>
              {lead.notes && (
                <div className="mt-4 p-3 bg-[#f4ecd8] border-l-4 border-foreground/40 text-xs font-serif-news italic text-foreground/80">
                  {lead.notes}
                </div>
              )}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-none bg-foreground text-background border-2 border-foreground font-sans font-bold uppercase tracking-wider text-[10px] shrink-0">
                  <MessageSquare className="w-4 h-4 mr-2" /> Log Interaction
                </Button>
              </DialogTrigger>
              <InteractionDialog lead={lead} onSaved={loadLeads} />
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  );
}

function InteractionDialog({ lead, onSaved }: { lead: Student; onSaved: () => void }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!note.trim()) return toast.error("Add a note before saving");
    setBusy(true);
    const stamped = `[${new Date().toLocaleDateString()}] ${note.trim()}`;
    const { error } = await supabase
      .from("students")
      .update({ notes: lead.notes ? `${lead.notes}\n${stamped}` : stamped })
      .eq("id", lead.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Interaction logged");
    setNote("");
    onSaved();
  };

  return (
    <DialogContent className="bg-[#fbf6e7] border-4 border-foreground rounded-none max-w-xl">
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl uppercase">Log interaction — {lead.full_name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <Textarea
          placeholder="What did you discuss? Fee concerns, next follow-up, etc."
          className="rounded-none border border-foreground bg-transparent min-h-[120px]"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button onClick={save} disabled={busy} className="w-full rounded-none bg-foreground text-background border-2 border-foreground font-sans font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_#6b3e1a]">
          {busy ? "Saving…" : "Commit Update"}
        </Button>
      </div>
    </DialogContent>
  );
}
