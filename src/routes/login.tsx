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

function LoginPage() {
  const navigate = useNavigate();
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
          return toast.error("Access Denied: Only enrolled students can log in. Prospective applicants do not have CRM access.");
        }
      } catch (err) {
        setLoading(false);
        return toast.error("Authentication server communication failed.");
      }
    }

    // 2. Perform Supabase authentication
    const { error } = await supabase.auth.signInWithPassword({ email: checkEmail, password });
    setLoading(false);

    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
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
            <h1 className="text-4xl font-bold leading-tight">Welcome back to your learning hub.</h1>
            <p className="mt-4 opacity-90">Track progress, view marks, download certificates and connect with mentors — all in one place.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-3xl font-bold">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">Use your EduConnect account.</p>
          </div>
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button disabled={loading} className="w-full bg-gradient-hero shadow-glow">{loading ? "Signing in..." : "Sign in"}</Button>
          <div className="text-sm text-muted-foreground text-center">
            New here? <Link to="/signup" className="text-primary font-medium">Create an account</Link>
          </div>
          <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
            <Link to="/" className="hover:text-foreground">← Back to website</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
