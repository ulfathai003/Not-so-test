import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Lock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export const Route = createFileRoute("/enrollment-no")({
  head: () => ({ meta: [{ title: "Enrollment Numbers | JoinOnline Education" }] }),
  component: EnrollmentNoPage,
});

type Student = Tables<"students">;

function programCode(program: string) {
  return program.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 4) || "GEN";
}

function EnrollmentNoPage() {
  const { role, loading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("status", "active")
      .order("batch_year", { ascending: false })
      .order("full_name");
    if (data) setStudents(data as Student[]);
  };
  useEffect(() => { if (role === "admin" || role === "super_admin") load(); }, [role]);

  if (loading) return <DashboardLayout><div className="font-serif-news italic text-sm">Loading enrollment desk…</div></DashboardLayout>;

  if (role !== "admin" && role !== "super_admin") {
    return (
      <DashboardLayout>
        <div className="bg-[#fbf6e7] border-4 border-foreground p-20 text-center shadow-[6px_6px_0px_0px_#1a1410]">
          <Lock className="w-16 h-16 mx-auto mb-4 text-[#6b3e1a]" />
          <h2 className="font-headline text-3xl uppercase">Admin Only</h2>
          <p className="font-serif-news text-sm italic mt-2 text-[#6b3e1a]">Enrollment number generation is restricted to the main office.</p>
        </div>
      </DashboardLayout>
    );
  }

  const generate = async (s: Student) => {
    setBusyId(s.id);
    const seq = String(Date.now()).slice(-4);
    const enrollment_number = `ENR-${programCode(s.program)}-${s.batch_year}-${seq}`;
    const { error } = await supabase.from("students").update({ enrollment_number }).eq("id", s.id);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success(`Generated ${enrollment_number}`);
    load();
  };

  const pending = students.filter((s) => !s.enrollment_number);
  const issued = students.filter((s) => s.enrollment_number);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="border-b-4 border-foreground pb-4">
          <h1 className="font-headline text-4xl uppercase tracking-tight flex items-center gap-3"><FileText className="w-9 h-9" /> Enrollment Numbers</h1>
          <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Active students awaiting a final enrollment ID, and those already issued.</p>
        </div>

        <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-x-auto">
          <div className="p-4 bg-foreground text-background font-headline text-xl uppercase tracking-tight">Awaiting generation ({pending.length})</div>
          <table className="w-full text-left font-serif-news text-sm">
            <tbody>
              {pending.map((s) => (
                <tr key={s.id} className="border-t border-foreground/10 hover:bg-[#f4ecd8]/40">
                  <td className="p-4">
                    <div className="font-bold">{s.full_name}</div>
                    <div className="text-xs text-[#6b3e1a]">{s.program} · {s.university} · Batch {s.batch_year}</div>
                  </td>
                  <td className="p-4 text-right">
                    <Button size="sm" disabled={busyId === s.id} onClick={() => generate(s)} className="rounded-none bg-foreground text-background border-2 border-foreground font-sans font-bold uppercase tracking-wider text-[10px]">
                      {busyId === s.id ? "Generating…" : "Generate"}
                    </Button>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr><td className="p-10 text-center italic text-[#6b3e1a]">All active students have an enrollment number.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-x-auto">
          <div className="p-4 bg-[#f4ecd8] font-headline text-xl uppercase tracking-tight border-b border-foreground/30">Issued ({issued.length})</div>
          <table className="w-full text-left font-serif-news text-sm">
            <thead className="bg-[#f4ecd8] border-b border-foreground/30">
              <tr>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Student</th>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">University</th>
                <th className="p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a]">Enrollment No.</th>
              </tr>
            </thead>
            <tbody>
              {issued.map((s) => (
                <tr key={s.id} className="border-t border-foreground/10 hover:bg-[#f4ecd8]/40">
                  <td className="p-4 font-bold">{s.full_name}</td>
                  <td className="p-4">{s.university}</td>
                  <td className="p-4 font-sans font-bold text-[#6b3e1a]">{s.enrollment_number}</td>
                </tr>
              ))}
              {issued.length === 0 && (
                <tr><td colSpan={3} className="p-10 text-center italic text-[#6b3e1a]">None issued yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
