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
  { 
    name: "Jain (Deemed-to-be) University", 
    city: "Bengaluru", 
    note: "NAAC A++, ranked among top private universities for online MBA.",
    courses: "Online MBA, MCA, BBA, B.Com",
    affiliation: "UGC-DEB, AICTE",
    id: "jain"
  },
  { 
    name: "Manipal University", 
    city: "Manipal", 
    note: "Pioneer in online education with strong industry connect.",
    courses: "Online MBA, MCA, BBA, B.Com, BCA",
    affiliation: "UGC-DEB",
    id: "manipal"
  },
  { 
    name: "Amity University", 
    city: "Noida", 
    note: "QS-ranked private university with global alumni network.",
    courses: "Online MBA, BBA, BCA, MCA, BA",
    affiliation: "UGC-DEB, WASC",
    id: "amity"
  },
  { 
    name: "NMIMS", 
    city: "Mumbai", 
    note: "Distance learning powered by India's #1 private business school.",
    courses: "Online MBA, Diploma, BBA",
    affiliation: "UGC-DEB",
    id: "nmims"
  },
  { 
    name: "Sikkim Board (SBSE)", 
    city: "Gangtok", 
    note: "Flexible schooling options for 10th and 12th standards.",
    courses: "Secondary & Senior Secondary",
    affiliation: "Sikkim State Government",
    id: "sikkim-board"
  },
  { 
    name: "LPU", 
    city: "Phagwara", 
    note: "NAAC A++, widely recognised online & distance programs.",
    courses: "Online MBA, MCA, BBA, BCA",
    affiliation: "UGC-DEB",
    id: "lpu"
  },
];

function UniversitiesPage() {
  const navigate = useNavigate();

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
            <div 
              key={u.id} 
              onClick={() => navigate(`/programs?university=${u.id}`)}
              className="news-card border border-foreground p-5 flex flex-col justify-between cursor-pointer hover:bg-[#fbf6e7] transition-colors"
            >
              <div>
                <p className="news-kicker text-xs">{u.city}</p>
                <h3 className="font-headline text-2xl mt-1.5 leading-tight">{u.name}</h3>
                <div className="news-divider my-3" />
                <p className="font-serif-news text-sm leading-relaxed text-foreground/90">
                  {u.note}
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-[11px] font-serif-news italic"><strong>Courses:</strong> {u.courses}</p>
                  <p className="text-[11px] font-serif-news italic"><strong>Affiliation:</strong> {u.affiliation}</p>
                </div>
              </div>
              <div className="mt-5 flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/60">
                  VERIFIED
                </span>
                <span className="text-[10px] font-serif-news uppercase tracking-widest opacity-50">Details →</span>
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
