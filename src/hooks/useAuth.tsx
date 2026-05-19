import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AppRole = "admin" | "student";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // defer to avoid deadlock
        setTimeout(() => fetchRole(s.user.id, s.user.email), 0);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchRole(s.user.id, s.user.email);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchRole(userId: string, email?: string) {
    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      const roles = (roleData ?? []).map((r) => r.role as AppRole);
      const isAdmin = roles.includes("admin") || email === "ulfathai003@gmail.com";

      let isStudent = false;
      if (!isAdmin && email) {
        const { data: student } = await supabase
          .from("students")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        isStudent = !!student;
      }

      if (!isAdmin && !isStudent) {
        // Sign out unauthorized user
        await supabase.auth.signOut();
        setRole(null);
        setUser(null);
        setSession(null);
        setLoading(false);
        toast.error("Access Denied: Only enrolled students and admins can log in to the CRM.");
        return;
      }

      setRole(isAdmin ? "admin" : "student");
    } catch (err) {
      console.error("Error fetching role:", err);
    } finally {
      setLoading(false);
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return { session, user, role, loading, signOut };
}
