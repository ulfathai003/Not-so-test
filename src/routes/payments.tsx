import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Wallet, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  return (
    <DashboardLayout>
      <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] text-center py-20">
        <Wallet className="w-16 h-16 mx-auto mb-4 text-green-600" />
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Collections & Payments</h2>
        <p className="font-bold opacity-60 mt-2 uppercase text-xs">Payment verification and fee tracking portal.</p>
        <div className="mt-10 border-t-2 border-dashed border-black pt-10">
          <p className="text-[10px] font-black uppercase text-slate-400">Secure Payment Gateway Integrated via Razorpay/Supabase</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
