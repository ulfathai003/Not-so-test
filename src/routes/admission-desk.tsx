import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  BookOpen, Calendar, User, FileText, CheckCircle2, 
  Download, ArrowRight, ArrowLeft, Save, Sparkles, ShieldCheck 
} from "lucide-react";

export const Route = createFileRoute("/admission-desk")({
  head: () => ({
    meta: [
      { title: "Admissions Intake Desk | EduConnect Times" },
      { name: "description", content: "Apply for Online MBA, BBA and distance courses. Mondrian editorial intake desk." },
    ],
  }),
  component: AdmissionDeskPage,
});

const PROGRAMS = ["10th", "12th Arts", "12th Commerce", "12th Science", "BBA", "MBA"];
const UNIVERSITIES = ["Mangalayatan University", "Jain University", "Manipal University", "Amity University", "NMIMS", "IGNOU", "LPU"];
const GENDERS = ["Male", "Female", "Other"];
const CATEGORIES = ["General", "OBC", "SC", "ST", "Other"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed", "Other"];
const EMPLOYMENT_STATUSES = ["Student", "Employed", "Unemployed", "Self-employed", "Other"];
const RESULTS = ["Pass", "Fail", "Distinction", "First Class", "Second Class"];
const SESSIONS = ["January", "July"];
const STUDY_MODES = ["Online", "Distance", "Hybrid"];
const MEDIUMS = ["English", "Hindi", "Bilingual"];

interface FormState {
  program: string;
  university: string;
  specialization: string;
  medium_of_instruction: string;
  admission_session: string;
  study_mode: string;
  full_name: string;
  father_name: string;
  mother_name: string;
  dob: string;
  gender: string;
  category: string;
  religion: string;
  marital_status: string;
  employment_status: string;
  aadhar_number: string;
  abc_id: string;
  deb_id: string;
  phone: string;
  location: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  edu_10_board: string;
  edu_10_year: string;
  edu_10_marks: string;
  edu_10_percentage: string;
  edu_10_result: string;
  edu_12_board: string;
  edu_12_year: string;
  edu_12_marks: string;
  edu_12_percentage: string;
  edu_12_result: string;
  edu_degree_university: string;
  edu_degree_year: string;
  edu_degree_marks: string;
  edu_degree_percentage: string;
  edu_degree_result: string;
  doc_photo: boolean;
  doc_signature: boolean;
  doc_id_proof: boolean;
  doc_marksheet_10: boolean;
  doc_marksheet_12: boolean;
  doc_marksheet_degree: boolean;
}

const initialFormState: FormState = {
  program: "MBA",
  university: "Jain University",
  specialization: "Marketing",
  medium_of_instruction: "English",
  admission_session: "January",
  study_mode: "Online",
  full_name: "",
  father_name: "",
  mother_name: "",
  dob: "",
  gender: "Male",
  category: "General",
  religion: "",
  marital_status: "Single",
  employment_status: "Student",
  aadhar_number: "",
  abc_id: "",
  deb_id: "",
  phone: "",
  location: "",
  address: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
  edu_10_board: "",
  edu_10_year: "",
  edu_10_marks: "",
  edu_10_percentage: "",
  edu_10_result: "Pass",
  edu_12_board: "",
  edu_12_year: "",
  edu_12_marks: "",
  edu_12_percentage: "",
  edu_12_result: "Pass",
  edu_degree_university: "",
  edu_degree_year: "",
  edu_degree_marks: "",
  edu_degree_percentage: "",
  edu_degree_result: "Pass",
  doc_photo: false,
  doc_signature: false,
  doc_id_proof: false,
  doc_marksheet_10: false,
  doc_marksheet_12: false,
  doc_marksheet_degree: false,
};

function AdmissionDeskPage() {
  const { user, studentData, refetchStudent } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [declaration, setDeclaration] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("educonnect_admissions_draft");
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Error loading draft", e);
      }
    }
  }, []);

  // Autofill from studentData or user metadata if fields are empty
  useEffect(() => {
    if (studentData) {
      setFormData((prev) => ({
        ...prev,
        program: prev.program || studentData.program || "MBA",
        university: prev.university || studentData.university || "Jain University",
        specialization: prev.specialization || studentData.specialization || "",
        medium_of_instruction: prev.medium_of_instruction || studentData.medium_of_instruction || "English",
        admission_session: prev.admission_session || studentData.admission_session || "January",
        study_mode: prev.study_mode || studentData.study_mode || "Online",
        full_name: prev.full_name || studentData.full_name || "",
        father_name: prev.father_name || studentData.father_name || "",
        mother_name: prev.mother_name || studentData.mother_name || "",
        dob: prev.dob || studentData.dob || "",
        gender: prev.gender || studentData.gender || "Male",
        category: prev.category || studentData.category || "General",
        aadhar_number: prev.aadhar_number || studentData.aadhar_number || "",
        phone: prev.phone || studentData.phone || "",
        location: prev.location || studentData.location || "",
        address: prev.address || studentData.address || "",
        state: prev.state || studentData.state || "",
        pincode: prev.pincode || studentData.pincode || "",
        edu_10_board: prev.edu_10_board || studentData.edu_10_board || "",
        edu_10_year: prev.edu_10_year || (studentData.edu_10_year ? String(studentData.edu_10_year) : ""),
        edu_10_percentage: prev.edu_10_percentage || (studentData.edu_10_percentage ? String(studentData.edu_10_percentage) : ""),
        edu_10_result: prev.edu_10_result || studentData.edu_10_result || "Pass",
        edu_12_board: prev.edu_12_board || studentData.edu_12_board || "",
        edu_12_year: prev.edu_12_year || (studentData.edu_12_year ? String(studentData.edu_12_year) : ""),
        edu_12_percentage: prev.edu_12_percentage || (studentData.edu_12_percentage ? String(studentData.edu_12_percentage) : ""),
        edu_12_result: prev.edu_12_result || studentData.edu_12_result || "Pass",
        edu_degree_university: prev.edu_degree_university || studentData.edu_degree_university || "",
        edu_degree_year: prev.edu_degree_year || (studentData.edu_degree_year ? String(studentData.edu_degree_year) : ""),
        edu_degree_percentage: prev.edu_degree_percentage || (studentData.edu_degree_percentage ? String(studentData.edu_degree_percentage) : ""),
        edu_degree_result: prev.edu_degree_result || studentData.edu_degree_result || "Pass",
        religion: prev.religion || studentData.religion || "",
        marital_status: prev.marital_status || studentData.marital_status || "Single",
        employment_status: prev.employment_status || studentData.employment_status || "Student",
        abc_id: prev.abc_id || studentData.abc_id || "",
        deb_id: prev.deb_id || studentData.deb_id || "",
        city: prev.city || studentData.city || "",
        district: prev.district || studentData.district || "",
        edu_10_marks: prev.edu_10_marks || studentData.edu_10_marks || "",
        edu_12_marks: prev.edu_12_marks || studentData.edu_12_marks || "",
        edu_degree_marks: prev.edu_degree_marks || studentData.edu_degree_marks || "",
        doc_photo: prev.doc_photo || !!studentData.doc_photo,
        doc_signature: prev.doc_signature || !!studentData.doc_signature,
        doc_id_proof: prev.doc_id_proof || !!studentData.doc_id_proof,
        doc_marksheet_10: prev.doc_marksheet_10 || !!studentData.doc_marksheet_10,
        doc_marksheet_12: prev.doc_marksheet_12 || !!studentData.doc_marksheet_12,
        doc_marksheet_degree: prev.doc_marksheet_degree || !!studentData.doc_marksheet_degree,
      }));
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: prev.full_name || user.user_metadata?.full_name || "",
      }));
    }
  }, [studentData, user]);

  // Sync draft to localStorage on change
  const updateField = (key: keyof FormState, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    localStorage.setItem("educonnect_admissions_draft", JSON.stringify(updated));
  };

  const handleSaveDraft = async () => {
    localStorage.setItem("educonnect_admissions_draft", JSON.stringify(formData));
    toast.success("Draft application saved to local storage!");

    if (user) {
      try {
        const { error } = await supabase.from("students").upsert({
          email: user.email!.trim().toLowerCase(),
          full_name: formData.full_name || "Draft Applicant",
          program: formData.program as any,
          university: formData.university,
          specialization: formData.specialization,
          medium_of_instruction: formData.medium_of_instruction,
          admission_session: formData.admission_session,
          study_mode: formData.study_mode,
          father_name: formData.father_name,
          mother_name: formData.mother_name,
          dob: formData.dob || null,
          gender: formData.gender,
          category: formData.category,
          religion: formData.religion,
          marital_status: formData.marital_status,
          employment_status: formData.employment_status,
          aadhar_number: formData.aadhar_number,
          abc_id: formData.abc_id,
          deb_id: formData.deb_id,
          phone: formData.phone,
          location: formData.location || "Online Intake",
          address: formData.address,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
          edu_10_board: formData.edu_10_board,
          edu_10_year: formData.edu_10_year ? parseInt(formData.edu_10_year) : null,
          edu_10_marks: formData.edu_10_marks,
          edu_10_percentage: formData.edu_10_percentage ? parseFloat(formData.edu_10_percentage) : null,
          edu_10_result: formData.edu_10_result,
          edu_12_board: formData.edu_12_board,
          edu_12_year: formData.edu_12_year ? parseInt(formData.edu_12_year) : null,
          edu_12_marks: formData.edu_12_marks,
          edu_12_percentage: formData.edu_12_percentage ? parseFloat(formData.edu_12_percentage) : null,
          edu_12_result: formData.edu_12_result,
          edu_degree_university: formData.edu_degree_university,
          edu_degree_year: formData.edu_degree_year ? parseInt(formData.edu_degree_year) : null,
          edu_degree_marks: formData.edu_degree_marks,
          edu_degree_percentage: formData.edu_degree_percentage ? parseFloat(formData.edu_degree_percentage) : null,
          edu_degree_result: formData.edu_degree_result,
          doc_photo: formData.doc_photo,
          doc_signature: formData.doc_signature,
          doc_id_proof: formData.doc_id_proof,
          doc_marksheet_10: formData.doc_marksheet_10,
          doc_marksheet_12: formData.doc_marksheet_12,
          doc_marksheet_degree: formData.doc_marksheet_degree,
          status: "inactive", // applicants start as inactive
          batch_year: 2026,
        });

        if (error) {
          console.error("Supabase upsert error:", error);
          toast.info("Saved locally. Sign in to back up your draft online.");
        } else {
          toast.success("Draft synced with your online profile!");
          refetchStudent();
        }
      } catch (err) {
        console.error("Database connection issue:", err);
      }
    } else {
      toast.info("Create an account or sign in to save this draft online!");
    }
  };

  const handlePrintSummary = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>EduConnect Times - Application Voucher</title>
          <style>
            body { font-family: 'Georgia', serif; background-color: #fbf6e7; color: #1a1410; padding: 40px; }
            .receipt { border: 4px double #1a1410; padding: 30px; max-width: 650px; margin: 0 auto; background: #fff; }
            .header { text-align: center; border-bottom: 2px solid #1a1410; padding-bottom: 20px; }
            .title { font-size: 28px; font-weight: bold; text-transform: uppercase; margin: 0; }
            .subtitle { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 5px 0 0; }
            .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
            .field { border-bottom: 1px solid #1a1410/20; padding-bottom: 5px; }
            .label { font-size: 10px; text-transform: uppercase; font-family: sans-serif; font-weight: bold; color: #6b3e1a; }
            .val { font-size: 15px; margin-top: 3px; }
            .fineprint { font-size: 10px; text-align: center; border-top: 1px solid #1a1410; padding-top: 15px; margin-top: 25px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="title">EduConnect Times</div>
              <div class="subtitle">Official Admissions Desk Voucher · Batch of 2026</div>
            </div>
            <div class="field-grid">
              <div class="field">
                <div class="label">Applicant Name</div>
                <div class="val">${formData.full_name || "Not Provided"}</div>
              </div>
              <div class="field">
                <div class="label">Program & University</div>
                <div class="val">${formData.program} - ${formData.university}</div>
              </div>
              <div class="field">
                <div class="label">Specialization</div>
                <div class="val">${formData.specialization}</div>
              </div>
              <div class="field">
                <div class="label">Cohort Session</div>
                <div class="val">${formData.admission_session} 2026</div>
              </div>
              <div class="field">
                <div class="label">Aadhar Number</div>
                <div class="val">${formData.aadhar_number || "Not Provided"}</div>
              </div>
              <div class="field">
                <div class="label">Contact Phone</div>
                <div class="val">${formData.phone || "Not Provided"}</div>
              </div>
            </div>
            <div class="fineprint">
              This document serves as a verified admissions draft summary receipt. To complete the enrolment process, please register your account and upload required documents.
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!declaration) {
      return toast.error("Please agree to the UGC-DEB and Academic Integrity declaration.");
    }

    if (!formData.full_name || !formData.phone || !formData.aadhar_number) {
      return toast.error("Please fill in key applicant details (Name, Phone, Aadhaar).");
    }

    if (!formData.doc_marksheet_10 || !formData.doc_photo || !formData.doc_id_proof) {
      return toast.error("Mandatory documents missing! Please ensure 10th Marks, Photograph, and Aadhaar (ID Proof) are marked as ready.");
    }

    setSubmitting(true);

    try {
      // 1. Submit to Supabase if logged in
      if (user) {
        const { error } = await supabase.from("students").upsert({
          email: user.email!.trim().toLowerCase(),
          full_name: formData.full_name,
          program: formData.program as any,
          university: formData.university,
          specialization: formData.specialization,
          medium_of_instruction: formData.medium_of_instruction,
          admission_session: formData.admission_session,
          study_mode: formData.study_mode,
          father_name: formData.father_name,
          mother_name: formData.mother_name,
          dob: formData.dob || null,
          gender: formData.gender,
          category: formData.category,
          religion: formData.religion,
          marital_status: formData.marital_status,
          employment_status: formData.employment_status,
          aadhar_number: formData.aadhar_number,
          abc_id: formData.abc_id,
          deb_id: formData.deb_id,
          phone: formData.phone,
          location: formData.location || "Online Intake",
          address: formData.address,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
          edu_10_board: formData.edu_10_board,
          edu_10_year: formData.edu_10_year ? parseInt(formData.edu_10_year) : null,
          edu_10_marks: formData.edu_10_marks,
          edu_10_percentage: formData.edu_10_percentage ? parseFloat(formData.edu_10_percentage) : null,
          edu_10_result: formData.edu_10_result,
          edu_12_board: formData.edu_12_board,
          edu_12_year: formData.edu_12_year ? parseInt(formData.edu_12_year) : null,
          edu_12_marks: formData.edu_12_marks,
          edu_12_percentage: formData.edu_12_percentage ? parseFloat(formData.edu_12_percentage) : null,
          edu_12_result: formData.edu_12_result,
          edu_degree_university: formData.edu_degree_university,
          edu_degree_year: formData.edu_degree_year ? parseInt(formData.edu_degree_year) : null,
          edu_degree_marks: formData.edu_degree_marks,
          edu_degree_percentage: formData.edu_degree_percentage ? parseFloat(formData.edu_degree_percentage) : null,
          edu_degree_result: formData.edu_degree_result,
          doc_photo: formData.doc_photo,
          doc_signature: formData.doc_signature,
          doc_id_proof: formData.doc_id_proof,
          doc_marksheet_10: formData.doc_marksheet_10,
          doc_marksheet_12: formData.doc_marksheet_12,
          doc_marksheet_degree: formData.doc_marksheet_degree,
          status: "inactive", // applicants start as inactive
          batch_year: 2026,
        });

        if (error) {
          console.error("Error inserting record:", error);
          throw error;
        }
      }

      // 2. Submit to ulfathai003@gmail.com using FormSubmit AJAX
      const emailBody = {
        _subject: `New Admissions Intake Submission - ${formData.full_name} (${formData.program})`,
        applicant_name: formData.full_name,
        email: user?.email || "guest@applicant.com",
        phone: formData.phone,
        aadhar: formData.aadhar_number,
        program: formData.program,
        university: formData.university,
        specialization: formData.specialization,
        study_mode: formData.study_mode,
        session: formData.admission_session,
        father_name: formData.father_name,
        mother_name: formData.mother_name,
        dob: formData.dob,
        gender: formData.gender,
        category: formData.category,
        religion: formData.religion,
        marital_status: formData.marital_status,
        employment_status: formData.employment_status,
        abc_id: formData.abc_id,
        deb_id: formData.deb_id,
        location: formData.location,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        ten_board: formData.edu_10_board,
        ten_year: formData.edu_10_year,
        ten_marks: formData.edu_10_marks,
        ten_percent: formData.edu_10_percentage,
        ten_result: formData.edu_10_result,
        twelve_board: formData.edu_12_board,
        twelve_year: formData.edu_12_year,
        twelve_marks: formData.edu_12_marks,
        twelve_percent: formData.edu_12_percentage,
        twelve_result: formData.edu_12_result,
        degree_uni: formData.edu_degree_university,
        degree_year: formData.edu_degree_year,
        degree_marks: formData.edu_degree_marks,
        degree_percent: formData.edu_degree_percentage,
        degree_result: formData.edu_degree_result,
      };

      const response = await fetch("https://formsubmit.co/ajax/ulfathai003@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(emailBody)
      });

      if (!response.ok) {
        throw new Error("FormSubmit delivery failed.");
      }

      toast.success("Application successfully submitted directly to the desk!");
      localStorage.removeItem("educonnect_admissions_draft");

      if (user) {
        await refetchStudent();
        navigate({ to: "/dashboard" });
      } else {
        toast.info("Please create an account to track your submitted application!");
        navigate({ to: "/signup" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit. Saved draft locally. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col news-paper">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8 flex-1 max-w-5xl">
        {/* Desk Header */}
        <section className="text-center mb-8">
          <p className="news-kicker">Desk Command · Official Form</p>
          <h2 className="mt-2 font-headline text-4xl md:text-6xl uppercase tracking-tight">
            Admissions Intake Portal
          </h2>
          <p className="mt-2 font-serif-news text-sm italic text-[#6b3e1a]">
            Submit credentials for Indian UGC-DEB Approved Online Degrees
          </p>
          <div className="news-rule mt-4" />
        </section>

        {/* Step Navigation Bar */}
        <div className="grid grid-cols-6 gap-2 mb-8 border-b-2 border-foreground pb-4 font-sans text-xs uppercase tracking-wider font-bold">
          {[
            { n: 1, label: "Program" },
            { n: 2, label: "Mode" },
            { n: 3, label: "Personal" },
            { n: 4, label: "Academic" },
            { n: 5, label: "Documents" },
            { n: 6, label: "Declaration" }
          ].map((s) => (
            <button
              key={s.n}
              onClick={() => setStep(s.n)}
              className={`pb-2 border-b-4 text-center transition-all ${
                step === s.n 
                  ? "border-foreground text-[#1a1410]" 
                  : "border-transparent text-[#1a1410]/40 hover:text-foreground"
              }`}
            >
              <span className="hidden sm:inline">Step {s.n}: {s.label}</span>
              <span className="sm:hidden">{s.n}</span>
            </button>
          ))}
        </div>

        {/* Form Container with Brutalist Shadows */}
        <div className="bg-[#fbf6e7] border-4 border-foreground p-6 sm:p-10 shadow-[10px_10px_0px_0px_#1a1410]">
          
          {/* Step 1: Program Choice */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-foreground/30 pb-4">
                <h3 className="font-headline text-3xl uppercase">Step 1: Academic Track</h3>
                <p className="font-serif-news text-sm italic text-[#6b3e1a]">Select your course type and target university.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs block">Choose Program</Label>
                  <Select value={formData.program} onValueChange={(val) => updateField("program", val)}>
                    <SelectTrigger className="rounded-none border-2 border-foreground bg-transparent font-sans">
                      <SelectValue placeholder="Select Program" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                      {PROGRAMS.map((p) => (
                        <SelectItem key={p} value={p} className="hover:bg-foreground hover:text-background">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs block">Target University</Label>
                  <Select value={formData.university} onValueChange={(val) => updateField("university", val)}>
                    <SelectTrigger className="rounded-none border-2 border-foreground bg-transparent font-sans">
                      <SelectValue placeholder="Select University" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                      {UNIVERSITIES.map((u) => (
                        <SelectItem key={u} value={u} className="hover:bg-foreground hover:text-background">{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs block">Course Specialization</Label>
                  <Input 
                    value={formData.specialization} 
                    onChange={(e) => updateField("specialization", e.target.value)} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                    placeholder="e.g. Finance, Marketing, IT"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs block">Medium of Instruction</Label>
                  <Select value={formData.medium_of_instruction} onValueChange={(val) => updateField("medium_of_instruction", val)}>
                    <SelectTrigger className="rounded-none border-2 border-foreground bg-transparent font-sans">
                      <SelectValue placeholder="Select Medium" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                      {MEDIUMS.map((m) => (
                        <SelectItem key={m} value={m} className="hover:bg-foreground hover:text-background">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Intake Session & Mode */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-foreground/30 pb-4">
                <h3 className="font-headline text-3xl uppercase">Step 2: Session & Study Mode</h3>
                <p className="font-serif-news text-sm italic text-[#6b3e1a]">Choose your entry point and study delivery system.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs block">Admission Session</Label>
                  <Select value={formData.admission_session} onValueChange={(val) => updateField("admission_session", val)}>
                    <SelectTrigger className="rounded-none border-2 border-foreground bg-transparent font-sans">
                      <SelectValue placeholder="Select Session" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                      {SESSIONS.map((s) => (
                        <SelectItem key={s} value={s} className="hover:bg-foreground hover:text-background">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-wider text-xs block">Study Mode</Label>
                  <Select value={formData.study_mode} onValueChange={(val) => updateField("study_mode", val)}>
                    <SelectTrigger className="rounded-none border-2 border-foreground bg-transparent font-sans">
                      <SelectValue placeholder="Select Study Mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                      {STUDY_MODES.map((sm) => (
                        <SelectItem key={sm} value={sm} className="hover:bg-foreground hover:text-background">{sm}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Personal Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-foreground/30 pb-4">
                <h3 className="font-headline text-3xl uppercase">Step 3: Personal Details</h3>
                <p className="font-serif-news text-sm italic text-[#6b3e1a]">Official details as they appear on your Aadhar and certificates.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="font-bold uppercase tracking-wider text-xs block">Full Name</Label>
                  <Input 
                    id="full_name"
                    name="name"
                    autoComplete="name"
                    value={formData.full_name} 
                    onChange={(e) => updateField("full_name", e.target.value)} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                    placeholder="As per Marksheet"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="father_name" className="font-bold uppercase tracking-wider text-xs block">Father's Name</Label>
                  <Input 
                    id="father_name"
                    name="father_name"
                    value={formData.father_name} 
                    onChange={(e) => updateField("father_name", e.target.value)} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mother_name" className="font-bold uppercase tracking-wider text-xs block">Mother's Name</Label>
                  <Input 
                    id="mother_name"
                    name="mother_name"
                    value={formData.mother_name} 
                    onChange={(e) => updateField("mother_name", e.target.value)} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="font-bold uppercase tracking-wider text-xs block">Date of Birth</Label>
                  <Input 
                    id="dob"
                    name="bday"
                    autoComplete="bday"
                    type="date" 
                    value={formData.dob} 
                    onChange={(e) => updateField("dob", e.target.value)} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="font-bold uppercase tracking-wider text-xs block">Gender</Label>
                  <Select value={formData.gender} onValueChange={(val) => updateField("gender", val)}>
                    <SelectTrigger id="gender" className="rounded-none border-2 border-foreground bg-transparent font-sans">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g} className="hover:bg-foreground hover:text-background">{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="font-bold uppercase tracking-wider text-xs block">Category</Label>
                  <Select value={formData.category} onValueChange={(val) => updateField("category", val)}>
                    <SelectTrigger id="category" className="rounded-none border-2 border-foreground bg-transparent font-sans">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="hover:bg-foreground hover:text-background">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadhar_number" className="font-bold uppercase tracking-wider text-xs block">Aadhar Number</Label>
                  <Input 
                    id="aadhar_number"
                    name="aadhar_number"
                    value={formData.aadhar_number} 
                    onChange={(e) => updateField("aadhar_number", e.target.value)} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                    placeholder="12-digit number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold uppercase tracking-wider text-xs block">Phone Number</Label>
                  <Input 
                    id="phone"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone} 
                    onChange={(e) => updateField("phone", e.target.value)} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                    placeholder="10-digit mobile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="font-bold uppercase tracking-wider text-xs block">City / Village (Display)</Label>
                  <Input 
                    id="location"
                    name="city"
                    autoComplete="address-level2"
                    value={formData.location} 
                    onChange={(e) => updateField("location", e.target.value)} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="font-bold uppercase tracking-wider text-xs block">City</Label>
                  <Input 
                    id="city"
                    value={formData.city} 
                    onChange={(e) => {
                      updateField("city", e.target.value);
                      if (!formData.location) {
                        updateField("location", e.target.value);
                      }
                    }} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                    placeholder="e.g. Belagavi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district" className="font-bold uppercase tracking-wider text-xs block">District</Label>
                  <Input 
                    id="district"
                    value={formData.district} 
                    onChange={(e) => updateField("district", e.target.value)} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                    placeholder="e.g. Belagavi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="religion" className="font-bold uppercase tracking-wider text-xs block">Religion</Label>
                  <Input 
                    id="religion"
                    value={formData.religion} 
                    onChange={(e) => updateField("religion", e.target.value)} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                    placeholder="e.g. Hindu, Muslim, Christian"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marital_status" className="font-bold uppercase tracking-wider text-xs block">Marital Status</Label>
                  <Select value={formData.marital_status} onValueChange={(val) => updateField("marital_status", val)}>
                    <SelectTrigger id="marital_status" className="rounded-none border-2 border-foreground bg-transparent font-sans">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                      {MARITAL_STATUSES.map((ms) => (
                        <SelectItem key={ms} value={ms} className="hover:bg-foreground hover:text-background">{ms}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employment_status" className="font-bold uppercase tracking-wider text-xs block">Employment Status</Label>
                  <Select value={formData.employment_status} onValueChange={(val) => updateField("employment_status", val)}>
                    <SelectTrigger id="employment_status" className="rounded-none border-2 border-foreground bg-transparent font-sans">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                      {EMPLOYMENT_STATUSES.map((es) => (
                        <SelectItem key={es} value={es} className="hover:bg-foreground hover:text-background">{es}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abc_id" className="font-bold uppercase tracking-wider text-xs block">ABC ID</Label>
                  <Input 
                    id="abc_id"
                    value={formData.abc_id} 
                    onChange={(e) => updateField("abc_id", e.target.value)} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                    placeholder="Academic Bank of Credits ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deb_id" className="font-bold uppercase tracking-wider text-xs block">DEB ID</Label>
                  <Input 
                    id="deb_id"
                    value={formData.deb_id} 
                    onChange={(e) => updateField("deb_id", e.target.value)} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                    placeholder="Distance Education Bureau ID"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="font-bold uppercase tracking-wider text-xs block">Full Postal Address</Label>
                <Input 
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  value={formData.address} 
                  onChange={(e) => updateField("address", e.target.value)} 
                  className="rounded-none border-2 border-foreground bg-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="state" className="font-bold uppercase tracking-wider text-xs block">State</Label>
                  <Input 
                    id="state"
                    name="state"
                    autoComplete="address-level1"
                    value={formData.state} 
                    onChange={(e) => updateField("state", e.target.value)} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode" className="font-bold uppercase tracking-wider text-xs block">Pincode</Label>
                  <Input 
                    id="pincode"
                    name="pincode"
                    autoComplete="postal-code"
                    value={formData.pincode} 
                    onChange={(e) => updateField("pincode", e.target.value)} 
                    className="rounded-none border-2 border-foreground bg-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Academic History */}
          {step === 4 && (
            <div className="space-y-8">
              <div className="border-b border-foreground/30 pb-4">
                <h3 className="font-headline text-3xl uppercase">Step 4: Academic History</h3>
                <p className="font-serif-news text-sm italic text-[#6b3e1a]">Prior academic record for eligibility verification.</p>
              </div>

              {/* 10th Standard */}
              <div className="space-y-4">
                <h4 className="font-headline text-xl border-b border-foreground/20 pb-1">10th Standard / Secondary</h4>
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs uppercase font-bold">Board Name</Label>
                    <Input value={formData.edu_10_board} onChange={(e) => updateField("edu_10_board", e.target.value)} className="rounded-none border-2 border-foreground bg-transparent" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase font-bold">Passing Year</Label>
                    <Input type="number" value={formData.edu_10_year} onChange={(e) => updateField("edu_10_year", e.target.value)} className="rounded-none border-2 border-foreground bg-transparent" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase font-bold">Marks</Label>
                    <Input value={formData.edu_10_marks} onChange={(e) => updateField("edu_10_marks", e.target.value)} className="rounded-none border-2 border-foreground bg-transparent" placeholder="e.g. 450/500" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase font-bold">Percentage (%)</Label>
                    <Input type="number" step="0.01" value={formData.edu_10_percentage} onChange={(e) => updateField("edu_10_percentage", e.target.value)} className="rounded-none border-2 border-foreground bg-transparent" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase font-bold">Result</Label>
                    <Select value={formData.edu_10_result} onValueChange={(val) => updateField("edu_10_result", val)}>
                      <SelectTrigger className="rounded-none border-2 border-foreground bg-transparent"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                        {RESULTS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 12th Standard */}
              <div className="space-y-4">
                <h4 className="font-headline text-xl border-b border-foreground/20 pb-1">12th Standard / Higher Secondary</h4>
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs uppercase font-bold">Board/University</Label>
                    <Input value={formData.edu_12_board} onChange={(e) => updateField("edu_12_board", e.target.value)} className="rounded-none border-2 border-foreground bg-transparent" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase font-bold">Passing Year</Label>
                    <Input type="number" value={formData.edu_12_year} onChange={(e) => updateField("edu_12_year", e.target.value)} className="rounded-none border-2 border-foreground bg-transparent" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase font-bold">Marks</Label>
                    <Input value={formData.edu_12_marks} onChange={(e) => updateField("edu_12_marks", e.target.value)} className="rounded-none border-2 border-foreground bg-transparent" placeholder="e.g. 520/600" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase font-bold">Percentage (%)</Label>
                    <Input type="number" step="0.01" value={formData.edu_12_percentage} onChange={(e) => updateField("edu_12_percentage", e.target.value)} className="rounded-none border-2 border-foreground bg-transparent" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase font-bold">Result</Label>
                    <Select value={formData.edu_12_result} onValueChange={(val) => updateField("edu_12_result", val)}>
                      <SelectTrigger className="rounded-none border-2 border-foreground bg-transparent"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                        {RESULTS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Graduate Degree - Optional if MBA selected */}
              {(formData.program === "MBA" || formData.program === "BBA") && (
                <div className="space-y-4">
                  <h4 className="font-headline text-xl border-b border-foreground/20 pb-1">Undergraduate Degree (Mandatory for MBA)</h4>
                  <div className="grid md:grid-cols-5 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs uppercase font-bold">University</Label>
                      <Input value={formData.edu_degree_university} onChange={(e) => updateField("edu_degree_university", e.target.value)} className="rounded-none border-2 border-foreground bg-transparent" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase font-bold">Passing Year</Label>
                      <Input type="number" value={formData.edu_degree_year} onChange={(e) => updateField("edu_degree_year", e.target.value)} className="rounded-none border-2 border-foreground bg-transparent" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase font-bold">Marks</Label>
                      <Input value={formData.edu_degree_marks} onChange={(e) => updateField("edu_degree_marks", e.target.value)} className="rounded-none border-2 border-foreground bg-transparent" placeholder="e.g. 1800/2400" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase font-bold">Percentage (%)</Label>
                      <Input type="number" step="0.01" value={formData.edu_degree_percentage} onChange={(e) => updateField("edu_degree_percentage", e.target.value)} className="rounded-none border-2 border-foreground bg-transparent" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase font-bold">Result</Label>
                      <Select value={formData.edu_degree_result} onValueChange={(val) => updateField("edu_degree_result", val)}>
                        <SelectTrigger className="rounded-none border-2 border-foreground bg-transparent"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#fbf6e7] border-2 border-foreground rounded-none">
                          {RESULTS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Document Checkcards */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="border-b border-foreground/30 pb-4">
                <h3 className="font-headline text-3xl uppercase">Step 5: Document Vault Preview</h3>
                <p className="font-serif-news text-sm italic text-[#6b3e1a]">Toggle items below to verify document readiness.</p>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { key: "doc_photo", title: "Applicant Photograph", desc: "Clear passport-sized image." },
                  { key: "doc_signature", title: "Applicant Signature", desc: "Signed on plain white paper." },
                  { key: "doc_id_proof", title: "ID Proof (Aadhar/Pan)", desc: "Scan of original card." },
                  { key: "doc_marksheet_10", title: "10th Marksheet", desc: "Secondary board certificate." },
                  { key: "doc_marksheet_12", title: "12th Marksheet", desc: "Higher secondary certificate." },
                  { key: "doc_marksheet_degree", title: "UG Degree Certificate", desc: "Graduate marksheet (MBA)." },
                ].map((doc) => {
                  const active = formData[doc.key as keyof FormState] === true;
                  return (
                    <button
                      key={doc.key}
                      onClick={() => updateField(doc.key as keyof FormState, !active)}
                      className={`text-left p-5 border-2 border-foreground transition-all rounded-none flex flex-col justify-between h-40 ${
                        active 
                          ? "bg-foreground text-background shadow-[4px_4px_0px_0px_#6b3e1a]" 
                          : "bg-transparent text-foreground hover:bg-foreground/5"
                      }`}
                    >
                      <div>
                        <div className="font-sans font-bold uppercase tracking-wider text-xs opacity-80">Checklist Card</div>
                        <h4 className="font-headline text-lg mt-1">{doc.title}</h4>
                        <p className="text-xs font-serif-news italic mt-2 opacity-90">{doc.desc}</p>
                      </div>
                      <div className="text-xs font-bold uppercase tracking-widest mt-4">
                        {active ? "✓ Ready & Attached" : "○ Click to Verify Readiness"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 6: Declaration Checklist */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="border-b border-foreground/30 pb-4">
                <h3 className="font-headline text-3xl uppercase">Step 6: Confirm Declarations</h3>
                <p className="font-serif-news text-sm italic text-[#6b3e1a]">Official declarations and compliance review.</p>
              </div>

              <div className="space-y-4 bg-background/40 p-6 border-2 border-dashed border-foreground/40 font-serif-news text-sm leading-relaxed">
                <p>
                  1. I hereby declare that all details entered in this intake application are correct and match my verified public documents (Aadhar, marksheets).
                </p>
                <p>
                  2. I understand that the target degree course is UGC-DEB approved, and the final enrolment relies on document clearance by the respective university's verification desk.
                </p>
                <p>
                  3. I agree to receive official updates, admission confirmations, fee payment alerts, and counselor communications at my phone and email address.
                </p>
              </div>

              <div className="flex items-start gap-3 pt-4">
                <Checkbox 
                  id="decl" 
                  checked={declaration} 
                  onCheckedChange={(checked) => setDeclaration(!!checked)} 
                  className="mt-1 border-2 border-foreground rounded-none bg-transparent"
                />
                <Label htmlFor="decl" className="font-serif-news text-sm leading-snug cursor-pointer select-none">
                  <strong>Declaration Agreement</strong>: I certify that the academic history and documents provided are genuine. I authorize the Admissions Desk to contact me regarding counselling.
                </Label>
              </div>
            </div>
          )}

          {/* Bottom Action Controls */}
          <div className="news-divider mt-8 pt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <Button 
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  className="rounded-none border-2 border-foreground bg-transparent font-bold uppercase tracking-wider text-xs py-2 hover:bg-foreground/5"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
              {step < 6 && (
                <Button 
                  onClick={() => setStep(step + 1)}
                  className="rounded-none bg-foreground text-background border-2 border-foreground py-2 font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_#6b3e1a]"
                >
                  Next Step <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={handleSaveDraft}
                variant="outline"
                className="rounded-none border-2 border-foreground bg-transparent font-bold uppercase tracking-wider text-xs py-2 hover:bg-foreground/5"
              >
                <Save className="w-4 h-4 mr-2" /> Save Draft
              </Button>
              <Button 
                onClick={handlePrintSummary}
                variant="outline"
                className="rounded-none border-2 border-foreground bg-transparent font-bold uppercase tracking-wider text-xs py-2 hover:bg-foreground/5"
              >
                <Download className="w-4 h-4 mr-2" /> Print Summary
              </Button>
              {step === 6 && (
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting || !formData.doc_marksheet_10 || !formData.doc_photo || !formData.doc_id_proof}
                  className={`rounded-none border-2 border-foreground py-2 font-bold uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_#1a1410] ${
                    submitting || !formData.doc_marksheet_10 || !formData.doc_photo || !formData.doc_id_proof
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-[#6b3e1a] text-white"
                  }`}
                >
                  {submitting ? "Submitting Application..." : "Final Submit →"}
                </Button>
              )}
            </div>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
