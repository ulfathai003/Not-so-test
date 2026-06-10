import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, UserCog, Mail, Receipt, TrendingUp, ArrowUpRight, BarChart4 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { CrmShell, type CrmNavItem } from "@/components/crm/CrmShell";

export const Route = createFileRoute("/admin")({
  component: AdminMasterDashboard,
});

const NAV: CrmNavItem[] = [
  { value: "financials", label: "Live Ledger", icon: TrendingUp },
  { value: "enquiries", label: "Leads Monitor", icon: Mail },
  { value: "centers", label: "Team & Centers", icon: UserCog },
];

function AdminMasterDashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("financials");

  const isMaster = user?.email?.toLowerCase() === "ulfathai003@gmail.com";

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      navigate({ to: "/login" });
    }
  }, [user, role, loading]);

  if (loading || role !== "admin")
    return <div className="grid place-items-center min-h-screen news-paper font-headline text-2xl">Validating Admin Access…</div>;

  return (
    <CrmShell
      brand="EduConnect CRM"
      roleLabel="Admin"
      email={user?.email || ""}
      nav={NAV}
      active={active}
      onSelect={setActive}
      isMaster={isMaster}
      currentPortal="/admin"
      onSignOut={signOut}
    >
      <div className="mb-8 border-l-4 border-foreground pl-5 py-1">
        <p className="news-kicker">EduConnect Management System · Prashant Bhai Access</p>
        <h2 className="font-headline text-4xl md:text-5xl tracking-tight leading-none mt-1">The Command Desk</h2>
      </div>

      {active === "financials" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatsCard label="Total Booked" value="₹12.4L" icon={BarChart4} />
            <StatsCard label="Net Collected" value="₹8.1L" icon={Receipt} />
            <StatsCard label="Unpaid Balance" value="₹4.3L" icon={ArrowUpRight} />
          </div>
          <div className="news-card p-8 shadow-[8px_8px_0px_0px_#1a1410]">
            <h3 className="font-headline text-2xl mb-2">Global Student Roster</h3>
            <p className="font-serif-news text-sm italic mb-10 text-[#6b3e1a]">Centralized view of all records from all staff and centers.</p>
            <div className="flex items-center gap-4 py-20 justify-center border border-dashed border-foreground/30">
              <p className="font-headline text-5xl md:text-6xl opacity-10">System Live</p>
            </div>
          </div>
        </div>
      )}

      {active === "enquiries" && (
        <div className="news-card p-8 shadow-[8px_8px_0px_0px_#1a1410]">
          <h3 className="font-headline text-2xl mb-2">Inbound Pipeline</h3>
          <p className="font-serif-news text-sm italic mb-8 text-[#6b3e1a]">Decide how to route incoming traffic.</p>
          <div className="news-divider pt-1">
            <div className="py-20 text-center font-serif-news uppercase tracking-widest text-foreground/30 text-sm">No unassigned inquiries at this moment.</div>
          </div>
        </div>
      )}

      {active === "centers" && (
        <div className="grid md:grid-cols-2 gap-10">
          <div className="news-card p-8 shadow-[8px_8px_0px_0px_#1a1410]">
            <h3 className="font-headline text-2xl mb-6">Team Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-foreground font-serif-news uppercase text-xs">
                <span>Counsellor A (Staff)</span>
                <Badge className="bg-foreground text-background rounded-none">12 Assets</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border border-foreground font-serif-news uppercase text-xs">
                <span>Regional Center (Partner)</span>
                <Badge className="bg-foreground text-background rounded-none">44 Admissions</Badge>
              </div>
            </div>
          </div>
          <div className="news-card p-8 shadow-[8px_8px_0px_0px_#1a1410]">
            <h3 className="font-headline text-2xl mb-2">Access Key Generation</h3>
            <p className="font-serif-news text-xs italic mb-6 text-[#6b3e1a] leading-relaxed">Invite a new center or staff member. They will only have access to their specific role portal.</p>
            <div className="space-y-4">
              <input placeholder="Enter email address" className="w-full h-12 px-4 bg-white border-2 border-foreground rounded-none outline-none font-serif-news" />
              <select className="w-full h-12 px-4 bg-white border-2 border-foreground rounded-none outline-none font-serif-news uppercase appearance-none">
                <option>Center Access</option>
                <option>Staff Access</option>
              </select>
              <Button className="w-full h-12 bg-foreground text-background rounded-none border-2 border-foreground font-serif-news uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_#1a1410] hover:bg-background hover:text-foreground">Issue Access Key</Button>
            </div>
          </div>
        </div>
      )}
    </CrmShell>
  );
}

function StatsCard({ label, value, icon: Icon }: { label: string; value: string; icon: any; trend?: "success" | "danger" }) {
  return (
    <div className="news-card p-6 shadow-[6px_6px_0px_0px_#1a1410] flex flex-col justify-between h-[170px]">
      <div className="flex justify-between items-start">
        <div className="news-kicker !text-[0.6rem]">{label}</div>
        <div className="bg-foreground text-background p-1.5"><Icon className="w-5 h-5" /></div>
      </div>
      <div className="font-headline text-5xl leading-none">{value}</div>
    </div>
  );
}
