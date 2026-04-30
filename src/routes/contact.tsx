import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact EduConnect" },
      { name: "description", content: "Get in touch with our admissions team. We respond within one working day." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="pt-28 pb-24 flex-1">
        <div className="container mx-auto px-4 grid gap-12 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">Talk to us. <span className="text-gradient">Anytime.</span></h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-md">Free counselling Mon–Sat, 9am to 8pm IST. We respond to every email within one working day.</p>
            <div className="mt-10 space-y-5">
              <Info icon={Mail} label="admissions@educonnect.app" />
              <Info icon={Phone} label="+91 80 4000 0000" />
              <Info icon={MapPin} label="HSR Layout, Bengaluru, KA" />
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                toast.success("Got it! A counselor will reach out within a day.");
                (e.target as HTMLFormElement).reset();
              }, 700);
            }}
            className="bg-gradient-card border border-border rounded-3xl p-8 shadow-card space-y-4"
          >
            <div><Label htmlFor="n">Full name</Label><Input id="n" required maxLength={100} /></div>
            <div><Label htmlFor="e">Email</Label><Input id="e" type="email" required maxLength={255} /></div>
            <div><Label htmlFor="p">Phone</Label><Input id="p" maxLength={20} /></div>
            <div><Label htmlFor="m">Message</Label><Textarea id="m" rows={4} required maxLength={1000} /></div>
            <Button disabled={loading} className="w-full bg-gradient-hero shadow-glow">{loading ? "Sending..." : "Send message"}</Button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Info({ icon: Icon, label }: { icon: typeof Mail; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid place-items-center w-10 h-10 rounded-xl bg-primary/10 text-primary"><Icon className="w-4 h-4" /></span>
      <span className="text-sm">{label}</span>
    </div>
  );
}
