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
      // Submit form directly to user email using FormSubmit.co's free AJAX endpoint
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

      const result = await response.json();
      if (result.success) {
        toast.success("Message sent! A counselor will reach out within a day.");
        setName(user?.user_metadata?.full_name || studentData?.full_name || "");
        setEmail(user?.email || "");
        setPhone(studentData?.phone || "");
        setUniversity("");
        setCourse("");
        setCourseDescription("");
        setMessage("");
      } else {
        throw new Error(result.message || "Failed to submit form");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
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
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="university" className="font-serif-news text-xs uppercase font-bold text-foreground/80">Select University</Label>
                  <select 
                    id="university" 
                    name="university"
                    required 
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full bg-transparent border border-foreground/40 focus:border-foreground rounded-none font-serif-news p-2"
                  >
                    <option value="">Select a University</option>
                    <option value="jain">Jain (Deemed-to-be) University</option>
                    <option value="manipal">Manipal University</option>
                    <option value="amity">Amity University</option>
                    <option value="nmims">NMIMS</option>
                    <option value="lpu">LPU</option>
                    <option value="sikkim-board">Sikkim Board (SBSE)</option>
                    <option value="other">Other / Not Sure</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="course" className="font-serif-news text-xs uppercase font-bold text-foreground/80">Select Course</Label>
                  <select 
                    id="course" 
                    name="course"
                    required 
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-transparent border border-foreground/40 focus:border-foreground rounded-none font-serif-news p-2"
                  >
                    <option value="">Select a Course</option>
                    {university === "sikkim-board" ? (
                      <>
                        <option value="Secondary">Secondary (10th)</option>
                        <option value="Senior Secondary">Senior Secondary (12th)</option>
                      </>
                    ) : (
                      <>
                        <option value="MBA">Online MBA</option>
                        <option value="MCA">Online MCA</option>
                        <option value="BBA">Online BBA</option>
                        <option value="BCom">Online B.Com</option>
                        <option value="BCA">Online BCA</option>
                        <option value="MA">Online MA</option>
                        <option value="BA">Online BA</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="courseDescription" className="font-serif-news text-xs uppercase font-bold text-foreground/80">Course Description / Requirements</Label>
                <Textarea 
                  id="courseDescription" 
                  name="courseDescription"
                  rows={2} 
                  maxLength={500} 
                  placeholder="Tell us about your educational background or specific course interests..."
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="bg-transparent border-foreground/40 focus:border-foreground rounded-none font-serif-news" 
                />
              </div>
              <div>
                <Label htmlFor="message" className="font-serif-news text-xs uppercase font-bold text-foreground/80">Additional Message</Label>
                <Textarea 
                  id="message" 
                  name="message"
                  rows={3} 
                  required 
                  maxLength={1000} 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-transparent border-foreground/40 focus:border-foreground rounded-none font-serif-news" 
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
