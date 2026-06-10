import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Front Page" },
  { to: "/programs", label: "Programs" },
  { to: "/universities", label: "Universities" },
  { to: "/boards", label: "Boards" },
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

  const isManager = role === "admin" || role === "center" || role === "staff";
  
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
                  <span className="text-xs font-bold uppercase truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>

                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-1 uppercase tracking-wider news-link"
                >
                  <LayoutDashboard className="w-3 h-3" />
                  Dashboard
                </Link>

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

          {/* hamburger — always visible, on every breakpoint */}
          <button
            className="p-2 -mr-2 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Hamburger menu panel — available on all screen sizes */}
      {open && (
        <div className="border-t border-foreground/40">
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
