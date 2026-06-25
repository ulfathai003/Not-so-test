import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserCog, Lock, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { CreateAccessDialog } from "@/routes/centers";

export const Route = createFileRoute("/employees")({
  head: () => ({ meta: [{ title: "Employees | JoinOnline Education" }] }),
  component: EmployeesPage,
});

type Student = Tables<"students">;

function EmployeesPage() {
  const { role, loading } = useAuth();
  const [staff, setStaff] = useState<{ email: string; created_at: string }[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const [s, st] = await Promise.all([
      supabase.from("allowed_managers" as any).select("email, created_at").eq("role", "staff").order("created_at", { ascending: false }),
      supabase.from("students").select("*").eq("status", "lead"),
    ]);
    if (s.data) setStaff(s.data as any);
    if (st.data) setStudents(st.data as Student[]);
  };
  useEffect(() => { if (role === "super_admin" || role === "admin") load(); }, [role]);

  if (loading) return <DashboardLayout><div className="font-serif-news italic text-sm">Loading employees…</div></DashboardLayout>;

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

  const assignedCount = (email: string) => students.filter((s) => s.counsellor_name === email).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border-b-4 border-foreground pb-4 flex items-center justify-between">
          <div>
            <h1 className="font-headline text-4xl uppercase tracking-tight flex items-center gap-3"><UserCog className="w-9 h-9" /> Employees</h1>
            <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Counsellors and their assigned lead load.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none bg-foreground text-background border-2 border-foreground font-sans font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_#6b3e1a]">
                <Plus className="w-4 h-4 mr-1" /> Create Employee
              </Button>
            </DialogTrigger>
            <CreateAccessDialog role="staff" onSaved={() => { setOpen(false); load(); }} />
          </Dialog>
        </div>

        <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-x-auto">
          <table className="w-full text-left font-serif-news text-sm">
            <thead className="bg-[#f4ecd8] border-b border-foreground/30">
              <tr>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Employee Email</th>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Assigned Leads</th>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Onboarded</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((emp) => (
                <tr key={emp.email} className="border-t border-foreground/10 hover:bg-[#f4ecd8]/40">
                  <td className="p-4 font-bold">{emp.email}</td>
                  <td className="p-4">{assignedCount(emp.email)}</td>
                  <td className="p-4 text-xs text-[#6b3e1a]">{new Date(emp.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr><td colSpan={3} className="p-10 text-center italic text-[#6b3e1a]">No employees onboarded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
