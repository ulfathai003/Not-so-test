import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
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
  head: () => ({
    meta: [
      { title: "Contact EduConnect Times" },
      { name: "description", content: "Get in touch with our admissions team. We respond within one working day." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { user, studentData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("");
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
      // 1. Save to Supabase (Order Flow: Lands in Manager Console for Prashant Bhai)
      const { error: dbError } = await (supabase as any).from("students").insert([{
        full_name: name,
        email: email,
        phone: phone,
        university: university,
        program: course.includes("10th") ? "10th" : course.includes("12th") ? "12th Commerce" : (course as any),
        specialization: course,
        notes: `Interest: ${courseDescription}. Message: ${message}`,
        status: "lead",
        batch_year: new Date().getFullYear(),
        location: "Website Inbound"
      }]);

      if (dbError) throw dbError;

      // 2. Original FormSubmit.co notification fallback
      const response = await fetch("https://formsubmit.co/ajax/ulfathai003@gmail.com", {
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
          _subject: `New Admission Inquiry from ${name}`
        })
      });

      toast.success("Inquiry received! Prashant Bhai is allocating your counselor now.");
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
        <section className="mt-12 grid gap-12 lg:grid-cols-2 news-rule py-8">
          {/* Left panel - newspaper column info */}
          <div className="space-y-6 font-serif-news text-[15px] leading-relaxed">
            <h3 className="font-headline text-3xl mb-4">Admissions Bureau</h3>
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
                <span className="text-sm font-semibold">admissions@educonnect.app</span>
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
              </div>              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
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
                    <option value="Jain (Deemed-to-be) University">Jain (Deemed-to-be) University</option>
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
                  className="w-full bg-foreground text-background hover:bg-foreground/80 rounded-none font-serif-news uppercase tracking-widest text-xs py-3"
                >
                  {loading ? "Submitting Inquiry..." : "Submit Inquiry"}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
