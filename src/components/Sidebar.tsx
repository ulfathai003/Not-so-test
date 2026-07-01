import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  Users,
  Receipt,
  Building,
  BookOpen,
  UserCog,
  ShieldCheck,
  FileText,
  Settings,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard", search: { view: "overview" }, roles: ["super_admin", "admin", "center", "staff"] },
  { label: "Enquiries", icon: Mail, to: "/enquiries", roles: ["super_admin", "admin", "staff"] },
  { label: "Students", icon: Users, to: "/dashboard", search: { view: "students" }, roles: ["super_admin", "admin", "center"] },
  { label: "Payments", icon: Receipt, to: "/dashboard", search: { view: "payments" }, roles: ["super_admin", "center"] },
  { label: "Universities", icon: Building, to: "/universities", roles: ["super_admin", "admin"] },
  { label: "Boards", icon: BookOpen, to: "/boards", roles: ["super_admin", "admin"] },
  { label: "Centers", icon: Building, to: "/centers", roles: ["super_admin", "admin"] },
  { label: "Employees", icon: UserCog, to: "/employees", roles: ["super_admin", "admin"] },
  { label: "Approvals", icon: ShieldCheck, to: "/approvals", roles: ["super_admin"] },
  { label: "Enrollment No", icon: FileText, to: "/enrollment-no", roles: ["super_admin", "admin"] },
  { label: "Settings", icon: Settings, to: "/dashboard", search: { view: "settings" }, roles: ["super_admin", "admin"] },
];

export function Sidebar() {
  const { role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const filteredItems = sidebarItems.filter(item =>
    !item.roles || item.roles.includes(role as string)
  );

  const handleNav = (item: typeof sidebarItems[0]) => {
    (navigate as any)({ to: item.to, search: item.search });
  };

  return (
    <div className="w-64 bg-[#fbf6e7] border-r-4 border-foreground h-screen sticky top-0 flex flex-col z-50">
      <div className="p-6 border-b-4 border-foreground">
        <Link to="/" className="flex items-center gap-2 font-headline font-bold text-xl uppercase tracking-tighter">
          <span className="grid place-items-center w-8 h-8 border-2 border-foreground bg-foreground text-background shrink-0">
            <GraduationCap className="w-5 h-5" />
          </span>
          JoinOnline
        </Link>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-1 px-4">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.to && (!item.search || (location.search as any).view === item.search.view);
            return (
              <li key={item.label}>
                <button
                  onClick={() => handleNav(item)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 font-sans font-bold uppercase tracking-widest text-[10px] border-2 border-transparent transition-all pointer-events-auto cursor-pointer",
                    isActive 
                      ? "bg-foreground text-background border-foreground shadow-[4px_4px_0px_0px_#6b3e1a]" 
                      : "hover:bg-foreground/5 hover:border-foreground/20 text-foreground"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-background" : "text-foreground")} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t-4 border-foreground bg-foreground/5 text-[9px] font-sans font-black uppercase text-center tracking-tighter italic">
        Distance Education CRM v2.0
      </div>
    </div>
  );
}
