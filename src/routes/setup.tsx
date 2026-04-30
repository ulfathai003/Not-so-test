import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/setup")({
  head: () => ({ meta: [{ title: "Setup | EduConnect" }] }),
  component: SetupPage,
});

function SetupPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [adminCount, setAdminCount] = useState<number | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    (async () => {
      const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
      setAdminCount(count ?? 0);
    })();
  }, []);

  async function makeMeAdmin() {
    if (!user) return;
    setWorking(true);
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
    setWorking(false);
    if (error) return toast.error(error.message);
    toast.success("You are now an admin. Redirecting…");
    setTimeout(() => navigate({ to: "/dashboard" }), 600);
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-soft p-6">
      <div className="bg-gradient-card border border-border rounded-3xl shadow-card p-10 max-w-md w-full text-center">
        <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-6"><ShieldCheck className="w-7 h-7" /></span>
        <h1 className="text-2xl font-bold">First-time setup</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Promote your account to admin. This only works while no admin exists yet.
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : !user ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm">You need an account first.</p>
            <div className="flex gap-2 justify-center">
              <Button asChild variant="outline"><Link to="/login">Sign in</Link></Button>
              <Button asChild className="bg-gradient-hero"><Link to="/signup">Create account</Link></Button>
            </div>
          </div>
        ) : adminCount === null ? (
          <p className="mt-6 text-sm text-muted-foreground">Checking…</p>
        ) : adminCount > 0 ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-muted-foreground">An admin already exists. Setup is locked.</p>
            <Button asChild variant="outline"><Link to="/dashboard">Go to dashboard</Link></Button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <p className="text-sm">Signed in as <span className="font-medium">{user.email}</span></p>
            <Button onClick={makeMeAdmin} disabled={working} className="w-full bg-gradient-hero shadow-glow">
              {working ? "Promoting…" : "Make me admin"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
