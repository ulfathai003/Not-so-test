import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About EduConnect" },
      { name: "description", content: "EduConnect is a distance education partner connecting working professionals with India's top universities." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="pt-28 pb-24 flex-1">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">About <span className="text-gradient">EduConnect.</span></h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            EduConnect is a distance education enabler that brings together working professionals and India's most respected universities. We handle counselling, applications, learning support and placements — universities handle the academics.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Stat k="2019" v="Founded in Bengaluru" />
            <Stat k="12K+" v="Learners across India" />
            <Stat k="6" v="Partner universities" />
          </div>
          <h2 className="mt-16 text-2xl font-bold">Our promise</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Every program we list is UGC-DEB approved. Every counsellor is salaried, not commissioned. Every fee structure is transparent and listed up-front.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
      <div className="text-3xl font-display font-bold text-gradient">{k}</div>
      <div className="text-sm text-muted-foreground mt-1">{v}</div>
    </div>
  );
}
