import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Wallet } from "lucide-react";

export const Route = createFileRoute("/fees")({
  component: FeesPage,
});

function FeesPage() {
  return (
    <DashboardLayout>
      <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000]">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-6 flex items-center gap-3">
          <Wallet className="w-8 h-8 text-yellow-600" /> Fee Structure 2026
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-black font-black uppercase text-xs">
                <th className="py-2">Program</th>
                <th className="py-2">University</th>
                <th className="py-2">Semester Fee</th>
                <th className="py-2">One-Time Enrolment</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10 font-bold uppercase text-xs">
              <tr><td className="py-4">MBA</td><td className="py-4">Jain University</td><td className="py-4">₹22,500</td><td className="py-4">₹2,000</td></tr>
              <tr><td className="py-4">BBA</td><td className="py-4">Manipal University</td><td className="py-4">₹18,000</td><td className="py-4">₹1,500</td></tr>
              <tr><td className="py-4">10TH/12TH</td><td className="py-4">Sikkim Board</td><td className="py-4">₹6,500</td><td className="py-4">₹500</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
