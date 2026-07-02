import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Lock, Check, X, Eye } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "Approvals | JoinOnline Education" }] }),
  component: ApprovalsPage,
});

type Student = Tables<"students">;

const inr = (n: number | null | undefined) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n ?? 0));

// Open a stored document from the private bucket via a short-lived signed URL.
async function openDoc(pathOrUrl: string) {
  if (/^https?:\/\//.test(pathOrUrl)) return window.open(pathOrUrl, "_blank");
  const { data, error } = await supabase.storage.from("student-documents").createSignedUrl(pathOrUrl, 3600);
  if (error || !data) return toast.error(error?.message || "Could not open document");
  window.open(data.signedUrl, "_blank");
}

function ApprovalsPage() {
  const { role, loading } = useAuth();
  const [pending, setPending] = useState<Student[]>([]);
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [approving, setApproving] = useState<Student | null>(null);

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
            <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Review each application, set the fee, then approve. Or reject.</p>
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
                      <Button size="sm" variant="outline" onClick={() => setViewing(s)} className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-wider text-[10px]"><Eye className="w-3 h-3 mr-1" /> View Application</Button>
                      <Button size="sm" onClick={() => setApproving(s)} className="rounded-none bg-emerald-700 text-white border-2 border-emerald-700 font-sans font-bold uppercase tracking-wider text-[10px]"><Check className="w-3 h-3 mr-1" /> Approve</Button>
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

      {viewing && <ViewApplicationDialog student={viewing} onClose={() => setViewing(null)} />}
      {approving && (
        <ApproveDialog
          student={approving}
          onClose={() => setApproving(null)}
          onApproved={() => { setApproving(null); load(); }}
        />
      )}
    </DashboardLayout>
  );
}

/* -------- View full application -------- */
function ViewApplicationDialog({ student, onClose }: { student: Student; onClose: () => void }) {
  const s = student as any;
  const docLinks = (() => { try { return typeof s.document_links === "string" ? JSON.parse(s.document_links) : (s.document_links || {}); } catch { return {}; } })();
  const Row = ({ label, value }: { label: string; value: any }) => (
    <div className="border-b border-foreground/10 py-1.5 grid grid-cols-2 gap-2">
      <span className="font-sans font-bold uppercase text-[10px] tracking-wider text-[#6b3e1a]">{label}</span>
      <span className="font-serif-news">{value === null || value === undefined || value === "" ? "—" : String(value)}</span>
    </div>
  );
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#fbf6e7] border-4 border-foreground rounded-none">
        <DialogHeader><DialogTitle className="font-headline text-2xl uppercase">Application · {student.full_name}</DialogTitle></DialogHeader>
        <div className="grid sm:grid-cols-2 gap-x-8 text-sm">
          <div>
            <h4 className="font-headline text-lg uppercase mt-2 mb-1">Course</h4>
            <Row label="Program" value={s.program} />
            <Row label="Specialization" value={s.specialization} />
            <Row label="University" value={s.university} />
            <Row label="Session" value={s.admission_session} />
            <Row label="Study mode" value={s.study_mode} />
            <Row label="Medium" value={s.medium_of_instruction} />
            <h4 className="font-headline text-lg uppercase mt-4 mb-1">Personal</h4>
            <Row label="Father" value={s.father_name} />
            <Row label="Mother" value={s.mother_name} />
            <Row label="DOB" value={s.dob} />
            <Row label="Gender" value={s.gender} />
            <Row label="Category" value={s.category} />
            <Row label="Caste" value={s.caste} />
            <Row label="Sub-Caste" value={s.sub_caste} />
            <Row label="Aadhar" value={s.aadhar_number} />
            <Row label="ABC ID" value={s.abc_id} />
            <Row label="Mobile" value={s.phone} />
          </div>
          <div>
            <h4 className="font-headline text-lg uppercase mt-2 mb-1">Address</h4>
            <Row label="Address" value={s.address} />
            <Row label="City" value={s.city} />
            <Row label="District" value={s.district} />
            <Row label="State" value={s.state} />
            <Row label="Pincode" value={s.pincode} />
            <h4 className="font-headline text-lg uppercase mt-4 mb-1">Education</h4>
            <Row label="10th" value={`${s.edu_10_board || "—"} · ${s.edu_10_percentage || "—"}%`} />
            <Row label="12th/Diploma" value={`${s.edu_12_board || "—"} · ${s.edu_12_percentage || "—"}%`} />
            <Row label="Degree" value={`${s.edu_degree_university || "—"} · ${s.edu_degree_percentage || "—"}%`} />
            <h4 className="font-headline text-lg uppercase mt-4 mb-1">Documents</h4>
            {Object.keys(docLinks).length === 0
              ? <div className="text-xs italic text-[#6b3e1a] py-1">No documents uploaded.</div>
              : Object.entries(docLinks).map(([k, url]) => (
                  <div key={k} className="py-1"><button type="button" onClick={() => openDoc(String(url))} className="underline text-[#6b3e1a] text-xs hover:text-foreground">{k}</button></div>
                ))}
          </div>
        </div>
        <DialogFooter><Button onClick={onClose} variant="outline" className="rounded-none border-2 border-foreground uppercase text-xs">Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------- Approve with fee -------- */
function ApproveDialog({ student, onClose, onApproved }: { student: Student; onClose: () => void; onApproved: () => void }) {
  const [total, setTotal] = useState<string>(String((student as any).total_fee ?? ""));
  const [discount, setDiscount] = useState<string>(String((student as any).discount ?? ""));
  const [busy, setBusy] = useState(false);
  const finalFee = Math.max(0, Number(total || 0) - Number(discount || 0));

  const confirm = async () => {
    if (!total || Number(total) <= 0) return toast.error("Enter the total fee before approving.");
    setBusy(true);
    const { error } = await supabase.from("students").update({
      total_fee: Number(total),
      discount: Number(discount || 0),
      final_fee: finalFee,
      fee_pending: finalFee,
      fee_paid: 0,
      payment_status: "Pending",
      status: "active",
    } as any).eq("id", student.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`${student.full_name} approved · fee ${inr(finalFee)}`);
    onApproved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-[#fbf6e7] border-4 border-foreground rounded-none">
        <DialogHeader><DialogTitle className="font-headline text-2xl uppercase">Approve · set fee</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="font-serif-news text-xs italic text-[#6b3e1a]">Set the fee for <b>{student.full_name}</b> ({student.program} · {student.university}). The student pays this after approval.</p>
          <div><Label className="text-[10px] font-bold uppercase">Total Fee (₹)</Label><Input type="number" min={0} value={total} onChange={(e) => setTotal(e.target.value)} className="rounded-none border-2 border-foreground" placeholder="e.g. 90000" /></div>
          <div><Label className="text-[10px] font-bold uppercase">Discount (₹)</Label><Input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} className="rounded-none border-2 border-foreground" placeholder="0" /></div>
          <div className="border-2 border-foreground p-3 bg-white flex justify-between items-center">
            <span className="font-sans font-bold uppercase text-xs">Final payable</span>
            <span className="font-headline text-2xl">{inr(finalFee)}</span>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button onClick={onClose} variant="outline" className="rounded-none border-2 border-foreground uppercase text-xs">Cancel</Button>
          <Button onClick={confirm} disabled={busy} className="rounded-none bg-emerald-700 text-white border-2 border-emerald-700 uppercase text-xs font-bold"><Check className="w-3 h-3 mr-1" /> {busy ? "Approving…" : "Approve & set fee"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
