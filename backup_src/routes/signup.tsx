import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account | EduConnect" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const checkEmail = email.trim().toLowerCase();

    try {
      // Perform Supabase authentication
      const { error } = await supabase.auth.signUp({
        email: checkEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { full_name: fullName },
        },
      });
      setLoading(false);

      if (error) return toast.error(error.message);
      toast.success("Account created! Welcome!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      setLoading(false);
      return toast.error("Account creation failed. Please check your network connection.");
    }
  }

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

      {/* Signup Card - Brutalist Mondrian Outline */}
      <div className="w-full max-w-md bg-[#fbf6e7] border-4 border-foreground p-6 sm:p-10 shadow-[8px_8px_0px_0px_#1a1410] transition-transform hover:-translate-y-1">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center pb-4 border-b border-foreground/30">
            <h2 className="font-headline text-3xl uppercase tracking-tight">Create Account</h2>
            <p className="font-serif-news text-xs italic mt-1 text-[#6b3e1a]">Register for the 2026 academic intake desk</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-sans font-bold uppercase tracking-wider text-xs block">Full Name</Label>
            <Input 
              id="fullName" 
              name="name"
              autoComplete="name"
              required 
              maxLength={100}
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              className="rounded-none border-2 border-foreground bg-transparent text-[#1a1410] focus:ring-0 focus:border-foreground font-sans px-3 py-2 text-sm"
              placeholder="e.g. Jane Doe"
            />
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
              placeholder="e.g. jane.doe@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-sans font-bold uppercase tracking-wider text-xs block">Password</Label>
            <Input 
              id="password" 
              name="password"
              type="password" 
              autoComplete="new-password"
              minLength={8}
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="rounded-none border-2 border-foreground bg-transparent text-[#1a1410] focus:ring-0 focus:border-foreground font-sans px-3 py-2 text-sm"
              placeholder="Min. 8 characters"
            />
          </div>

          <Button 
            disabled={loading} 
            className="w-full rounded-none bg-foreground text-background font-sans font-bold uppercase tracking-wider py-3 border-2 border-foreground hover:bg-transparent hover:text-foreground transition-all shadow-[4px_4px_0px_0px_#6b3e1a]"
          >
            {loading ? "Registering Account..." : "Create Applicant Account"}
          </Button>

          <div className="text-xs sm:text-sm text-center pt-4 border-t border-foreground/30 font-serif-news">
            Already registered? <Link to="/login" className="news-link font-bold">Sign in here</Link>
          </div>
          
          <div className="text-center pt-2 font-serif-news">
            <Link to="/" className="text-xs uppercase tracking-wider font-sans font-bold text-[#6b3e1a] hover:opacity-80">← Return to Main Page</Link>
          </div>
        </form>
      </div>

      {/* Fine Print Footer */}
      <div className="mt-8 text-center max-w-xs text-[10px] text-[#4a3520] font-serif-news leading-relaxed">
        All applicant submissions are verified against official records. Security protocol backed by active encryption.
      </div>
    </div>
  );
}
