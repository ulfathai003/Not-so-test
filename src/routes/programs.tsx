import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs — Online BBA & MBA Specializations | EduConnect" },
      { name: "description", content: "Browse 20+ specializations across Online BBA and MBA, offered by Jain, Manipal, Amity, NMIMS, IGNOU and LPU." },
    ],
  }),
  component: ProgramsPage,
});

const bba = ["Marketing", "Finance", "Digital Marketing", "International Business", "Entrepreneurship", "Logistics & Supply Chain"];
const mba = ["Finance", "Marketing", "Human Resources", "Operations", "Business Analytics", "IT & Systems", "Healthcare Management", "International Business"];

function ProgramsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="pt-28 pb-24 flex-1">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl">
            Programs that <span className="text-gradient">power careers.</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
            Two flagship degrees, dozens of specializations, six top universities. Choose what fits.
          </p>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <ProgramCard title="Online BBA" duration="3 years · 6 semesters" fees="from ₹1.2 L total" specs={bba} accent="card" />
            <ProgramCard title="Online MBA" duration="2 years · 4 semesters" fees="from ₹1.8 L total" specs={mba} accent="hero" />
          </div>

          <div className="mt-16 rounded-3xl bg-gradient-soft border border-border p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold">Not sure which program is for you?</h2>
            <p className="mt-2 text-muted-foreground">Talk to a counselor for a free 20-minute career consult.</p>
            <Button asChild className="mt-6 bg-gradient-hero shadow-glow"><Link to="/contact">Book a consult</Link></Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProgramCard({ title, duration, fees, specs, accent }: { title: string; duration: string; fees: string; specs: string[]; accent: "hero" | "card" }) {
  const heroish = accent === "hero";
  return (
    <div className={heroish ? "rounded-3xl bg-gradient-hero text-primary-foreground p-8 md:p-10 shadow-glow" : "rounded-3xl bg-gradient-card border border-border p-8 md:p-10 shadow-card"}>
      <h3 className="text-3xl font-display font-bold">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm opacity-90">
        <span>{duration}</span><span>•</span><span>{fees}</span>
      </div>
      <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
        {specs.map((s) => (
          <li key={s} className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 shrink-0" /> {s}</li>
        ))}
      </ul>
      <div className="mt-8">
        <Button asChild variant={heroish ? "secondary" : "default"} className={heroish ? "" : "bg-gradient-hero text-primary-foreground"}>
          <Link to="/signup">Apply now</Link>
        </Button>
      </div>
    </div>
  );
}
