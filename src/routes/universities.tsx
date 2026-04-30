import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/universities")({
  head: () => ({
    meta: [
      { title: "Partner Universities | EduConnect" },
      { name: "description", content: "EduConnect partners with Jain, Manipal, Amity, NMIMS, IGNOU and LPU for online degree programs." },
    ],
  }),
  component: UniversitiesPage,
});

const universities = [
  { name: "Jain (Deemed-to-be) University", city: "Bengaluru", note: "NAAC A++, ranked among top private universities for online MBA." },
  { name: "Manipal University", city: "Manipal", note: "Pioneer in online education with strong industry connect." },
  { name: "Amity University", city: "Noida", note: "QS-ranked private university with global alumni network." },
  { name: "NMIMS", city: "Mumbai", note: "Distance learning powered by India's #1 private business school." },
  { name: "IGNOU", city: "New Delhi", note: "World's largest open university — affordable, recognised, flexible." },
  { name: "LPU", city: "Phagwara", note: "NAAC A++, widely recognised online & distance programs." },
];

function UniversitiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="pt-28 pb-24 flex-1">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl">
            Trusted partners. <span className="text-gradient">Recognised degrees.</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
            Every degree on EduConnect is delivered directly by the partner university and is UGC-DEB recognised.
          </p>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {universities.map((u) => (
              <div key={u.name} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card hover:shadow-glow transition-shadow">
                <span className="inline-grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-4">
                  <Building2 className="w-5 h-5" />
                </span>
                <h3 className="font-display font-semibold text-lg">{u.name}</h3>
                <div className="text-xs text-muted-foreground mt-1">{u.city}</div>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{u.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button asChild size="lg" className="bg-gradient-hero shadow-glow"><Link to="/signup">Apply now</Link></Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
