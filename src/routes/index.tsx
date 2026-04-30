import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, GraduationCap, Globe2, ShieldCheck, Sparkles, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero3D } from "@/components/site/Hero3D";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EduConnect — Online MBA & BBA from India's Top Universities" },
      { name: "description", content: "UGC-DEB approved Online MBA and BBA from Jain, Manipal, Amity, NMIMS, IGNOU and LPU. Apply in minutes." },
    ],
  }),
  component: HomePage,
});

const partners = [
  "Jain (Deemed-to-be) University",
  "Manipal University",
  "Amity University",
  "NMIMS",
  "IGNOU",
  "LPU",
];

const features = [
  { icon: ShieldCheck, title: "UGC-DEB Approved", body: "Every program is recognised by UGC-DEB and AICTE — no asterisks, no surprises." },
  { icon: Globe2, title: "Learn from anywhere", body: "Live + recorded sessions, flexible deadlines, mobile-first study app." },
  { icon: Users, title: "Industry mentors", body: "1:1 mentorship from senior leaders at top Indian and global firms." },
  { icon: TrendingUp, title: "Placement support", body: "Dedicated career cell with resume reviews, mock interviews and referrals." },
];

const stats = [
  { k: "12K+", v: "Active learners" },
  { k: "6", v: "Partner universities" },
  { k: "20+", v: "Specializations" },
  { k: "94%", v: "Completion rate" },
];

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative pt-16 min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft" />
        <Hero3D />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

        <div className="relative container mx-auto px-4 pt-20 md:pt-28 pb-24">
          <div className="max-w-3xl animate-float-up">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" /> New cohorts opening for 2026
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.05]">
              Distance learning,{" "}
              <span className="text-gradient">redefined.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
              Online MBA, BBA and specialization programs from India's most respected universities — Jain, Manipal, Amity, NMIMS, IGNOU and LPU. Built for working professionals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-hero hover:opacity-95 shadow-glow group">
                <Link to="/programs">
                  Explore programs
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">Student / Admin login</Link>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
              {stats.map((s) => (
                <div key={s.v}>
                  <div className="text-2xl md:text-3xl font-display font-bold text-gradient">{s.k}</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS strip */}
      <section className="border-y border-border/60 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
          <span className="text-xs uppercase tracking-widest text-foreground/60">In partnership with</span>
          {partners.map((p) => (
            <span key={p} className="font-display font-medium text-foreground/80">{p}</span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              A degree that fits <span className="text-gradient">your life.</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Everything you need to upskill — without quitting your job, family or city.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card hover:shadow-glow transition-shadow">
                <span className="inline-grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary mb-4">
                  <f.icon className="w-5 h-5" />
                </span>
                <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS PREVIEW */}
      <section className="py-24 bg-gradient-soft border-y border-border/60">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold">Choose your path</h2>
              <p className="mt-3 text-muted-foreground">Two flagship programs. Twenty plus specializations.</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/programs">All programs <ArrowRight className="ml-1 w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Link to="/programs" className="group relative overflow-hidden rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-glow">
              <BookOpen className="w-10 h-10 mb-6 opacity-90" />
              <h3 className="text-3xl md:text-4xl font-display font-bold">Online BBA</h3>
              <p className="mt-3 opacity-90 max-w-md">Marketing, Finance, Digital, International Business, Entrepreneurship and more.</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
            </Link>
            <Link to="/programs" className="group relative overflow-hidden rounded-3xl bg-gradient-card border border-border p-10 shadow-card">
              <GraduationCap className="w-10 h-10 mb-6 text-primary" />
              <h3 className="text-3xl md:text-4xl font-display font-bold">Online MBA</h3>
              <p className="mt-3 text-muted-foreground max-w-md">Finance, Marketing, HR, Operations, Business Analytics, IT & Systems, Healthcare and more.</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
                Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-16 text-primary-foreground shadow-glow">
            <h2 className="text-3xl md:text-5xl font-bold max-w-2xl leading-tight">
              Your next chapter starts with one click.
            </h2>
            <p className="mt-4 max-w-xl opacity-90">
              Apply now, get matched with the right university, and start learning within 14 days.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/signup">Create account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white/40 text-primary-foreground hover:bg-white/10">
                <Link to="/contact">Talk to a counselor</Link>
              </Button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
