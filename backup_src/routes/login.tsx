import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in | EduConnect" }] }),
  component: LoginPage,
});

const STUDENT_TEMPLATE = `1. Course: 
2. Specilisation:  and Management
3. Full Name (as per sslc): 
4. Father Name: 
5. Mother Name: 
6. DOB: 
7. Gender: 
8. Category (Gen/OBC/SC/ST/Other): OBC
9. Employment Status: 
10. Marital Status: 
11. Religion: 
12. Aadhar Number: 
13. ABC ID: 
14. DEB ID: 
15. Address: . 
16. Pincode: 590006
17. City: Belagavi
18. District: Belagavi
19. State: Karnataka
20. Email: 
21. Mobile: 

Education Details

1. 10th Board Name, Year of Paasing, Marks, Percentage, Result: 

2. 12th Board Name (Diploma), Year of Paasing, Marks, Percentage, Result:

3. Degree University, Year of Passing, Consolidated Marks, Consolidated Percentage, Result:`;

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const checkEmail = email.trim().toLowerCase();

    try {
      // Perform Supabase authentication
      const { error } = await supabase.auth.signInWithPassword({ email: checkEmail, password });
      setLoading(false);

      if (error) return toast.error(error.message);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      setLoading(false);
      return toast.error("Authentication failed. Please check your network connection.");
    }
  }

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(STUDENT_TEMPLATE);
    toast.success("Student registration template copied to clipboard!");
  };

  return (
    <div className="min-h-screen news-paper flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Editorial Masthead */}
      <div className="text-center max-w-md mb-8 w-full">
        <Link to="/" className="font-headline text-4xl sm:text-5xl hover:opacity-80 uppercase tracking-tight block">
          EduConnect Times
        </Link>
        <div className="news-divider mt-3 py-1.5 text-center text-[10px] sm:text-xs uppercase tracking-widest font-sans font-bold">
          Vol. CXIV · Special Admissions Issue · Bengaluru
        </div>
      </div>

      {/* Login Card - Brutalist Mondrian Outline */}
      <div className="w-full max-w-md bg-[#fbf6e7] border-4 border-foreground p-6 sm:p-10 shadow-[8px_8px_0px_0px_#1a1410] transition-transform hover:-translate-y-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center pb-4 border-b border-foreground/30">
            <h2 className="font-headline text-3xl uppercase tracking-tight">Sign In</h2>
            <p className="font-serif-news text-xs italic mt-1 text-[#6b3e1a]">Access the credentials desk & student records</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-sans font-bold uppercase tracking-wider text-xs block">Email Address</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              autoComplete="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="rounded-none border-2 border-foreground bg-transparent text-[#1a1410] focus:ring-0 focus:border-foreground font-sans px-3 py-2 text-sm"
              placeholder="e.g. name@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-sans font-bold uppercase tracking-wider text-xs block">Password</Label>
            <Input 
              id="password" 
              name="password"
              type="password" 
              autoComplete="current-password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="rounded-none border-2 border-foreground bg-transparent text-[#1a1410] focus:ring-0 focus:border-foreground font-sans px-3 py-2 text-sm"
              placeholder="Enter password"
            />
          </div>

          <Button 
            disabled={loading} 
            className="w-full rounded-none bg-foreground text-background font-sans font-bold uppercase tracking-wider py-3 border-2 border-foreground hover:bg-transparent hover:text-foreground transition-all shadow-[4px_4px_0px_0px_#6b3e1a]"
          >
            {loading ? "Verifying Credentials..." : "Access Console"}
          </Button>

          <div className="text-xs sm:text-sm text-center pt-4 border-t border-foreground/30 font-serif-news text-[#6b3e1a]">
            <strong>Partner & Center Access:</strong> Use your official registered credentials to access the manager console.
          </div>

          <div className="text-xs sm:text-sm text-center pt-2 font-serif-news">
            New applicant? <Link to="/signup" className="news-link font-bold">Register on the Desk</Link>
          </div>
          
          <div className="text-center pt-2 font-serif-news">
            <Link to="/" className="text-xs uppercase tracking-wider font-sans font-bold text-[#6b3e1a] hover:opacity-80">← Return to Main Page</Link>
          </div>
        </form>
      </div>

      {/* Copyable Student Registration Helper */}
      <div className="w-full max-w-md mt-6 bg-[#fbf6e7] border-4 border-foreground p-6 shadow-[8px_8px_0px_0px_#1a1410] transition-transform hover:-translate-y-1">
        <h4 className="font-sans font-bold uppercase tracking-wider text-xs border-b-2 border-foreground pb-2 mb-3 text-[#6b3e1a] flex items-center justify-between">
          <span>Student Info Template</span>
          <Button 
            onClick={handleCopyTemplate} 
            size="sm" 
            variant="outline" 
            className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[9px] h-7 px-2 hover:bg-foreground hover:text-background"
          >
            Copy Template
          </Button>
        </h4>
        <p className="text-xs font-serif-news italic mb-3">Copy this standard profile layout for admissions and manager testing:</p>
        <pre className="p-3 bg-foreground/5 border-2 border-foreground/20 font-mono text-[9px] text-[#1a1410] max-h-48 overflow-y-auto whitespace-pre-wrap select-all cursor-pointer" onClick={handleCopyTemplate}>
          {STUDENT_TEMPLATE}
        </pre>
      </div>

      {/* Fine Print Footer */}
      <div className="mt-8 text-center max-w-xs text-[10px] text-[#4a3520] font-serif-news leading-relaxed">
        All applicant submissions are verified against official records. Security protocol backed by active encryption.
      </div>
    </div>
  );
}
