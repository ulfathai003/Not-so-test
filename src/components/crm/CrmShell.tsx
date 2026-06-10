import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Menu, X, LogOut, ShieldCheck, Building, Users, GraduationCap } from "lucide-react";

/* ─── Shared CRM chrome: a persistent LEFT sidebar that lists every option.
   Always visible on desktop; a slide-in drawer (toggled by the hamburger)
   on mobile. Used by the /admin, /center and /staff consoles. ─── */

export type CrmNavItem = { value: string; label: string; icon: LucideIcon };

const PORTALS = [
  { to: "/admin", label: "Admin Command", icon: ShieldCheck },
  { to: "/center", label: "Center Desk", icon: Building },
  { to: "/staff", label: "Staff Pipeline", icon: Users },
] as const;

export function CrmShell({
  brand,
  roleLabel,
  email,
  nav,
  active,
  onSelect,
  isMaster,
  currentPortal,
  onSignOut,
  actions,
  children,
}: {
  brand: string;
  roleLabel: string;
  email: string;
  nav: CrmNavItem[];
  active: string;
  onSelect: (value: string) => void;
  isMaster: boolean;
  currentPortal: "/admin" | "/center" | "/staff";
  onSignOut: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // mobile drawer

  const SidebarBody = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 h-16 border-b-2 border-black/80 shrink-0">
        <span className="bg-black text-white p-1.5">
          <GraduationCap className="w-5 h-5" />
        </span>
        <div className="leading-tight">
          <div className="font-black uppercase italic tracking-tighter text-sm">{brand}</div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-black/50">{roleLabel}</div>
        </div>
      </div>

      {/* Section nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-2 mb-1 text-[9px] font-black uppercase tracking-widest text-black/40">Menu</p>
        {nav.map((n) => {
          const Icon = n.icon;
          const isActive = active === n.value;
          return (
            <button
              key={n.value}
              onClick={() => { onSelect(n.value); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 border-2 font-bold uppercase tracking-wider text-[11px] transition-all ${
                isActive
                  ? "bg-black text-white border-black"
                  : "bg-transparent text-black border-transparent hover:border-black"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate text-left">{n.label}</span>
            </button>
          );
        })}

        {isMaster && (
          <>
            <p className="px-2 mt-5 mb-1 text-[9px] font-black uppercase tracking-widest text-black/40">Switch Portal</p>
            {PORTALS.map((p) => {
              const Icon = p.icon;
              const here = p.to === currentPortal;
              return (
                <button
                  key={p.to}
                  onClick={() => { setOpen(false); navigate({ to: p.to }); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 border-2 font-bold uppercase tracking-wider text-[11px] transition-all ${
                    here
                      ? "bg-yellow-400 text-black border-black"
                      : "bg-transparent text-black border-transparent hover:border-black"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate text-left">{p.label}</span>
                  {here && <span className="ml-auto text-[8px]">●</span>}
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-3 border-t-2 border-black/80 shrink-0 space-y-2">
        <div className="px-2">
          <div className="text-[10px] font-bold uppercase truncate">{email}</div>
          <div className="text-[9px] font-bold uppercase text-black/40">{roleLabel} access</div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-3 py-2.5 border-2 border-black font-black uppercase tracking-wider text-[11px] hover:bg-red-600 hover:text-white hover:border-black transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-black font-sans md:flex">
      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 bg-[#fffdfa] border-r-2 border-black sticky top-0 h-screen">
        {SidebarBody}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-[80] bg-black/60 md:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed left-0 top-0 z-[90] h-screen w-64 bg-[#fffdfa] border-r-2 border-black md:hidden">
            {SidebarBody}
          </aside>
        </>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-[70] h-16 flex items-center gap-3 px-4 md:px-7 bg-white border-b-2 border-black">
          {/* Hamburger — visible on mobile to reveal the sidebar */}
          <button
            className="md:hidden p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="font-black uppercase italic tracking-tighter text-lg md:text-2xl truncate">
            {nav.find((n) => n.value === active)?.label ?? brand}
          </h1>
          <div className="ml-auto flex items-center gap-3">{actions}</div>
        </header>

        <main className="flex-1 px-4 md:px-7 py-6 md:py-8 max-w-[1400px] w-full">{children}</main>
      </div>
    </div>
  );
}
