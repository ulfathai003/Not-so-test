import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

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
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

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
                <span className="text-xs uppercase tracking-wider text-foreground/60 max-w-[160px] truncate">
                  {user.email}
                </span>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1 uppercase tracking-wider news-link"
                >
                  <LayoutDashboard className="w-3 h-3" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1 uppercase tracking-wider bg-foreground text-background px-3 py-1 hover:opacity-80"
                >
                  <LogOut className="w-3 h-3" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="uppercase tracking-wider news-link">Sign in</Link>
                <Link to="/signup" className="uppercase tracking-wider bg-foreground text-background px-3 py-1">
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
                  <Link to="/dashboard" className="flex-1 text-center border border-foreground py-2 text-sm uppercase tracking-wider" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={() => { handleSignOut(); setOpen(false); }} className="flex-1 text-center bg-foreground text-background py-2 text-sm uppercase tracking-wider">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex-1 text-center border border-foreground py-2 text-sm uppercase tracking-wider" onClick={() => setOpen(false)}>Sign in</Link>
                  <Link to="/signup" className="flex-1 text-center bg-foreground text-background py-2 text-sm uppercase tracking-wider" onClick={() => setOpen(false)}>Apply now</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
