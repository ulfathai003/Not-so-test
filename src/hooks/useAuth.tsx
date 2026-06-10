import { useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

export type AppRole = "admin" | "center" | "staff";

export function useAuth() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [studentStatus, setStudentStatus] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoleAndStatus = useCallback(async (userId: string, email?: string) => {
    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      const roles = (roleData ?? []).map((r: any) => r.role as AppRole);
      
      if (email === "ulfathai003@gmail.com" || roles.includes("admin")) {
        setRole("admin");
      } else if (roles.includes("center")) {
        setRole("center");
      } else if (roles.includes("staff")) {
        setRole("staff");
      } else {
        setRole(null); // No auto-student role anymore
      }
    } catch (err) {
      console.error("Error fetching role & status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      const path = window.location.pathname;
      const isPublic = [
        "/", 
        "/login", 
        "/signup", 
        "/contact", 
        "/programs", 
        "/universities"
      ].includes(path);

      if (isPublic) {
        if (role === "admin") navigate({ to: "/admin" });
        else if (role === "center") navigate({ to: "/center" });
        else if (role === "staff") navigate({ to: "/staff" });
      }
    }
  }, [user, role, loading, navigate]);

  const refetchStudent = useCallback(async () => {
    if (user) {
      await fetchRoleAndStatus(user.id, user.email);
    }
  }, [user, fetchRoleAndStatus]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, s: any) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => fetchRoleAndStatus(s.user.id, s.user.email), 0);
      } else {
        setRole(null);
        setStudentStatus(null);
        setStudentData(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }: any) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchRoleAndStatus(s.user.id, s.user.email);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchRoleAndStatus]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return { session, user, role, studentStatus, studentData, loading, signOut, refetchStudent };
}
