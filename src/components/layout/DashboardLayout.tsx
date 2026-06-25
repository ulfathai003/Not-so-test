import { Sidebar } from "../Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f4ecd8]">
        <div className="text-[#1a1410] font-serif-news text-sm italic animate-pulse">Establishing secure connection…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4ecd8] selection:bg-foreground selection:text-background">
      <Sidebar />
      <div className="relative flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="h-16 border-b-4 border-foreground bg-[#fbf6e7] flex items-center justify-between px-8 sticky top-0 z-20 shadow-[0_4px_0_0_#1a1410]">
          <div className="flex items-center gap-4">
            <span className="font-serif-news italic text-xs border-r-2 border-foreground/20 pr-4">
              Authenticated Session
            </span>
            <span className="font-sans font-black uppercase tracking-widest text-[10px]">
              Role: <span className="text-red-600">{role ?? "APPLICANT"}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold opacity-60 uppercase">{user?.email}</span>
            </div>
            <Button 
              size="sm" 
              variant="default" 
              onClick={signOut}
              className="rounded-none border-2 border-foreground font-sans font-bold uppercase tracking-widest text-[10px] h-9"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        </header>
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="container mx-auto">
            {children}
          </div>
        </main>

        <footer className="p-4 border-t-4 border-foreground bg-[#fbf6e7] text-center text-[9px] font-sans font-bold uppercase tracking-widest text-[#6b3e1a]">
          Official Admissions Desk · © 2026 JoinOnline Education
        </footer>
      </div>
    </div>
  );
}
