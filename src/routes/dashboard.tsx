import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { 
  GraduationCap, LogOut, Plus, Search, ShieldCheck, Users, 
  Pencil, Trash2, Filter, BookOpen, MapPin, Mail, Phone, 
  User, Home, FileText, Wallet, FolderCheck, ClipboardList,
  Send, MessageSquare, Calendar, ChevronRight, Download, CheckCircle2, Save, FileSpreadsheet
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";

import { z } from "zod";

const dashboardSearchSchema = z.object({
  view: z.string().optional().catch("overview"),
});

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search) => dashboardSearchSchema.parse(search),
  head: () => ({ meta: [{ title: "Dashboard | JoinOnline Education" }] }),
  component: DashboardPage,
});

type Student = Tables<"students">;
type ProgramType = Student["program"];

const PROGRAMS: ProgramType[] = ["10th", "12th Arts", "12th Commerce", "12th Science", "BBA", "MBA"];
const STATUSES = ["active", "inactive", "graduated", "suspended"] as const;
const UNIVERSITIES = ["Mangalayatan University", "Jain University", "Manipal University", "Amity University", "NMIMS", "IGNOU", "LPU"];
const GENDERS = ["Male", "Female", "Other"];
const CATEGORIES = ["General", "OBC", "SC", "ST", "Other"];
const EMPLOYMENT = ["Employed", "Unemployed", "Self-employed", "Student"];
const MARITAL = ["Single", "Married", "Divorced", "Widowed"];
const RESULTS = ["Pass", "Fail", "Distinction", "First Class", "Second Class"];
const SESSIONS = ["January", "July"];
const STUDY_MODES = ["Online", "Distance", "Hybrid"];
const MEDIUMS = ["English", "Hindi", "Bilingual"];
const PAYMENT_STATUSES = ["Paid", "Partial", "Pending", "Overdue"];
const PAYMENT_MODES = ["UPI", "Net Banking", "Card", "Cash", "Cheque", "EMI"];
const LEAD_SOURCES = ["Website", "Walk-in", "Referral", "Social Media", "Counsellor", "Education Fair"];

import { DashboardLayout } from "@/components/layout/DashboardLayout";

function DashboardPage() {
  const { user, role, studentStatus, studentData, loading, signOut, refetchStudent } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const currentView = (search as any).view || "overview";

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f4ecd8]">
        <div className="text-[#1a1410] font-serif-news text-sm italic">Loading admissions desk…</div>
      </div>
    );
  }

  const isProspect = (role as string) === "student" && studentStatus !== "active" && studentStatus !== "graduated";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {(role === "super_admin" || role === "admin" || role === "center" || role === "staff") ? (
          <RoleDashboard view={currentView} role={role as string} userEmail={user.email!} />
        ) : isProspect ? (
          <ProspectDashboard studentStatus={studentStatus} studentData={studentData} refetchStudent={refetchStudent} email={user.email!} />
        ) : (
          <StudentPanel email={user.email!} />
        )}
      </div>

      {/* Floating Counselor Chat Widget */}
      {isProspect && (
        <CounselorChatWidget 
          fullName={studentData?.full_name || "Applicant"} 
          email={user.email!} 
        />
      )}
    </DashboardLayout>
  );
}

/* -------------------------- PROSPECT CUSTOM DASHBOARD -------------------------- */

function ProspectDashboard({
  studentStatus,
  studentData,
  refetchStudent,
  email
}: {
  studentStatus: string | null;
  studentData: any;
  refetchStudent: () => Promise<void>;
  email: string;
}) {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);

  useEffect(() => {
    const draft = localStorage.getItem("joinonline_admissions_draft");
    if (draft) {
      setHasDraft(true);
      try {
        setDraftData(JSON.parse(draft));
      } catch (e) {}
    }
  }, []);

  // Determine active step
  // 1: Draft, 2: Submitted, 3: Counselor Review, 4: Enrolled
  let currentTimelineStep = 1;
  if (studentStatus === "inactive") {
    currentTimelineStep = 2; // Submitted & In Review
  } else if (studentStatus === "active") {
    currentTimelineStep = 4; // Enrolled
  }

  const printVoucher = () => {
    const data = studentData || draftData;
    if (!data) {
      return toast.error("No application data found to generate a voucher receipt!");
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>JoinOnline Education - Official Desk Voucher</title>
          <style>
            body { font-family: 'Georgia', serif; background-color: #fbf6e7; color: #1a1410; padding: 40px; }
            .receipt { border: 4px double #1a1410; padding: 30px; max-width: 650px; margin: 0 auto; background: #fff; }
            .header { text-align: center; border-bottom: 2px solid #1a1410; padding-bottom: 20px; }
            .title { font-size: 28px; font-weight: bold; text-transform: uppercase; margin: 0; }
            .subtitle { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 5px 0 0; }
            .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
            .field { border-bottom: 1px solid #1a1410; padding-bottom: 5px; }
            .label { font-size: 10px; text-transform: uppercase; font-family: sans-serif; font-weight: bold; color: #6b3e1a; }
            .val { font-size: 15px; margin-top: 3px; }
            .status-box { background-color: #f4ecd8; border: 2px solid #1a1410; text-align: center; padding: 12px; margin: 20px 0; font-weight: bold; text-transform: uppercase; }
            .fineprint { font-size: 10px; text-align: center; border-top: 1px solid #1a1410; padding-top: 15px; margin-top: 25px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="title">JoinOnline Education</div>
              <div class="subtitle">Official Admissions Desk Voucher · Batch of 2026</div>
            </div>
            
            <div class="status-box">
              Application Status: ${studentStatus === "inactive" ? "PENDING COUNSELLOR REVIEW" : "DRAFT MODE"}
            </div>
            
            <div class="field-grid">
              <div class="field"><div class="label">Date of Issue</div><div class="val">${new Date().toLocaleDateString()}</div></div>
              <div class="field"><div class="label">Applicant Email</div><div class="val">${email}</div></div>
              <div class="field"><div class="label">Full Name</div><div class="val">${data.full_name || "PENDING"}</div></div>
              <div class="field"><div class="label">University Choice</div><div class="val">${data.university || "PENDING"}</div></div>
              <div class="field"><div class="label">Program Selected</div><div class="val">${data.program || "PENDING"}</div></div>
              <div class="field"><div class="label">Specialization</div><div class="val">${data.specialization || "GENERAL"}</div></div>
            </div>
            <div class="fineprint">
              This document certifies a temporary slot reservation. Please submit documents for counsellor review. Support line: ulfathai003@gmail.com.
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Editorial Welcome banner */}
      <section className="bg-[#fbf6e7] border-4 border-foreground p-6 sm:p-10 shadow-[6px_6px_0px_0px_#1a1410]">
        <p className="news-kicker">Admission desk update · Special Edition</p>
        <h2 className="font-headline text-3xl sm:text-4xl uppercase tracking-tight mt-1">
          Welcome to your Admissions Portal
        </h2>
        <p className="font-serif-news text-sm italic mt-2 text-[#6b3e1a]">
          Track your course enrollment, schedule a callback, and manage academic documents.
        </p>
      </section>

      {/* Progress Timeline */}
      <section className="bg-[#fbf6e7] border-4 border-foreground p-6 sm:p-10 shadow-[6px_6px_0px_0px_#1a1410] space-y-6">
        <h3 className="font-headline text-2xl uppercase border-b border-foreground/30 pb-3">Admissions Intake Progress Timeline</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            { step: 1, label: "Draft Saved", desc: "Local draft or slot reservation.", active: currentTimelineStep >= 1 },
            { step: 2, label: "Submitted", desc: "Sent to admissions office.", active: currentTimelineStep >= 2 },
            { step: 3, label: "Counselor Review", desc: "Reviewing eligibility.", active: currentTimelineStep >= 2 }, // In review once submitted
            { step: 4, label: "Enrolled", desc: "Official seat confirmation.", active: currentTimelineStep >= 4 }
          ].map((t, idx) => (
            <div key={t.step} className="flex flex-col items-start space-y-2 relative z-10">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-none border-2 border-foreground flex items-center justify-center font-sans font-bold text-sm transition-all ${
                  t.active 
                    ? "bg-[#6b3e1a] text-white shadow-[2px_2px_0px_0px_#1a1410]" 
                    : "bg-transparent text-foreground/40"
                }`}>
                  {t.step}
                </div>
                <span className={`font-sans font-bold uppercase text-xs tracking-wider ${t.active ? "text-foreground" : "text-foreground/40"}`}>
                  {t.label}
                </span>
              </div>
              <p className="font-serif-news text-xs italic text-foreground/70 pl-1">
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Status Details & Actions */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#fbf6e7] border-4 border-foreground p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1a1410] flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-2xl uppercase border-b border-foreground/30 pb-2">Intake Status Report</h3>
            
            {studentStatus === "inactive" ? (
              <div className="mt-4 space-y-4">
                <div className="bg-[#f4ecd8] border-2 border-foreground p-4 font-serif-news text-sm italic border-l-8 border-l-[#6b3e1a]">
                  Your admissions credentials have been received and are currently under senior counselor review. We will contact you at <strong>{email}</strong> shortly.
                </div>
                <div className="grid grid-cols-2 gap-4 font-serif-news text-xs pt-2">
                  <div><strong>Selected Program:</strong> {studentData?.program}</div>
                  <div><strong>University:</strong> {studentData?.university}</div>
                  <div><strong>Specialization:</strong> {studentData?.specialization || "General"}</div>
                  <div><strong>Session:</strong> {studentData?.admission_session} 2026</div>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="bg-[#f4ecd8] border-2 border-foreground p-4 font-serif-news text-sm italic border-l-8 border-l-foreground/40">
                  {hasDraft 
                    ? `You have an active draft saved for a ${draftData?.program} at ${draftData?.university}. Complete your submission below.` 
                    : "No active application draft found. Kickstart your admissions request."
                  }
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 pt-4 border-t border-foreground/20">
            <Link to="/admission-desk" className="inline-block">
              <Button className="rounded-none bg-foreground text-background border-2 border-foreground font-sans font-bold uppercase tracking-wider text-xs py-2 shadow-[3px_3px_0px_0px_#6b3e1a] hover:bg-transparent hover:text-foreground">
                {studentStatus === "inactive" ? "Update Details" : hasDraft ? "Resume Application" : "Start Application"}
              </Button>
            </Link>
            {(studentData || draftData) && (
              <Button 
                onClick={printVoucher}
                variant="outline" 
                className="rounded-none border-2 border-foreground bg-transparent font-sans font-bold uppercase tracking-wider text-xs py-2 hover:bg-foreground/5"
              >
                <Download className="w-4 h-4 mr-2" /> Print Summary Voucher
              </Button>
            )}
          </div>
        </div>

        {/* Informative Side panel */}
        <div className="bg-[#fbf6e7] border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_#1a1410] font-serif-news space-y-4">
          <h4 className="font-headline text-lg uppercase border-b border-foreground/20 pb-2 text-[#6b3e1a]">Admissions FAQ</h4>
          <div className="space-y-3 text-xs leading-relaxed">
            <div>
              <strong className="block text-foreground">Is my seat reserved?</strong>
              Yes, printing a voucher locks in your temporary eligibility bracket for 7 days.
            </div>
            <div>
              <strong className="block text-foreground">Where do I upload files?</strong>
              You can toggle verified readiness checklist in Step 5 of the intake desk.
            </div>
            <div>
              <strong className="block text-foreground">Direct Desk Helpline:</strong>
              Email our Lead admissions director at <a href="mailto:ulfathai003@gmail.com" className="underline font-bold text-foreground">ulfathai003@gmail.com</a>.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------------------------- RETRO COUNSELOR CHAT WIDGET -------------------------- */

function CounselorChatWidget({ fullName, email }: { fullName: string; email: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "bot" | "user"; text: string }>>([
    { sender: "bot", text: "JoinOnline Helpline · Lead Counselor Online. How can I assist you with your degree selection today?" }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const triggerFAQ = (q: string, a: string) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: q },
      { sender: "bot", text: a }
    ]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setSending(true);

    try {
      // Send directly to ulfathai003@gmail.com using FormSubmit AJAX
      await fetch("https://formsubmit.co/ajax/ulfathai003@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: `Intake Helpdesk Query from ${fullName || "Applicant"}`,
          applicant_name: fullName,
          email: email,
          message: userMessage
        })
      });

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Your message has been sent directly to my desk inbox (ulfathai003@gmail.com). I will get back to you shortly!" }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Connection error. Please email me directly at ulfathai003@gmail.com." }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-foreground text-background border-4 border-foreground px-4 py-3 shadow-[4px_4px_0px_0px_#6b3e1a] font-bold uppercase tracking-wider text-xs flex items-center gap-2 hover:-translate-y-0.5 transition-transform"
        >
          <MessageSquare className="w-4 h-4 text-background" /> Talk with Counselor
        </button>
      )}

      {/* Telegram Card */}
      {isOpen && (
        <div className="w-80 bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] flex flex-col h-96">
          {/* Card Header */}
          <div className="bg-foreground text-background p-3 flex items-center justify-between border-b-2 border-foreground">
            <span className="font-sans font-bold uppercase tracking-wider text-xs">Admissions Hotline</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-xs uppercase font-bold tracking-widest text-[#fbf6e7] hover:opacity-75"
            >
              [Close]
            </button>
          </div>

          {/* Messages box */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 font-serif-news text-xs leading-relaxed">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`p-2 border-2 ${
                  m.sender === "bot" 
                    ? "bg-[#f4ecd8] border-foreground/30 text-foreground" 
                    : "bg-foreground text-background border-foreground align-right self-end"
                }`}
              >
                <div className="font-sans font-bold text-[9px] uppercase tracking-wider opacity-60 mb-0.5">
                  {m.sender === "bot" ? "Counselor Direct" : "You"}
                </div>
                {m.text}
              </div>
            ))}
          </div>

          {/* FAQ Quick suggestions */}
          <div className="p-2 border-t border-foreground/30 flex flex-wrap gap-1 bg-[#f4ecd8]/40">
            <button 
              onClick={() => triggerFAQ("Required Documents?", "Please attach clear scans of your 10th and 12th certificates, passport photo, signature scan, and Aadhar card.")}
              className="text-[9px] font-sans font-bold border border-foreground/40 px-1 py-0.5 uppercase hover:bg-foreground/5 text-[#6b3e1a]"
            >
              Docs Required?
            </button>
            <button 
              onClick={() => triggerFAQ("How to pay fees?", "Fees are paid directly online. A counselor will email you the official university instalment checkout links.")}
              className="text-[9px] font-sans font-bold border border-foreground/40 px-1 py-0.5 uppercase hover:bg-foreground/5 text-[#6b3e1a]"
            >
              Fee Payment?
            </button>
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSend} className="p-2 border-t-2 border-foreground flex gap-1 bg-[#fbf6e7]">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask counselor a question..."
              className="rounded-none border border-foreground bg-transparent text-xs font-serif-news focus:ring-0"
            />
            <Button 
              type="submit" 
              disabled={sending}
              className="rounded-none bg-foreground text-background border border-foreground p-2 h-auto"
            >
              <Send className="w-3 h-3 text-background" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}





/* -------------------------- ROLE DASHBOARD ROUTER -------------------------- */

function RoleDashboard({ view, role, userEmail }: { view: string; role: string; userEmail: string }) {
  const isCenter = role === "center";
  const isStaff = role === "staff";

  if (view === "overview") return <OverviewView role={role} userEmail={userEmail} />;
  if (view === "payments" && !isStaff) return <PaymentsView role={role} userEmail={userEmail} />;
  if (view === "settings" && !isCenter && !isStaff) return <SettingsView />;
  // "students" and any other/unknown view fall back to the registry.
  return <AdminPanel isCenter={isCenter} isStaff={isStaff} view={view} userEmail={userEmail} />;
}

const inr = (n: number | null | undefined) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n ?? 0));

/* -------------------------- OVERVIEW -------------------------- */

function OverviewView({ role, userEmail }: { role: string; userEmail: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const isStaff = role === "staff";

  useEffect(() => {
    (async () => {
      let studentQuery = supabase.from("students").select("*");
      if (role === "center") studentQuery = studentQuery.eq("counsellor_name", userEmail).neq("status", "lead");
      if (role === "staff") studentQuery = studentQuery.eq("counsellor_name", userEmail).eq("status", "lead");

      const { data: s } = await studentQuery;
      setStudents(s ?? []);

      if (!isStaff) {
        let payQuery = supabase.from("fee_payments").select("*, student:students(*)");
        const { data: p } = await payQuery;
        let pData = p ?? [];
        if (role === "center") pData = pData.filter((pay: any) => pay.student?.counsellor_name === userEmail);
        setPayments(pData);
      }
    })();
  }, [role, userEmail]);

  if (isStaff) {
    const newLeads = students.filter((s) => !s.notes).length;
    return (
      <div className="space-y-6">
        <div className="border-b-4 border-foreground pb-4">
          <h1 className="font-headline text-4xl uppercase tracking-tight">Counselor Desk</h1>
          <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Leads assigned to you by the admissions office.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
          <KPI label="Assigned Leads" value={String(students.length)} icon={Users} />
          <KPI label="Not Yet Contacted" value={String(newLeads)} icon={Mail} />
        </div>
      </div>
    );
  }

  const totalBilled = students.reduce((sum, s) => sum + Number(s.total_fee ?? 0), 0);
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = Math.max(totalBilled - totalCollected, 0);
  const overdue = students.filter((s) => Number(s.fee_pending ?? 0) > 0).length;
  const byProgram: Record<string, number> = {};
  students.forEach((s) => { byProgram[s.program] = (byProgram[s.program] ?? 0) + 1; });

  return (
    <div className="space-y-8">
      <div className="border-b-4 border-foreground pb-4">
        <h1 className="font-headline text-4xl uppercase tracking-tight">Admissions Command</h1>
        <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">A bento overview of your learners, programs and collections.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI label="Total Students" value={String(students.length)} icon={Users} />
        <KPI label="Total Billed" value={inr(totalBilled)} icon={Wallet} />
        <KPI label="Collected" value={inr(totalCollected)} icon={CheckCircle2} />
        <KPI label="Pending" value={inr(totalPending)} icon={ClipboardList} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#fbf6e7] border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_#1a1410]">
          <h3 className="font-headline text-xl uppercase border-b border-foreground/30 pb-2 mb-4">Students by program</h3>
          <div className="space-y-2 font-serif-news text-sm">
            {Object.entries(byProgram).map(([p, n]) => (
              <div key={p} className="flex justify-between border-b border-foreground/10 pb-1"><span>{p}</span><span className="font-bold">{n}</span></div>
            ))}
            {Object.keys(byProgram).length === 0 && <div className="text-[#6b3e1a] italic">No students yet.</div>}
          </div>
        </div>
        <div className="bg-[#fbf6e7] border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_#1a1410]">
          <h3 className="font-headline text-xl uppercase border-b border-foreground/30 pb-2 mb-4">Action items</h3>
          <div className="flex justify-between font-serif-news text-sm">
            <span className="font-sans font-bold uppercase tracking-widest text-[10px] text-[#6b3e1a]">Students with dues</span>
            <span className="font-bold border border-foreground px-2 py-0.5 text-xs">{overdue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="bg-[#fbf6e7] border-4 border-foreground p-5 shadow-[6px_6px_0px_0px_#1a1410] flex flex-col justify-between min-h-[140px]">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-sans font-bold uppercase tracking-widest text-[10px] text-[#6b3e1a]">{label}</div>
          <div className="mt-2 font-headline text-3xl sm:text-4xl">{value}</div>
        </div>
        <span className="grid place-items-center w-10 h-10 border-2 border-foreground bg-foreground text-background shrink-0">
          <Icon className="w-5 h-5" />
        </span>
      </div>
    </div>
  );
}

/* -------------------------- PAYMENTS -------------------------- */

const PAYMENT_MODE_OPTIONS = ["UPI", "Net Banking", "Card", "Cash", "Cheque", "EMI"];

function PaymentsView({ role, userEmail }: { role: string; userEmail: string }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const { data: payData } = await supabase.from("fee_payments").select("*, student:students(*)").order("payment_date", { ascending: false });
    const { data: stuData } = await supabase.from("students").select("*").order("full_name");
    let filteredPayments = payData ?? [];
    let filteredStudents = stuData ?? [];
    if (role === "center") {
      filteredPayments = filteredPayments.filter((p: any) => p.student?.counsellor_name === userEmail);
      filteredStudents = filteredStudents.filter((s: any) => s.counsellor_name === userEmail);
    }
    setPayments(filteredPayments);
    setStudents(filteredStudents);
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Delete this payment? Student balance will be recalculated.")) return;
    const { error } = await supabase.from("fee_payments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Payment removed");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="border-b-4 border-foreground pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-4xl uppercase tracking-tight">Financial Ledger Desk</h1>
          <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Each entry auto-updates the student's paid / pending balance.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none bg-foreground text-background border-2 border-foreground py-2 font-sans font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_#6b3e1a]">
              <Plus className="w-4 h-4 mr-1 text-background" /> Record Payment
            </Button>
          </DialogTrigger>
          <PaymentDialog students={students} onSaved={() => { setOpen(false); load(); }} />
        </Dialog>
      </div>
      <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-x-auto">
        <table className="w-full text-left font-serif-news text-sm">
          <thead className="bg-[#f4ecd8] border-b border-foreground/30">
            <tr><Th>Date</Th><Th>Student</Th><Th>Amount</Th><Th>Mode</Th><Th>Receipt #</Th><Th className="text-right">Action</Th></tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={6} className="p-10 text-center italic text-[#6b3e1a]">No payments recorded yet.</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="border-t border-foreground/10 hover:bg-[#f4ecd8]/40">
                <td className="p-4">{p.payment_date}</td>
                <td className="p-4">
                  <div className="font-bold">{p.student?.full_name ?? "—"}</div>
                  <div className="text-xs text-[#6b3e1a]">{p.student?.email}</div>
                </td>
                <td className="p-4 font-bold">{inr(Number(p.amount))}</td>
                <td className="p-4 text-[#6b3e1a]">{p.payment_mode ?? "—"}</td>
                <td className="p-4 text-[#6b3e1a]">{p.receipt_number ?? "—"}</td>
                <td className="p-4 text-right">
                  <Button size="icon" variant="ghost" onClick={() => del(p.id)} className="hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentDialog({ students, onSaved }: { students: Student[]; onSaved: () => void }) {
  const [form, setForm] = useState<any>({
    student_id: "", amount: 0, payment_date: new Date().toISOString().slice(0, 10),
    payment_mode: "UPI", receipt_number: "", transaction_ref: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student_id) return toast.error("Select a student");
    setSaving(true);
    const receipt = form.receipt_number || `RCP-${Date.now()}`;
    const { error } = await supabase.from("fee_payments").insert({ ...form, receipt_number: receipt, amount: Number(form.amount) });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Payment recorded");
    onSaved();
  }

  return (
    <DialogContent className="max-w-2xl bg-[#fbf6e7] border-4 border-foreground rounded-none">
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl uppercase">Record fee payment</DialogTitle>
        <DialogDescription className="font-serif-news text-xs italic text-[#6b3e1a]">This auto-updates the student's paid/pending balance.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 text-xs">
        <Field label="Student" required>
          <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
            <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue placeholder="Select student" /></SelectTrigger>
            <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">
              {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name} — {s.program}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Amount (INR)" required>
          <Input className="rounded-none border border-foreground bg-transparent" type="number" min={0} step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required />
        </Field>
        <Field label="Date" required>
          <Input className="rounded-none border border-foreground bg-transparent" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} required />
        </Field>
        <Field label="Mode">
          <Select value={form.payment_mode} onValueChange={(v) => setForm({ ...form, payment_mode: v })}>
            <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{PAYMENT_MODE_OPTIONS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Receipt number"><Input className="rounded-none border border-foreground bg-transparent" value={form.receipt_number} onChange={(e) => setForm({ ...form, receipt_number: e.target.value })} placeholder="Auto if blank" /></Field>
        <Field label="Transaction ref"><Input className="rounded-none border border-foreground bg-transparent" value={form.transaction_ref} onChange={(e) => setForm({ ...form, transaction_ref: e.target.value })} /></Field>
        <DialogFooter className="sm:col-span-2">
          <Button type="submit" disabled={saving} className="rounded-none bg-foreground text-background border-2 border-foreground py-3 font-sans font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_#6b3e1a]">
            {saving ? "Saving…" : "Record payment"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

/* -------------------------- SETTINGS -------------------------- */

function SettingsView() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState("center");
  const [busy, setBusy] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  const loadMembers = async () => {
    const { data } = await supabase.from("allowed_managers" as any).select("*").order("created_at", { ascending: false });
    if (data) setMembers(data);
  };
  useEffect(() => { loadMembers(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.from("allowed_managers" as any).upsert([{ 
        email: email.toLowerCase().trim(), 
        role: selectedRole,
        name: name.trim(),
        phone: phone.trim()
      }], { onConflict: "email" });
      if (error) throw error;
      toast.success(`${name} can now login as ${selectedRole} using their phone number.`);
      setEmail(""); setName(""); setPhone("");
      loadMembers();
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const revoke = async (memberEmail: string) => {
    if (!confirm(`Revoke access for ${memberEmail}?`)) return;
    const { error } = await supabase.from("allowed_managers" as any).delete().eq("email", memberEmail);
    if (error) return toast.error(error.message);
    toast.success("Access revoked");
    loadMembers();
  };

  return (
    <div className="space-y-6">
      <div className="border-b-4 border-foreground pb-4">
        <h1 className="font-headline text-4xl uppercase tracking-tight">System Configuration</h1>
        <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Grant admin, center or staff access by email.</p>
      </div>
      <div className="bg-[#fbf6e7] border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_#1a1410]">
        <h3 className="font-headline text-xl uppercase mb-4">Register Center / Staff</h3>
        <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase opacity-50">Full Name</label>
            <Input placeholder="Center Name" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-none border border-foreground bg-transparent" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase opacity-50">Email</label>
            <Input placeholder="user@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-none border border-foreground bg-transparent" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase opacity-50">Phone (Password)</label>
            <Input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="rounded-none border border-foreground bg-transparent" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase opacity-50">Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full rounded-none border border-foreground bg-transparent"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={busy} className="h-10 rounded-none bg-foreground text-background border-2 border-foreground font-sans font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_#6b3e1a]">Add Member</Button>
        </form>
        <p className="font-serif-news text-[10px] italic text-[#6b3e1a] mt-3 uppercase tracking-wider">Note: The phone number will be used as the default password for their account.</p>
      </div>
      <div className="bg-[#fbf6e7] border-4 border-foreground shadow-[6px_6px_0px_0px_#1a1410] overflow-x-auto">
        <table className="w-full text-left font-serif-news text-sm">
          <thead className="bg-[#f4ecd8] border-b border-foreground/30"><tr><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>Role</Th><Th className="text-right">Action</Th></tr></thead>
          <tbody>
            <tr className="border-t border-foreground/10"><td className="p-4 font-bold">Prashant Bhai</td><td className="p-4 font-bold">ulfathai003@gmail.com</td><td className="p-4">—</td><td className="p-4 font-bold uppercase text-xs">Master Super Admin</td><td className="p-4"></td></tr>
            {members.filter((m) => m.email !== "ulfathai003@gmail.com").map((m) => (
              <tr key={m.id} className="border-t border-foreground/10">
                <td className="p-4 font-bold">{m.name || "—"}</td>
                <td className="p-4">{m.email}</td>
                <td className="p-4 font-mono text-[10px]">{m.phone || "—"}</td>
                <td className="p-4 uppercase font-bold text-xs">{m.role}</td>
                <td className="p-4 text-right"><Button size="sm" variant="ghost" onClick={() => revoke(m.email)} className="text-destructive hover:bg-destructive/10">Revoke</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------- STUDENT REGISTRY -------------------------- */

function AdminPanel({ isCenter, isStaff, view, userEmail }: { isCenter?: boolean; isStaff?: boolean; view: string; userEmail?: string }) {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [editing, setEditing] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function load() {
    setLoading(true);
    let query = supabase.from("students").select("*").order("batch_year", { ascending: false }).order("full_name");

    if (isCenter && user?.email) {
      query = query.filter("counsellor_name", "eq", user.email).neq("status", "lead");
    }

    const { data, error } = await query;
    if (error) toast.error(error.message);
    setStudents(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const years = useMemo(() => Array.from(new Set(students.map((s) => s.batch_year))).sort((a, b) => b - a), [students]);

  const filtered = students.filter((s) => {
    if (program !== "all" && s.program !== program) return false;
    if (year !== "all" && String(s.batch_year) !== year) return false;
    if (search) {
      const q = search.toLowerCase();
      return [s.full_name, s.email, s.specialization, s.university, s.location].some((v) => (v ?? "").toLowerCase().includes(q));
    }
    return true;
  });

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
    bba: students.filter((s) => s.program === "BBA").length,
    mba: students.filter((s) => s.program === "MBA").length,
  };

  async function handleDelete(id: string) {
    if (!confirm("Delete this student? This cannot be undone.")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Student deleted");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="border-b-4 border-foreground pb-4">
        <h1 className="font-headline text-4xl uppercase tracking-tight">
          {isCenter ? "Center Admissions Desk" : "Student Registry"}
        </h1>
        <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">
          {isCenter ? "Managing your assigned learners and enrollment progress." : "Full applicant roster across every batch, program and partner university."}
        </p>
      </div>

      {/* BENTO GRID - Brutalist News Style */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-[#fbf6e7] border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_#1a1410] relative flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="font-sans font-bold uppercase tracking-wider text-xs text-[#6b3e1a]">Total Intake Registry</div>
            <div className="mt-2 font-headline text-5xl sm:text-6xl">{stats.total}</div>
          </div>
          <p className="font-serif-news text-xs italic mt-2 opacity-80">Across every batch, program and partner university.</p>
        </div>
        
        <div className="bg-[#fbf6e7] border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_#1a1410] flex flex-col justify-between">
          <div className="font-sans font-bold uppercase tracking-wider text-xs text-[#6b3e1a]">Active Seats</div>
          <div className="font-headline text-4xl mt-1">{stats.active}</div>
          <div className="text-[10px] uppercase font-bold text-emerald-700 mt-2">Verified Admissions</div>
        </div>

        <div className="bg-[#fbf6e7] border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_#1a1410] flex flex-col justify-between">
          <div className="font-sans font-bold uppercase tracking-wider text-xs text-[#6b3e1a]">Online BBA</div>
          <div className="font-headline text-4xl mt-1">{stats.bba}</div>
          <div className="text-[10px] uppercase font-bold text-[#6b3e1a] mt-2">Undergraduates</div>
        </div>
      </div>

      <div className="bg-[#fbf6e7] border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_#1a1410]">
        <div className="pb-4 border-b border-foreground/30 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#6b3e1a]" />
            <Input 
              className="pl-9 rounded-none border border-foreground bg-transparent font-serif-news text-sm focus:ring-0" 
              placeholder="Search name, email, university…" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-foreground/75" />
            <Select value={program} onValueChange={setProgram}>
              <SelectTrigger className="w-[140px] rounded-none border border-foreground bg-transparent font-sans text-xs uppercase font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">
                <SelectItem value="all">All Programs</SelectItem>
                {PROGRAMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[110px] rounded-none border border-foreground bg-transparent font-sans text-xs uppercase font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">
                <SelectItem value="all">All Years</SelectItem>
                {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>

            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
              <DialogTrigger asChild>
                <Button className="rounded-none bg-foreground text-background border-2 border-foreground py-2 font-sans font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_#6b3e1a]">
                  <Plus className="w-4 h-4 mr-1 text-background" /> {isCenter ? "New Admission" : "Add Student"}
                </Button>
              </DialogTrigger>
              <StudentDialog editing={editing} centerEmail={isCenter ? user?.email ?? "" : undefined} onSaved={() => { setDialogOpen(false); setEditing(null); load(); }} />
            </Dialog>
          </div>
        </div>

        <div className="overflow-x-auto mt-4 border border-foreground/30">
          <table className="w-full text-sm font-serif-news">
            <thead className="bg-[#f4ecd8] text-left border-b border-foreground/30">
              <tr>
                <Th>Name & Details</Th>
                <Th>Program</Th>
                <Th>Specialization</Th>
                <Th>University</Th>
                <Th>Batch</Th>
                <Th>Location</Th>
                <Th>Status</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-10 text-center italic text-[#6b3e1a]">Loading active intake roster…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-10 text-center italic text-[#6b3e1a]">No applicant records matched your filters.</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="border-t border-foreground/10 hover:bg-[#f4ecd8]/40">
                  <td className="p-4">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      {s.full_name}
                      {s.notes && s.notes.includes("[INVOICE_URL]:") && (
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" title="Invoice Uploaded" />
                      )}
                      {s.notes && s.notes.replace(/\[INVOICE_URL\]:\s*[^\n]+\n?/, "").trim() && (
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500" title="Has Counselor Notes" />
                      )}
                    </div>
                    <div className="text-xs text-[#6b3e1a]">{s.email}</div>
                  </td>
                  <td className="p-4"><span className="font-sans font-bold uppercase text-xs border border-foreground/40 px-1 py-0.5">{s.program}</span></td>
                  <td className="p-4">{s.specialization}</td>
                  <td className="p-4 text-foreground/80">{s.university}</td>
                  <td className="p-4">{s.batch_year}</td>
                  <td className="p-4 text-foreground/80">{s.location}</td>
                  <td className="p-4"><StatusBadge status={s.status} /></td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setDialogOpen(true); }} className="hover:bg-foreground/5" title="Edit Record"><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)} className="hover:bg-destructive/10" title="Delete Record"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`p-4 font-sans font-bold text-xs uppercase tracking-wider text-[#6b3e1a] ${className}`}>{children}</th>;
}

function StatusBadge({ status }: { status: Student["status"] }) {
  const map: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800 border-emerald-500/30",
    inactive: "bg-amber-100 text-amber-800 border-amber-500/30",
    graduated: "bg-[#6b3e1a]/10 text-[#6b3e1a] border-[#6b3e1a]/30",
    suspended: "bg-red-100 text-red-800 border-red-500/30",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-sans font-bold border uppercase tracking-wider ${map[status]}`}>{status}</span>;
}

/* -------------------------- DIALOG -------------------------- */

function blankForm(centerEmail?: string): TablesInsert<"students"> {
  return {
    full_name: "", email: "", phone: "",
    batch_year: new Date().getFullYear() + 1,
    program: "MBA", specialization: "", university: "Mangalayatan University",
    location: "", status: centerEmail ? "inactive" : "active",
    counsellor_name: centerEmail || undefined,
  };
}

function StudentDialog({ editing, centerEmail, onSaved }: { editing: Student | null; centerEmail?: string; onSaved: () => void }) {
  const [form, setForm] = useState<TablesInsert<"students">>(() => editing ?? blankForm(centerEmail));
  const [saving, setSaving] = useState(false);
  const [invoiceUrlInput, setInvoiceUrlInput] = useState("");
  const [generalNotesInput, setGeneralNotesInput] = useState("");

  useEffect(() => {
    const notesText = (editing?.notes) || "";
    const match = notesText.match(/\[INVOICE_URL\]:\s*([^\n]+)/);
    const inv = match ? match[1].trim() : "";
    const gen = notesText.replace(/\[INVOICE_URL\]:\s*[^\n]+\n?/, "").trim();
    setInvoiceUrlInput(inv);
    setGeneralNotesInput(gen);
    setForm(editing ?? blankForm(centerEmail));
  }, [editing]);

  function set<K extends keyof TablesInsert<"students">>(key: K, value: TablesInsert<"students">[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const combinedNotes = (invoiceUrlInput.trim() ? `[INVOICE_URL]: ${invoiceUrlInput.trim()}\n` : "") + generalNotesInput.trim();
    const payload = {
      ...form,
      notes: combinedNotes || null,
      batch_year: Number(form.batch_year),
      phone: form.phone || null,
      location: form.location || form.city || "—",
    };
    const { error } = editing
      ? await supabase.from("students").update(payload).eq("id", editing.id)
      : await supabase.from("students").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Student updated" : "Student added");
    onSaved();
  }

  async function handleUploadInvoice(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${form.id || 'new'}_invoice_${Date.now()}.${fileExt}`;
      const filePath = `invoices/${fileName}`;

      const { data, error } = await supabase.storage
        .from('invoices')
        .upload(filePath, file);

      if (error) {
        toast.error(`Upload failed: ${error.message}. Please enter URL manually.`);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
         .from('invoices')
         .getPublicUrl(filePath);

      setInvoiceUrlInput(publicUrl);
      toast.success("Invoice uploaded to Supabase Storage!");
    } catch (err: any) {
      toast.error("Upload error. Please specify link manually.");
    }
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#fbf6e7] border-4 border-foreground rounded-none">
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl uppercase">Complete Enrollment Record</DialogTitle>
        <DialogDescription className="font-serif-news text-xs italic text-[#6b3e1a]">Personal details, address and academic history verification.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
        <Tabs defaultValue="course" className="w-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full h-auto bg-[#f4ecd8] border border-foreground/30 p-1 gap-1">
            <TabsTrigger value="course" className="rounded-none font-bold uppercase text-[9px] data-[state=active]:bg-foreground data-[state=active]:text-background"><BookOpen className="w-3.5 h-3.5 mr-1" /> Course</TabsTrigger>
            <TabsTrigger value="enrollment" className="rounded-none font-bold uppercase text-[9px] data-[state=active]:bg-foreground data-[state=active]:text-background"><ClipboardList className="w-3.5 h-3.5 mr-1" /> Enrol</TabsTrigger>
            <TabsTrigger value="personal" className="rounded-none font-bold uppercase text-[9px] data-[state=active]:bg-foreground data-[state=active]:text-background"><User className="w-3.5 h-3.5 mr-1" /> Personal</TabsTrigger>
            <TabsTrigger value="address" className="rounded-none font-bold uppercase text-[9px] data-[state=active]:bg-foreground data-[state=active]:text-background"><Home className="w-3.5 h-3.5 mr-1" /> Address</TabsTrigger>
            <TabsTrigger value="education" className="rounded-none font-bold uppercase text-[9px] data-[state=active]:bg-foreground data-[state=active]:text-background"><FileText className="w-3.5 h-3.5 mr-1" /> School</TabsTrigger>
            <TabsTrigger value="fees" className="rounded-none font-bold uppercase text-[9px] data-[state=active]:bg-foreground data-[state=active]:text-background"><Wallet className="w-3.5 h-3.5 mr-1" /> Fees</TabsTrigger>
            <TabsTrigger value="docs" className="rounded-none font-bold uppercase text-[9px] data-[state=active]:bg-foreground data-[state=active]:text-background"><FolderCheck className="w-3.5 h-3.5 mr-1" /> Docs</TabsTrigger>
          </TabsList>

          {/* COURSE */}
          <TabsContent value="course" className="grid gap-4 sm:grid-cols-2 pt-4">
            <Field label="Course / Program" required>
              <Select value={form.program} onValueChange={(v) => set("program", v as ProgramType)}>
                <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{PROGRAMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Specialization" required>
              <Input className="rounded-none border border-foreground bg-transparent" value={form.specialization} onChange={(e) => set("specialization", e.target.value)} maxLength={100} placeholder="e.g. Finance and Management" required />
            </Field>
            <Field label="University" required>
              <Select value={form.university} onValueChange={(v) => set("university", v)}>
                <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{UNIVERSITIES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Batch year" required>
              <Input className="rounded-none border border-foreground bg-transparent" type="number" min={2020} max={2040} value={form.batch_year} onChange={(e) => set("batch_year", Number(e.target.value))} required />
            </Field>
            <Field label="Status" required>
              <Select value={form.status ?? "active"} onValueChange={(v) => set("status", v as Student["status"])}>
                <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </TabsContent>

          {/* ENROLLMENT */}
          <TabsContent value="enrollment" className="grid gap-4 sm:grid-cols-2 pt-4">
            <Field label="Enrollment number">
              <Input className="rounded-none border border-foreground bg-transparent" value={form.enrollment_number ?? ""} onChange={(e) => set("enrollment_number", e.target.value)} maxLength={50} placeholder="e.g. EDU-MBA-2026-0001" />
            </Field>
            <Field label="Admission session">
              <Select value={form.admission_session ?? ""} onValueChange={(v) => set("admission_session", v)}>
                <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue placeholder="January / July" /></SelectTrigger>
                <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{SESSIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Study mode">
              <Select value={form.study_mode ?? ""} onValueChange={(v) => set("study_mode", v)}>
                <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{STUDY_MODES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Medium of instruction">
              <Select value={form.medium_of_instruction ?? ""} onValueChange={(v) => set("medium_of_instruction", v)}>
                <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{MEDIUMS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Course name"><Input className="rounded-none border border-foreground bg-transparent" value={form.course_name ?? ""} onChange={(e) => set("course_name", e.target.value)} maxLength={120} placeholder="Master of Business Administration" /></Field>
            <Field label="Course code"><Input className="rounded-none border border-foreground bg-transparent" value={form.course_code ?? ""} onChange={(e) => set("course_code", e.target.value)} maxLength={30} placeholder="MBA-FIN" /></Field>
            <Field label="Duration (years)"><Input className="rounded-none border border-foreground bg-transparent" type="number" step="0.5" min={0} max={10} value={form.duration_years ?? ""} onChange={(e) => set("duration_years", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Total semesters"><Input className="rounded-none border border-foreground bg-transparent" type="number" min={1} max={12} value={form.total_semesters ?? ""} onChange={(e) => set("total_semesters", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Current semester"><Input className="rounded-none border border-foreground bg-transparent" type="number" min={1} max={12} value={form.current_semester ?? ""} onChange={(e) => set("current_semester", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Counsellor"><Input className="rounded-none border border-foreground bg-transparent" value={form.counsellor_name ?? ""} onChange={(e) => set("counsellor_name", e.target.value)} maxLength={120} /></Field>
            <Field label="Lead source">
              <Select value={form.lead_source ?? ""} onValueChange={(v) => set("lead_source", v)}>
                <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{LEAD_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Referral name"><Input className="rounded-none border border-foreground bg-transparent" value={form.referral_name ?? ""} onChange={(e) => set("referral_name", e.target.value)} maxLength={120} /></Field>
          </TabsContent>

          {/* PERSONAL */}
          <TabsContent value="personal" className="grid gap-4 sm:grid-cols-2 pt-4">
            <Field label="Full name (as per SSLC)" required><Input className="rounded-none border border-foreground bg-transparent" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} maxLength={120} required /></Field>
            <Field label="Father name"><Input className="rounded-none border border-foreground bg-transparent" value={form.father_name ?? ""} onChange={(e) => set("father_name", e.target.value)} maxLength={120} /></Field>
            <Field label="Mother name"><Input className="rounded-none border border-foreground bg-transparent" value={form.mother_name ?? ""} onChange={(e) => set("mother_name", e.target.value)} maxLength={120} /></Field>
            <Field label="Date of birth"><Input className="rounded-none border border-foreground bg-transparent" type="date" value={form.dob ?? ""} onChange={(e) => set("dob", e.target.value || null)} /></Field>
            <Field label="Gender">
              <Select value={form.gender ?? ""} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Category">
              <Select value={form.category ?? ""} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue placeholder="Gen / OBC / SC / ST / Other" /></SelectTrigger>
                <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Employment status">
              <Select value={form.employment_status ?? ""} onValueChange={(v) => set("employment_status", v)}>
                <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{EMPLOYMENT.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Marital status">
              <Select value={form.marital_status ?? ""} onValueChange={(v) => set("marital_status", v)}>
                <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{MARITAL.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Religion"><Input className="rounded-none border border-foreground bg-transparent" value={form.religion ?? ""} onChange={(e) => set("religion", e.target.value)} maxLength={50} /></Field>
            <Field label="Aadhar number"><Input className="rounded-none border border-foreground bg-transparent" value={form.aadhar_number ?? ""} onChange={(e) => set("aadhar_number", e.target.value)} maxLength={20} /></Field>
            <Field label="ABC ID"><Input className="rounded-none border border-foreground bg-transparent" value={form.abc_id ?? ""} onChange={(e) => set("abc_id", e.target.value)} maxLength={30} /></Field>
            <Field label="DEB ID"><Input className="rounded-none border border-foreground bg-transparent" value={form.deb_id ?? ""} onChange={(e) => set("deb_id", e.target.value)} maxLength={30} /></Field>
            <Field label="Email" required><Input className="rounded-none border border-foreground bg-transparent" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={255} required /></Field>
            <Field label="Mobile"><Input className="rounded-none border border-foreground bg-transparent" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} maxLength={20} /></Field>
          </TabsContent>

          {/* ADDRESS */}
          <TabsContent value="address" className="grid gap-4 sm:grid-cols-2 pt-4">
            <div className="sm:col-span-2"><Field label="Address"><Textarea className="rounded-none border border-foreground bg-transparent" value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} maxLength={500} rows={3} /></Field></div>
            <Field label="Pincode"><Input className="rounded-none border border-foreground bg-transparent" value={form.pincode ?? ""} onChange={(e) => set("pincode", e.target.value)} maxLength={10} /></Field>
            <Field label="City"><Input className="rounded-none border border-foreground bg-transparent" value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} maxLength={80} /></Field>
            <Field label="District"><Input className="rounded-none border border-foreground bg-transparent" value={form.district ?? ""} onChange={(e) => set("district", e.target.value)} maxLength={80} /></Field>
            <Field label="State"><Input className="rounded-none border border-foreground bg-transparent" value={form.state ?? ""} onChange={(e) => set("state", e.target.value)} maxLength={80} /></Field>
            <div className="sm:col-span-2"><Field label="Location (display)" required><Input className="rounded-none border border-foreground bg-transparent" value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={120} placeholder="City, State" required /></Field></div>
          </TabsContent>

          {/* EDUCATION */}
          <TabsContent value="education" className="space-y-6 pt-4">
            <EducationBlock title="10th Standard"
              board={form.edu_10_board} year={form.edu_10_year} marks={form.edu_10_marks}
              percentage={form.edu_10_percentage} result={form.edu_10_result}
              onChange={(field, val) => set(`edu_10_${field}` as keyof TablesInsert<"students">, val as never)}
            />
            <EducationBlock title="12th / Diploma"
              board={form.edu_12_board} year={form.edu_12_year} marks={form.edu_12_marks}
              percentage={form.edu_12_percentage} result={form.edu_12_result}
              onChange={(field, val) => set(`edu_12_${field}` as keyof TablesInsert<"students">, val as never)}
            />
            <EducationBlock title="Degree" universityField
              board={form.edu_degree_university} year={form.edu_degree_year} marks={form.edu_degree_marks}
              percentage={form.edu_degree_percentage} result={form.edu_degree_result}
              onChange={(field, val) => {
                const map = { board: "university", year: "year", marks: "marks", percentage: "percentage", result: "result" } as const;
                set(`edu_degree_${map[field]}` as keyof TablesInsert<"students">, val as never);
              }}
            />
          </TabsContent>

          {/* FEES */}
          <TabsContent value="fees" className="grid gap-4 sm:grid-cols-2 pt-4">
            <Field label="Total fee (₹)"><Input className="rounded-none border border-foreground bg-transparent" type="number" min={0} step="0.01" value={form.total_fee ?? ""} onChange={(e) => set("total_fee", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Fee paid (₹)"><Input className="rounded-none border border-foreground bg-transparent" type="number" min={0} step="0.01" value={form.fee_paid ?? ""} onChange={(e) => set("fee_paid", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Fee pending (₹)"><Input className="rounded-none border border-foreground bg-transparent" type="number" min={0} step="0.01" value={form.fee_pending ?? ""} onChange={(e) => set("fee_pending", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Payment status">
              <Select value={form.payment_status ?? ""} onValueChange={(v) => set("payment_status", v)}>
                <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Payment mode">
              <Select value={form.payment_mode ?? ""} onValueChange={(v) => set("payment_mode", v)}>
                <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{PAYMENT_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Last payment date"><Input className="rounded-none border border-foreground bg-transparent" type="date" value={form.last_payment_date ?? ""} onChange={(e) => set("last_payment_date", e.target.value || null)} /></Field>
            <Field label="Next due date"><Input className="rounded-none border border-foreground bg-transparent" type="date" value={form.next_due_date ?? ""} onChange={(e) => set("next_due_date", e.target.value || null)} /></Field>
            
            <div className="sm:col-span-2 border-t border-foreground/20 pt-4 mt-2 grid gap-4 sm:grid-cols-2">
              <Field label="Invoice Receipt Link / PDF URL">
                <Input className="rounded-none border border-foreground bg-transparent font-serif-news text-xs" value={invoiceUrlInput} onChange={(e) => setInvoiceUrlInput(e.target.value)} placeholder="https://..." />
              </Field>
              <div>
                <Label className="font-sans font-bold uppercase tracking-wider text-[10px] block mb-1">Upload Invoice File</Label>
                <Input type="file" onChange={handleUploadInvoice} className="rounded-none border border-foreground bg-transparent text-xs p-1 cursor-pointer" />
              </div>
              <div className="sm:col-span-2">
                <Field label="Counselor / Booking Office Notes">
                  <Textarea className="rounded-none border border-foreground bg-transparent font-serif-news text-xs" value={generalNotesInput} onChange={(e) => setGeneralNotesInput(e.target.value)} placeholder="Enter counselor notes, details of past sessions, pending items..." rows={3} />
                </Field>
              </div>
            </div>
          </TabsContent>

          {/* DOCS */}
          <TabsContent value="docs" className="pt-4">
            <p className="font-serif-news text-xs italic text-[#6b3e1a] mb-4">Tick each document once it has been received and verified.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["doc_photo", "Passport-size photo"],
                ["doc_signature", "Signature scan"],
                ["doc_id_proof", "ID proof (Aadhar / PAN)"],
                ["doc_marksheet_10", "10th marksheet"],
                ["doc_marksheet_12", "12th / Diploma marksheet"],
                ["doc_marksheet_degree", "Degree marksheet"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 border-2 border-foreground p-3 cursor-pointer hover:bg-foreground/5 rounded-none">
                  <Checkbox
                    checked={Boolean(form[key as keyof TablesInsert<"students">])}
                    onCheckedChange={(v) => set(key as keyof TablesInsert<"students">, Boolean(v) as never)}
                    className="border-2 border-foreground rounded-none"
                  />
                  <span className="text-xs uppercase font-bold tracking-wider">{label}</span>
                </label>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4">
          <Button type="submit" disabled={saving} className="rounded-none bg-foreground text-background border-2 border-foreground py-3 font-sans font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_#6b3e1a]">
            {saving ? "Saving Record..." : editing ? "Save Credentials" : "Add Student"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function EducationBlock({
  title, universityField, board, year, marks, percentage, result, onChange,
}: {
  title: string;
  universityField?: boolean;
  board: string | null | undefined;
  year: number | null | undefined;
  marks: string | null | undefined;
  percentage: number | null | undefined;
  result: string | null | undefined;
  onChange: (field: "board" | "year" | "marks" | "percentage" | "result", value: string | number | null) => void;
}) {
  return (
    <div className="border-2 border-foreground p-4 bg-[#f4ecd8]/40 rounded-none">
      <h3 className="font-sans font-bold uppercase tracking-wider text-[#6b3e1a] mb-3">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label={universityField ? "University" : "Board Name"}>
          <Input className="rounded-none border border-foreground bg-transparent" value={board ?? ""} onChange={(e) => onChange("board", e.target.value)} maxLength={120} />
        </Field>
        <Field label="Year of Passing">
          <Input className="rounded-none border border-foreground bg-transparent" type="number" min={1980} max={2040} value={year ?? ""} onChange={(e) => onChange("year", e.target.value ? Number(e.target.value) : null)} />
        </Field>
        <Field label={universityField ? "Consolidated Marks" : "Marks"}>
          <Input className="rounded-none border border-foreground bg-transparent" value={marks ?? ""} onChange={(e) => onChange("marks", e.target.value)} maxLength={50} />
        </Field>
        <Field label={universityField ? "Consolidated %" : "Percentage"}>
          <Input className="rounded-none border border-foreground bg-transparent" type="number" step="0.01" min={0} max={100} value={percentage ?? ""} onChange={(e) => onChange("percentage", e.target.value ? Number(e.target.value) : null)} />
        </Field>
        <Field label="Result">
          <Select value={result ?? ""} onValueChange={(v) => onChange("result", v)}>
            <SelectTrigger className="rounded-none border border-foreground bg-transparent"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent className="bg-[#fbf6e7] border border-foreground rounded-none">{RESULTS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="font-sans font-bold uppercase tracking-wider text-[10px] block">{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
    </div>
  );
}

/* -------------------------- STUDENT PANEL -------------------------- */

function StudentPanel({ email }: { email: string }) {
  const [record, setRecord] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("students").select("*").eq("email", email).maybeSingle();
      setRecord(data);
      setLoading(false);
    })();
  }, [email]);

  const notesText = record?.notes || "";
  const match = notesText.match(/\[INVOICE_URL\]:\s*([^\n]+)/);
  const invoiceUrl = match ? match[1].trim() : "";
  const generalNotes = notesText.replace(/\[INVOICE_URL\]:\s*[^\n]+\n?/, "").trim();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-headline text-4xl uppercase tracking-tight">Academic Intake Ledger</h1>
        <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Your verified enrollment details, credentials and fee record.</p>
      </div>

      {loading ? (
        <div className="bg-[#fbf6e7] border-4 border-foreground p-10 text-center font-serif-news italic">Loading verified credentials ledger…</div>
      ) : !record ? (
        <div className="bg-[#fbf6e7] border-4 border-foreground p-10 text-center shadow-[6px_6px_0px_0px_#1a1410]">
          <h3 className="font-headline text-2xl uppercase">No enrolment records active</h3>
          <p className="font-serif-news text-sm mt-2 max-w-lg mx-auto">Your portal registration is active. Once our admissions team verifies your credentials, your ledger will be loaded.</p>
          <p className="text-xs font-sans font-bold text-[#6b3e1a] mt-4 uppercase">Applicant Account: {email}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#fbf6e7] border-4 border-foreground p-8 shadow-[6px_6px_0px_0px_#1a1410]">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-foreground/30 pb-4">
              <div>
                <div className="font-sans font-bold uppercase tracking-wider text-xs text-[#6b3e1a]">Registered Active Degree</div>
                <h2 className="font-headline text-3xl mt-1">{record.program} · {record.specialization}</h2>
                <div className="font-serif-news text-sm italic mt-1 text-foreground/80">{record.university}</div>
              </div>
              <StatusBadge status={record.status} />
            </div>
            
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Info icon={GraduationCap} label="Academic Session" value={`${record.admission_session || "July"} ${record.batch_year}`} />
              <Info icon={BookOpen} label="Study Delivery Mode" value={record.study_mode || "Online"} />
              <Info icon={MapPin} label="Intake Location" value={record.location} />
              <Info icon={Mail} label="Academic Email" value={record.email} />
              {record.phone && <Info icon={Phone} label="Contact Phone" value={record.phone} />}
            </div>
          </div>

          <DetailSection title="Personal details" rows={[
            ["Full name", record.full_name],
            ["Father name", record.father_name],
            ["Mother name", record.mother_name],
            ["Date of birth", record.dob],
            ["Gender", record.gender],
            ["Category", record.category],
            ["Employment", record.employment_status],
            ["Marital status", record.marital_status],
            ["Religion", record.religion],
            ["Aadhar", record.aadhar_number],
            ["ABC ID", record.abc_id],
            ["DEB ID", record.deb_id],
          ]} />

          <DetailSection title="Address" rows={[
            ["Address", record.address],
            ["City", record.city],
            ["District", record.district],
            ["State", record.state],
            ["Pincode", record.pincode],
          ]} />

          <DetailSection title="10th Standard" rows={[
            ["Board", record.edu_10_board],
            ["Year", record.edu_10_year],
            ["Marks", record.edu_10_marks],
            ["Percentage", record.edu_10_percentage],
            ["Result", record.edu_10_result],
          ]} />

          <DetailSection title="12th / Diploma" rows={[
            ["Board", record.edu_12_board],
            ["Year", record.edu_12_year],
            ["Marks", record.edu_12_marks],
            ["Percentage", record.edu_12_percentage],
            ["Result", record.edu_12_result],
          ]} />

          <DetailSection title="Degree" rows={[
            ["University", record.edu_degree_university],
            ["Year", record.edu_degree_year],
            ["Marks", record.edu_degree_marks],
            ["Percentage", record.edu_degree_percentage],
            ["Result", record.edu_degree_result],
          ]} />

          <DetailSection title="Enrollment" rows={[
            ["Enrollment number", record.enrollment_number],
            ["Admission session", record.admission_session],
            ["Study mode", record.study_mode],
            ["Medium", record.medium_of_instruction],
            ["Course name", record.course_name],
            ["Course code", record.course_code],
            ["Duration (years)", record.duration_years],
            ["Current semester", record.current_semester],
            ["Total semesters", record.total_semesters],
            ["Counsellor", record.counsellor_name],
            ["Lead source", record.lead_source],
            ["Referral", record.referral_name],
          ]} />

          <DetailSection title="Fees Status" rows={[
            ["Total fee", record.total_fee != null ? `₹ ${record.total_fee}` : null],
            ["Fee paid", record.fee_paid != null ? `₹ ${record.fee_paid}` : null],
            ["Fee pending", record.fee_pending != null ? `₹ ${record.fee_pending}` : null],
            ["Payment status", record.payment_status],
            ["Payment mode", record.payment_mode],
            ["Last payment", record.last_payment_date],
            ["Next due", record.next_due_date],
          ]} />

          {(invoiceUrl || generalNotes) && (
            <div className="bg-[#fbf6e7] border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_#1a1410] grid gap-6 md:grid-cols-2">
              {invoiceUrl && (
                <div className="space-y-2">
                  <h3 className="font-headline text-xl uppercase border-b border-foreground/30 pb-1 text-[#6b3e1a]">Official Fee Invoice</h3>
                  <p className="font-serif-news text-xs italic text-foreground/80">Please download or print your verified ledger receipt for your records.</p>
                  <div className="pt-2">
                    <a href={invoiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-foreground text-background border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] px-4 py-2.5 hover:bg-transparent hover:text-foreground transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download / View PDF Invoice
                    </a>
                  </div>
                </div>
              )}
              {generalNotes && (
                <div className="space-y-2">
                  <h3 className="font-headline text-xl uppercase border-b border-foreground/30 pb-1 text-[#6b3e1a]">Counselor Desk Remarks</h3>
                  <div className="font-serif-news text-xs leading-relaxed bg-[#f4ecd8] border border-foreground/30 p-4 italic text-foreground/90 whitespace-pre-line rounded-none">
                    "{generalNotes}"
                  </div>
                </div>
              )}
            </div>
          )}

          <DetailSection title="Documents submitted" rows={[
            ["Photo", record.doc_photo ? "✓ Received" : "Pending"],
            ["Signature", record.doc_signature ? "✓ Received" : "Pending"],
            ["ID proof", record.doc_id_proof ? "✓ Received" : "Pending"],
            ["10th marksheet", record.doc_marksheet_10 ? "✓ Received" : "Pending"],
            ["12th marksheet", record.doc_marksheet_12 ? "✓ Received" : "Pending"],
            ["Degree marksheet", record.doc_marksheet_degree ? "✓ Received" : "Pending"],
          ]} />
        </div>
      )}
    </div>
  );
}

function DetailSection({ title, rows }: { title: string; rows: Array<[string, string | number | null | undefined]> }) {
  const hasAny = rows.some(([, v]) => v !== null && v !== undefined && v !== "");
  if (!hasAny) return null;
  return (
    <div className="bg-[#fbf6e7] border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_#1a1410]">
      <h3 className="font-headline text-2xl uppercase border-b border-foreground/30 pb-2 mb-4">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 font-serif-news text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="border-b border-foreground/10 pb-1">
            <div className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#6b3e1a]">{label}</div>
            <div className="font-medium mt-0.5">{value ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-[#f4ecd8]/40 border-2 border-foreground rounded-none">
      <span className="grid place-items-center w-9 h-9 border border-foreground bg-foreground text-background shrink-0"><Icon className="w-4 h-4 text-background" /></span>
      <div>
        <div className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#6b3e1a]">{label}</div>
        <div className="font-serif-news text-sm font-medium mt-0.5">{value}</div>
      </div>
    </div>
  );
}
