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
    return <div className="grid place-items-center min-h-screen font-black uppercase italic text-red-600">Validating Super-Admin Authority...</div>;

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
      <div className="mb-8 border-l-8 border-red-600 pl-5 py-1">
        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">The War Room</h2>
        <p className="text-red-600 font-black uppercase text-[10px] tracking-[0.2em] mt-1">EduConnect Management System · Prashant Bhai Access Only</p>
      </div>

      {active === "financials" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatsCard label="Total Booked" value="₹12.4L" icon={BarChart4} />
            <StatsCard label="Net Collected" value="₹8.1L" icon={Receipt} />
            <StatsCard label="Unpaid Balance" value="₹4.3L" icon={ArrowUpRight} trend="danger" />
          </div>
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#ef4444]">
            <h3 className="text-2xl font-black uppercase italic mb-6">Global Student Roster</h3>
            <p className="font-bold text-xs uppercase text-muted-foreground italic mb-10">Centralized view of all records from all staff and centers.</p>
            <div className="flex items-center gap-4 py-20 justify-center border-4 border-dashed border-red-100">
              <p className="font-black uppercase italic text-red-200 text-5xl md:text-6xl opacity-20">SYSTEM LIVE</p>
            </div>
          </div>
        </div>
      )}

      {active === "enquiries" && (
        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#ef4444]">
          <h3 className="text-2xl font-black uppercase italic mb-6">Inbound Pipeline</h3>
          <p className="text-sm font-bold uppercase mb-8">Decide how to route incoming traffic.</p>
          <div className="border-t-4 border-black">
            <div className="py-20 text-center font-black uppercase text-slate-300 italic">No unassigned inquiries at this moment.</div>
          </div>
        </div>
      )}

      {active === "centers" && (
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000]">
            <h3 className="text-2xl font-black uppercase italic mb-6">Team Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-black font-bold uppercase text-xs">
                <span>Counsellor A (Staff)</span>
                <Badge className="bg-blue-600 rounded-none">12 Assets</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-black font-bold uppercase text-xs">
                <span>Regional Center (Partner)</span>
                <Badge className="bg-yellow-500 rounded-none">44 Admissions</Badge>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border-4 border-red-600 p-8 shadow-[12px_12px_0px_0px_#ef4444]">
            <h3 className="text-2xl font-black uppercase italic mb-4 text-red-600">Access Key Generation</h3>
            <p className="text-xs font-bold uppercase mb-6 text-red-900/60 leading-relaxed">Invite a new center or staff member to the system. They will only have access to their specific role portal.</p>
            <div className="space-y-4">
              <input placeholder="ENTER EMAIL ADDRESS" className="w-full h-14 px-4 bg-white border-4 border-black rounded-none outline-none font-black uppercase focus:bg-white" />
              <select className="w-full h-14 px-4 bg-white border-4 border-black rounded-none outline-none font-black uppercase appearance-none">
                <option>CENTER ACCESS</option>
                <option>STAFF ACCESS</option>
              </select>
              <Button className="w-full h-14 bg-red-600 text-white rounded-none border-4 border-black font-black uppercase text-xl shadow-[6px_6px_0px_0px_#000]">Issue Access Key</Button>
            </div>
          </div>
        </div>
      )}
    </CrmShell>
  );
}

function StatsCard({ label, value, icon: Icon, trend }: { label: string; value: string; icon: any; trend?: "success" | "danger" }) {
  return (
    <div className={`bg-white border-4 border-black p-6 shadow-[10px_10px_0px_0px_#000] flex flex-col justify-between h-[180px] ${trend === 'danger' ? 'bg-red-50' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="font-black uppercase text-[10px] tracking-widest text-slate-500">{label}</div>
        <div className="bg-black text-white p-1.5"><Icon className="w-5 h-5" /></div>
      </div>
      <div className={`text-5xl font-black uppercase italic leading-none ${trend === 'danger' ? 'text-red-600' : ''}`}>{value}</div>
    </div>
  );
}
