import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, UserCog, Mail, Receipt, TrendingUp, ShieldAlert, Settings, LogOut, CheckCircle, ArrowUpRight, BarChart4, Building, ShieldCheck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const Route = createFileRoute("/admin")({
  component: AdminMasterDashboard,
});

function AdminMasterDashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const isMaster = user?.email?.toLowerCase() === "ulfathai003@gmail.com";

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      navigate({ to: "/login" });
    }
  }, [user, role, loading, navigate, role]);

  if (loading || role !== "admin") return <div className="grid place-items-center min-h-screen font-black uppercase italic text-red-600">Validating Super-Admin Authority...</div>;

  return (
    <DashboardLayout>
      <div className="mb-12 border-l-8 border-red-600 pl-6 py-2">
        <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-none mb-2">The War Room</h1>
        <p className="text-red-600 font-black uppercase text-xs tracking-[0.2em]">JoinOnline Management System · PRASHANT BHAI ACCESS ONLY</p>
      </div>

      <Tabs defaultValue="financials" className="w-full">
        <TabsList className="bg-transparent border-b-4 border-black w-full justify-start rounded-none h-auto p-0 mb-10 overflow-x-auto overflow-y-hidden">
          <TabsTrigger value="financials" className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-none border-b-0 border-t-0 border-x-0 font-black uppercase italic px-8 py-4 text-sm transition-all border-r-4 border-black">
            <TrendingUp className="w-4 h-4 mr-2" /> Live Ledger
          </TabsTrigger>
          <TabsTrigger value="enquiries" className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-none border-b-0 border-t-0 border-x-0 font-black uppercase italic px-8 py-4 text-sm transition-all border-r-4 border-black">
            <Mail className="w-4 h-4 mr-2" /> Leads Monitor
          </TabsTrigger>
          <TabsTrigger value="centers" className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-none border-b-0 border-t-0 border-x-0 font-black uppercase italic px-8 py-4 text-sm transition-all border-r-4 border-black">
            <UserCog className="w-4 h-4 mr-2" /> Team & Centers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financials">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <StatsCard label="Total Booked" value="₹12.4L" icon={BarChart4} />
            <StatsCard label="Net Collected" value="₹8.1L" icon={Receipt} />
            <StatsCard label="Unpaid Balance" value="₹4.3L" icon={ArrowUpRight} trend="danger" />
          </div>
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#ef4444]">
            <h3 className="text-2xl font-black uppercase italic mb-6">Global Student Roster</h3>
            <p className="font-bold text-xs uppercase text-muted-foreground italic mb-10">Centralized view of all records from all staff and centers.</p>
            <div className="flex items-center gap-4 py-20 justify-center border-4 border-dashed border-red-100">
               <p className="font-black uppercase italic text-red-200 text-6xl opacity-20">SYSTEM LIVE</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="enquiries">
           <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#ef4444]">
             <h3 className="text-2xl font-black uppercase italic mb-6">Inbound Pipeline</h3>
             <p className="text-sm font-bold uppercase mb-8">Decide how to route incoming traffic.</p>
             <div className="border-t-4 border-black">
               <div className="py-20 text-center font-black uppercase text-slate-300 italic">No unassigned inquiries at this moment.</div>
             </div>
           </div>
        </TabsContent>

        <TabsContent value="centers">
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
        </TabsContent>
      </Tabs>
    </DashboardLayout>
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
