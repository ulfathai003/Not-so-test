import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building, Lock, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export const Route = createFileRoute("/centers")({
  head: () => ({ meta: [{ title: "Centers | JoinOnline Education" }] }),
  component: CentersPage,
});

type Student = Tables<"students">;

function CentersPage() {
  const { role, loading } = useAuth();
  const [centers, setCenters] = useState<{ name?: string; email: string; phone?: string; created_at: string }[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    let c = await supabase.from("allowed_managers" as any).select("name, email, phone, created_at").eq("role", "center").order("created_at", { ascending: false });
    // Fall back gracefully if the name/phone columns aren't added yet
    // (run DB_SETUP/FIX_manager_contact.sql to enable them).
    if (c.error) {
      c = await supabase.from("allowed_managers" as any).select("email, created_at").eq("role", "center").order("created_at", { ascending: false });
    }
    const s = await supabase.from("students").select("*");
    if (c.data) setCenters(c.data as any);
    if (s.data) setStudents(s.data as Student[]);
  };
  useEffect(() => { if (role === "super_admin" || role === "admin") load(); }, [role]);

  if (loading) return <DashboardLayout><div className="font-serif-news italic text-sm">Loading centers…</div></DashboardLayout>;

  if (role !== "super_admin" && role !== "admin") {
    return (
      <DashboardLayout>
        <div className="bg-[#fbf6e7] border-4 border-foreground p-20 text-center shadow-[6px_6px_0px_0px_#1a1410]">
          <Lock className="w-16 h-16 mx-auto mb-4 text-[#6b3e1a]" />
          <h2 className="font-headline text-3xl uppercase">Restricted</h2>
        </div>
      </DashboardLayout>
    );
  }

  const statsFor = (email: string) => {
    const mine = students.filter((s) => s.counsellor_name === email && s.status !== "lead");
    const collection = mine.reduce((sum, s) => sum + Number(s.fee_paid ?? 0), 0);
    return { count: mine.length, collection };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border-b-4 border-foreground pb-4 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-4xl uppercase tracking-tight flex items-center gap-3"><Building className="w-9 h-9" /> Centers</h1>
            <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Regional admission centers and their performance.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none bg-foreground text-background border-2 border-foreground font-sans font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_#6b3e1a]">
                <Plus className="w-4 h-4 mr-1" /> Create Center
              </Button>
            </DialogTrigger>
            <CreateAccessDialog role="center" onSaved={() => { setOpen(false); load(); }} />
          </Dialog>
        </div>

        <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-x-auto">
          <table className="w-full text-left font-serif-news text-sm">
            <thead className="bg-[#f4ecd8] border-b border-foreground/30">
              <tr>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Center Name</th>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Email</th>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Mobile</th>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Students</th>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Collection</th>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Onboarded</th>
              </tr>
            </thead>
            <tbody>
              {centers.map((c) => {
                const stats = statsFor(c.email);
                return (
                  <tr key={c.email} className="border-t border-foreground/10 hover:bg-[#f4ecd8]/40">
                    <td className="p-4 font-bold">{c.name || "—"}</td>
                    <td className="p-4">{c.email}</td>
                    <td className="p-4">{c.phone || "—"}</td>
                    <td className="p-4">{stats.count}</td>
                    <td className="p-4">₹{stats.collection.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-xs text-[#6b3e1a]">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
              {centers.length === 0 && (
                <tr><td colSpan={6} className="p-10 text-center italic text-[#6b3e1a]">No centers onboarded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export function CreateAccessDialog({ role, onSaved }: { role: "center" | "staff"; onSaved: () => void }) {
  const label = role === "center" ? "Center" : "Employee";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = mobile.replace(/\D/g, "");
    if (phone.length < 10) return toast.error("Enter a valid 10-digit mobile number.");
    setBusy(true);
    // Whitelist the account: name + email + phone + role. The mobile number
    // doubles as their first-login password (see the login screen's
    // first-login flow), and handle_new_user grants the role on sign-up.
    const { error } = await supabase.from("allowed_managers" as any).upsert(
      [{ name: name.trim(), email: email.toLowerCase().trim(), phone, role }],
      { onConflict: "email" },
    );
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`${label} "${name || email}" added. They sign in with their email and mobile number as the password.`);
    setName(""); setEmail(""); setMobile("");
    onSaved();
  };

  return (
    <DialogContent className="bg-[#fbf6e7] border-4 border-foreground rounded-none max-w-md">
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl uppercase">New {label} access</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="font-sans font-bold uppercase tracking-wider text-[10px] block">{label} Name</label>
          <Input
            required
            placeholder={role === "center" ? "e.g. Belagavi Center" : "e.g. Jane Doe"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-none border border-foreground bg-transparent"
          />
        </div>
        <div className="space-y-1">
          <label className="font-sans font-bold uppercase tracking-wider text-[10px] block">Email</label>
          <Input
            type="email"
            required
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-none border border-foreground bg-transparent"
          />
        </div>
        <div className="space-y-1">
          <label className="font-sans font-bold uppercase tracking-wider text-[10px] block">Mobile Number (used as login password)</label>
          <Input
            type="tel"
            inputMode="numeric"
            required
            minLength={10}
            placeholder="e.g. 9876543210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="rounded-none border border-foreground bg-transparent"
          />
        </div>
        <p className="font-serif-news text-xs italic text-[#6b3e1a]">
          The {label.toLowerCase()} signs in at the login page with this <strong>email</strong> and their <strong>mobile number as the password</strong>. The {role} role is granted automatically on first sign-in.
        </p>
        <DialogFooter>
          <Button type="submit" disabled={busy} className="w-full rounded-none bg-foreground text-background border-2 border-foreground font-sans font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_#6b3e1a]">
            {busy ? "Saving…" : `Grant ${label} Access`}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
