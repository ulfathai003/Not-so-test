import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, LogOut, LayoutDashboard, ShieldCheck, Building, Users } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Front Page" },
  { to: "/programs", label: "Programs" },
  { to: "/universities", label: "Universities" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

const today = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const isMaster = user?.email?.toLowerCase() === "ulfathai003@gmail.com";
  
  // Define destination based on role
  const getDashboardPath = (targetRole: string | null) => {
    if (targetRole === "admin") return "/admin";
    if (targetRole === "center") return "/center";
    if (targetRole === "staff") return "/staff";
    return "/dashboard";
  };

  const dashboardPath = getDashboardPath(role);

  return (
    <header className="news-paper border-b border-foreground/80">
      {/* Top dateline */}
      <div className="border-b border-foreground/30">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-between text-[11px] font-serif-news text-foreground/80">
          <span className="uppercase tracking-widest">Vol. MMXXVI · No. 014</span>
          <span className="hidden sm:inline italic">{today}</span>
          <span className="uppercase tracking-widest">Price · Free Online</span>
        </div>
      </div>

      {/* Masthead */}
      <div className="container mx-auto px-4 py-6 text-center">
        <Link to="/" className="block">
          <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl tracking-tight">
            The EduConnect Times
          </h1>
        </Link>
        <p className="news-byline mt-2">
          "Distance Learning, Faithfully Reported Since 2016"
        </p>
      </div>

      {/* Nav rule */}
      <div className="news-rule">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <nav className="hidden md:flex items-center gap-6 text-sm font-serif-news">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "underline underline-offset-4" }}
                className="uppercase tracking-wider text-foreground hover:underline underline-offset-4"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Auth buttons — desktop */}
          <div className="hidden md:flex items-center gap-4 text-sm font-serif-news">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 border border-foreground bg-foreground text-background">
                    {role} View
                  </span>
                  <span className="text-xs font-bold uppercase truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>

                {isMaster ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-none border-2 border-foreground h-8 font-black uppercase text-[10px] bg-yellow-400 hover:bg-yellow-500 shadow-[2px_2px_0px_0px_#000]">
                        Mode Switcher
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="rounded-none border-2 border-foreground bg-[#fbf6e7] font-bold uppercase text-[10px]">
                      <DropdownMenuLabel>Authority Portal</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate({ to: "/admin" })} className="cursor-pointer hover:bg-red-100 p-2">
                        <ShieldCheck className="w-4 h-4 mr-2 text-red-600" /> Super Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate({ to: "/center" })} className="cursor-pointer hover:bg-black hover:text-white p-2">
                        <Building className="w-4 h-4 mr-2 text-yellow-600" /> Center Admission
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate({ to: "/staff" })} className="cursor-pointer hover:bg-blue-100 p-2">
                        <Users className="w-4 h-4 mr-2 text-blue-600" /> Counselor Desk
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    to={dashboardPath}
                    className="inline-flex items-center gap-1 uppercase tracking-wider news-link"
                  >
                    <LayoutDashboard className="w-3 h-3" />
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={signOut}
                  className="inline-flex items-center gap-1 uppercase tracking-wider bg-foreground text-background px-3 py-1 hover:opacity-80 border border-foreground"
                >
                  <LogOut className="w-3 h-3" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="uppercase tracking-wider news-link">Sign in</Link>
                <Link to="/admission-desk" className="uppercase tracking-wider bg-foreground text-background px-3 py-1">
                  Apply now
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-foreground/40">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2 font-serif-news">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="py-2 text-sm uppercase tracking-wider" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  <Link to={dashboardPath} className="flex-1 text-center border border-foreground py-2 text-sm uppercase tracking-wider" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={() => { signOut(); setOpen(false); }} className="flex-1 text-center bg-foreground text-background py-2 text-sm uppercase tracking-wider">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex-1 text-center border border-foreground py-2 text-sm uppercase tracking-wider" onClick={() => setOpen(false)}>Sign in</Link>
                  <Link to="/admission-desk" className="flex-1 text-center bg-foreground text-background py-2 text-sm uppercase tracking-wider" onClick={() => setOpen(false)}>Apply now</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
