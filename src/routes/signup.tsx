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
    const isAdminEmail = checkEmail === "ulfathai003@gmail.com";

    // 1. Pre-check student enrollment status if not admin
    if (!isAdminEmail) {
      try {
        const { data: student, error } = await supabase
          .from("students")
          .select("id")
          .eq("email", checkEmail)
          .maybeSingle();

        if (error) {
          setLoading(false);
          return toast.error("Error verifying enrollment. Please try again.");
        }

        if (!student) {
          setLoading(false);
          return toast.error("Access Denied: Only enrolled students can sign up. Prospective applicants cannot register a CRM account.");
        }
      } catch (err) {
        setLoading(false);
        return toast.error("Authentication server communication failed.");
      }
    }

    // 2. Perform Supabase authentication
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
    toast.success("Account created! Signing you in...");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:block relative bg-gradient-hero">
        <div className="absolute inset-0 grid place-items-center text-primary-foreground p-12">
          <div className="max-w-md">
            <Link to="/" className="inline-flex items-center gap-2 font-display font-bold mb-10">
              <span className="grid place-items-center w-9 h-9 rounded-lg bg-white/20 backdrop-blur"><GraduationCap className="w-5 h-5" /></span>
              EduConnect
            </Link>
            <h1 className="text-4xl font-bold leading-tight">Start your application in minutes.</h1>
            <p className="mt-4 opacity-90">One account, six universities, twenty-plus specializations.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-3xl font-bold">Create account</h2>
            <p className="text-sm text-muted-foreground mt-1">Get instant access to your learning dashboard.</p>
          </div>
          <div><Label htmlFor="n">Full name</Label><Input id="n" required maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button disabled={loading} className="w-full bg-gradient-hero shadow-glow">{loading ? "Creating..." : "Create account"}</Button>
          <div className="text-sm text-muted-foreground text-center">
            Already have an account? <Link to="/login" className="text-primary font-medium">Sign in</Link>
          </div>
          <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
            <Link to="/" className="hover:text-foreground">← Back to website</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
