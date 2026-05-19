import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/universities")({
  head: () => ({
    meta: [
      { title: "Partner Universities | EduConnect Times" },
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
    <div className="min-h-screen flex flex-col news-paper">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 flex-1">
        {/* Headline */}
        <section className="text-center max-w-4xl mx-auto">
          <p className="news-kicker">Universities · Accreditation & Ranking</p>
          <h2 className="mt-3 font-headline text-5xl md:text-7xl">
            Trusted Partners. UGC-DEB Recognised Degrees.
          </h2>
          <p className="mt-4 news-byline">
            A Certified Audit of Our Partnering Institutions
          </p>
          <div className="news-divider-double mt-6" />
        </section>

        {/* Intro */}
        <section className="mt-8 max-w-3xl mx-auto font-serif-news text-[15px] leading-relaxed text-center">
          <p className="mb-4">
            Every degree delivered through the EduConnect platform is awarded directly by the respective
            partner university. All programs comply fully with the regulations of the University Grants
            Commission (UGC) and the Distance Education Bureau (DEB).
          </p>
        </section>

        {/* Directory - styled as newspaper columns / advertisements */}
        <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 news-rule py-8">
          {universities.map((u) => (
            <div key={u.name} className="news-card border border-foreground p-5 flex flex-col justify-between">
              <div>
                <p className="news-kicker text-xs">{u.city}</p>
                <h3 className="font-headline text-2xl mt-1.5 leading-tight">{u.name}</h3>
                <div className="news-divider my-3" />
                <p className="font-serif-news text-sm leading-relaxed text-foreground/90">
                  {u.note}
                </p>
              </div>
              <div className="mt-5 text-right">
                <span className="text-[11px] font-mono uppercase tracking-widest text-foreground/60">
                  UGC-DEB APPROVED
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* Bottom CTA */}
        <section className="mt-12 text-center">
          <Link to="/signup" className="inline-block bg-foreground text-background px-6 py-2.5 font-serif-news text-sm uppercase tracking-widest">
            Apply Now to Partner Universities →
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
