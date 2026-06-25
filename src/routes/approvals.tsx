import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Lock, Check, X } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "Approvals | JoinOnline Education" }] }),
  component: ApprovalsPage,
});

type Student = Tables<"students">;

function ApprovalsPage() {
  const { role, loading } = useAuth();
  const [pending, setPending] = useState<Student[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("status", "inactive")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setPending(data ?? []);
    setBusy(false);
  };
  useEffect(() => { if (role === "super_admin") load(); }, [role]);

  const approve = async (id: string) => {
    const { error } = await supabase.from("students").update({ status: "active" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Admission approved");
    load();
  };

  const reject = async (id: string) => {
    if (!confirm("Reject this admission? It will be deleted from the registry.")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Admission rejected");
    load();
  };

  if (loading) {
    return <DashboardLayout><div className="font-serif-news italic text-sm">Loading approval desk…</div></DashboardLayout>;
  }

  if (role !== "super_admin") {
    return (
      <DashboardLayout>
        <div className="bg-[#fbf6e7] border-4 border-foreground p-20 text-center shadow-[6px_6px_0px_0px_#1a1410]">
          <Lock className="w-16 h-16 mx-auto mb-4 text-[#6b3e1a]" />
          <h2 className="font-headline text-3xl uppercase">Administrative Locked</h2>
          <p className="font-serif-news text-sm italic mt-2 text-[#6b3e1a]">Only the super admin can approve admissions.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border-b-4 border-foreground pb-4 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-4xl uppercase tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-9 h-9 text-[#6b3e1a]" /> Pending Admissions
            </h1>
            <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Final sign-off for applicants submitted by centers and converted enquiries.</p>
          </div>
          <Button onClick={load} variant="outline" className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-wider text-[10px]">Refresh</Button>
        </div>

        <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-x-auto">
          <table className="w-full text-left font-serif-news text-sm">
            <thead className="bg-[#f4ecd8] border-b border-foreground/30">
              <tr>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Student</th>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Program / University</th>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Submitted By</th>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((s) => (
                <tr key={s.id} className="border-t border-foreground/10 hover:bg-[#f4ecd8]/40">
                  <td className="p-4">
                    <div className="font-bold">{s.full_name}</div>
                    <div className="text-xs text-[#6b3e1a]">{s.email}</div>
                  </td>
                  <td className="p-4">{s.program} · {s.university}</td>
                  <td className="p-4 text-xs text-[#6b3e1a]">{s.counsellor_name || "—"}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => approve(s.id)} className="rounded-none bg-emerald-700 text-white border-2 border-emerald-700 font-sans font-bold uppercase tracking-wider text-[10px]"><Check className="w-3 h-3 mr-1" /> Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => reject(s.id)} className="rounded-none border-2 border-destructive text-destructive font-sans font-bold uppercase tracking-wider text-[10px]"><X className="w-3 h-3 mr-1" /> Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && !busy && (
                <tr><td colSpan={4} className="p-10 text-center italic text-[#6b3e1a]">All clear — no pending admissions.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
