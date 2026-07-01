import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GlobalFAQ } from "@/components/site/GlobalFAQ";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): { university?: string } => {
    return {
      university: search.university ? (search.university as string) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Contact Admissions | JoinOnline Education Online MBA & BBA Support" },
      { name: "description", content: "Get free expert admissions counselling for Online MBA, BBA and distance courses. Reach our Bengaluru office or message us on WhatsApp for PAN-India support." },
    ],
  }),
  component: ContactPage,
});

const CONTACT_FAQS = [
  {
    k: "response-time",
    q: "How soon can I expect a call back from a counsellor?",
    a: "Typically, our counsellors call back within 2-4 business hours. If you submit a query after 7 PM, expect a call the following morning between 10 AM and 11 AM IST."
  },
  {
    k: "docs-whatsapp",
    q: "Can I send my documents via WhatsApp for verification?",
    a: "Yes! Once you are connected with a counsellor, you can securely share your marksheets and ID proof via WhatsApp for a preliminary eligibility check."
  },
  {
    k: "visit-office",
    q: "Can I visit your office in Bengaluru?",
    a: "Absolutely. We are located in the heart of Bengaluru's education hub. Please schedule an appointment through your counsellor to ensure the right advisor is available to meet you."
  },
  {
    k: "multilingual",
    q: "Is counselling available in regional languages?",
    a: "Yes, our team can assist you in English, Hindi, Kannada, Tamil, Telugu, and Malayalam to make sure you understand every detail of your chosen program."
  }
];

function ContactPage() {
  const { user, studentData } = useAuth();
  const search = Route.useSearch();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState(search.university || "");
  const [course, setCourse] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || studentData?.full_name || "");
      setEmail(user.email || "");
      if (studentData?.phone) {
        setPhone(studentData.phone);
      }
    }
  }, [user, studentData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Map contact-form course strings → database program_type enum values
      const PROGRAM_MAP: Record<string, string> = {
        "Online MBA":            "MBA",
        "Online MCA":            "MBA",   // nearest enum match
        "Online BBA":            "BBA",
        "Online B.Com":          "BBA",   // nearest enum match
        "Online BCA":            "BBA",   // nearest enum match
        "Online MA":             "MBA",   // nearest enum match
        "Online BA":             "BBA",   // nearest enum match
        "Diploma":               "BBA",   // nearest enum match
        "Secondary (10th)":      "10th",
        "Senior Secondary (12th)": "12th Commerce",
      };
      const mappedProgram = PROGRAM_MAP[course] ?? "MBA"; // safe fallback

      // 1. Save to the CRM via the security-definer RPC. A direct
      // students.insert() is blocked by RLS for anonymous visitors (the table
      // is locked down), so leads were never reaching the Enquiries desk.
      // submit_inquiry() is granted to anon, forces status='lead', and is
      // rate-limited server-side.
      const { error: dbError } = await (supabase as any).rpc("submit_inquiry", {
        p_full_name: name,
        p_email: email,
        p_phone: phone,
        p_university: university,
        p_program: mappedProgram,
        p_specialization: course,
        p_notes: `Interest: ${courseDescription}. Message: ${message}`,
        p_location: "Website Inbound",
      });

      // Never lose a lead: if the CRM save fails, log it and still deliver the
      // email notification below instead of erroring the whole submission.
      if (dbError) {
        console.error("Lead CRM save failed; sending email fallback:", dbError.message);
      }

      // 2. Original FormSubmit.co notification fallback
      const autoReplyMessage = `Dear ${name},

Thank you for reaching out to JoinOnline Education! We have successfully received your enquiry regarding ${course || "online education"} and our expert counsellor will get in touch with you within 2–4 business hours.

Here's a summary of what we received:
• Name: ${name}
• Interested In: ${course}
• University of Interest: ${university}

If you'd like to speak to us immediately, please feel free to reach us:
📧 Email: admissions@joinonlineeducation.com
📞 Phone: +91 80 4000 0000
💬 WhatsApp: Available Mon–Sat, 9 AM – 8 PM IST

About JoinOnline Education:
We are a leading distance & online education consultancy helping thousands of students across India get admitted to UGC-DEB approved universities like Mangalayatan University, Manipal University, Amity, NMIMS, and more. Our counsellors guide you through every step — from eligibility check to document submission and final enrolment.

We look forward to helping you build your future!

Warm regards,
The Admissions Team
JoinOnline Education
HSR Layout, Bengaluru, Karnataka
admissions@joinonlineeducation.com`;

      const response = await fetch("https://formsubmit.co/ajax/joinonlineeducation@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          university,
          course,
          courseDescription,
          message,
          _subject: `📩 New Admission Enquiry from ${name}`,
          _autoresponse: autoReplyMessage,
          _template: "table"
        })
      });

      toast.success("Inquiry received! Our counselor will get back to you shortly.");
      setName(user?.user_metadata?.full_name || studentData?.full_name || "");
      setEmail(user?.email || "");
      setPhone(studentData?.phone || "");
      setUniversity("");
      setCourse("");
      setCourseDescription("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit inquiry. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col news-paper">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 flex-1">
        
        {/* Headline */}
        <section className="text-center max-w-4xl mx-auto">
          <p className="news-kicker">Contact · Inquiries & Admissions</p>
          <h2 className="mt-3 font-headline text-5xl md:text-7xl">
            Talk to Our Editorial & Counselling Desks.
          </h2>
          <p className="mt-4 news-byline">
            We Respond to Every Inquiry Within One Working Day
          </p>
          <div className="news-divider-double mt-6" />
        </section>

        {/* Form and info row */}
        <section className="mt-12 grid gap-12 lg:grid-cols-2 news-rule py-8 pb-20">
          {/* Left panel - newspaper column info */}
          <div className="space-y-6 font-serif-news text-[15px] leading-relaxed">
            <h3 className="font-headline text-3xl mb-4 text-gradient">Admissions Bureau</h3>
            <p>
              Free counselling is available from Monday through Saturday, 9:00 AM to 8:00 PM IST.
              Our desk is fully staffed and ready to evaluate eligibility credentials on the spot.
            </p>
            <p>
              For corporate partnerships, publication inquiries, or credential verification, please
              contact the main desk directly via the channels below.
            </p>

            <div className="news-divider pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-9 h-9 border border-foreground rounded-lg bg-foreground/5 text-foreground"><Mail className="w-4 h-4" /></span>
                <span className="text-sm font-semibold">admissions@joinonlineeducation.com</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-9 h-9 border border-foreground rounded-lg bg-foreground/5 text-foreground"><Phone className="w-4 h-4" /></span>
                <span className="text-sm font-semibold">+91 80 4000 0000</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-9 h-9 border border-foreground rounded-lg bg-foreground/5 text-foreground"><MapPin className="w-4 h-4" /></span>
                <span className="text-sm font-semibold">HSR Layout, Bengaluru, KA</span>
              </div>
            </div>
          </div>

          {/* Right panel - contact form styled as classified advertisement */}
          <div className="news-card border border-foreground p-6 md:p-8">
            <p className="news-kicker text-center mb-4">Official Inquiry Form</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="font-serif-news text-xs uppercase font-bold text-foreground/80">Full name</Label>
                <Input 
                  id="name" 
                  name="name"
                  autoComplete="name"
                  required 
                  maxLength={100} 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border-foreground/40 focus:border-foreground rounded-none font-serif-news" 
                />
              </div>
              <div>
                <Label htmlFor="email" className="font-serif-news text-xs uppercase font-bold text-foreground/80">Email address</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  autoComplete="email"
                  required 
                  maxLength={255} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-foreground/40 focus:border-foreground rounded-none font-serif-news" 
                />
              </div>
              <div>
                <Label htmlFor="phone" className="font-serif-news text-xs uppercase font-bold text-foreground/80">Phone number</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  autoComplete="tel"
                  maxLength={20} 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-transparent border-foreground/40 focus:border-foreground rounded-none font-serif-news" 
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                <div>
                  <Label htmlFor="university" className="font-serif-news text-xs uppercase font-bold text-foreground/80">Affiliated University / Board</Label>
                  <select 
                    id="university" 
                    name="university"
                    required 
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full h-10 px-3 bg-transparent border-2 border-foreground focus:ring-0 focus:outline-none rounded-none font-serif-news text-sm appearance-none cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem' }}
                  >
                    <option value="">-- Choose University --</option>
                    <option value="Manipal University">Manipal University</option>
                    <option value="Amity University">Amity University</option>
                    <option value="NMIMS">NMIMS</option>
                    <option value="LPU">LPU</option>
                    <option value="Sikkim Board (SBSE)">Sikkim Board (SBSE)</option>
                    <option value="Other">Other / Not Listed</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="course" className="font-serif-news text-xs uppercase font-bold text-foreground/80">Desired Course (Dropdown)</Label>
                  <select 
                    id="course" 
                    name="course"
                    required 
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full h-10 px-3 bg-transparent border-2 border-foreground focus:ring-0 focus:outline-none rounded-none font-serif-news text-sm appearance-none cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem' }}
                  >
                    <option value="">-- Select Qualification --</option>
                    {university === "Sikkim Board (SBSE)" ? (
                      <>
                        <option value="Secondary (10th)">Secondary (10th)</option>
                        <option value="Senior Secondary (12th)">Senior Secondary (12th)</option>
                      </>
                    ) : (
                      <>
                        <option value="Online MBA">Online MBA</option>
                        <option value="Online MCA">Online MCA</option>
                        <option value="Online BBA">Online BBA</option>
                        <option value="Online B.Com">Online B.Com</option>
                        <option value="Online BCA">Online BCA</option>
                        <option value="Online MA">Online MA</option>
                        <option value="Online BA">Online BA</option>
                        <option value="Diploma">Professional Diploma</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="courseDescription" className="font-serif-news text-xs uppercase font-bold text-foreground/80">Course Description & Goals</Label>
                <Textarea 
                  id="courseDescription" 
                  name="courseDescription"
                  rows={2} 
                  required
                  maxLength={500} 
                  placeholder="Briefly describe your interest in this course..."
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="bg-transparent border-2 border-foreground focus:ring-0 focus:outline-none rounded-none font-serif-news p-3" 
                />
              </div>
              <div>
                <Label htmlFor="message" className="font-serif-news text-xs uppercase font-bold text-foreground/80">Queries / Message</Label>
                <Textarea 
                  id="message" 
                  name="message"
                  rows={3} 
                  maxLength={1000} 
                  placeholder="Any other specific queries? (Optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-transparent border-2 border-foreground focus:ring-0 focus:outline-none rounded-none font-serif-news p-3" 
                />
              </div>

              <div className="pt-2">
                <Button 
                  disabled={loading} 
                  className="w-full bg-foreground text-background hover:bg-foreground/80 rounded-none font-serif-news uppercase tracking-widest text-xs py-3 font-bold"
                >
                  {loading ? "Submitting Inquiry..." : "Submit Inquiry"}
                </Button>
              </div>
            </form>
          </div>
        </section>

        <GlobalFAQ faqs={CONTACT_FAQS} />

      </main>
      <SiteFooter />
    </div>
  );
}

