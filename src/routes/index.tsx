import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EduConnect Times — Online MBA & BBA from India's Top Universities" },
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

const stats = [
  { k: "12,000+", v: "Active learners" },
  { k: "25+", v: "Partner universities" },
  { k: "50+", v: "Specializations" },
  { k: "94%", v: "Completion rate" },
];

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col news-paper">
      <SiteHeader />

      <main className="container mx-auto px-4 py-10">
        {/* HEADLINE */}
        <section className="text-center max-w-5xl mx-auto">
          <p className="news-kicker">Education · Special Report</p>
          <h2 className="mt-3 font-headline text-5xl md:text-7xl lg:text-8xl">
            Distance Learning, Redefined for a New Generation
          </h2>
          <p className="mt-4 news-byline">
            By the EduConnect Desk · Bengaluru · Filed for the 2026 cohort
          </p>
          <div className="news-divider-double mt-6" />
        </section>

        {/* LEAD STORY - 3 columns */}
        <section className="mt-8">
          <div className="news-columns-3 font-serif-news text-[15px] leading-[1.7] news-dropcap">
            <p className="mb-4">
              In an age when classrooms once demanded presence, a quiet revolution has arrived
              at the doorstep of the working professional. Online MBA, BBA and specialization
              programs from India's most respected universities — Jain, Manipal, Amity, NMIMS,
              IGNOU and LPU — are now within reach of anyone with an evening to spare and an
              ambition to chase.
            </p>
            <p className="mb-4">
              The EduConnect Times has, for ten years, chronicled this transformation. Every
              program on these pages is recognised by the UGC-DEB and AICTE. No asterisks. No
              fine print. Live and recorded sessions, flexible deadlines, and a mobile-first
              study app allow students to learn from Mumbai, Belagavi or a small town in Bihar
              with equal seriousness.
            </p>
            <p className="mb-4">
              Industry mentors — senior leaders from top Indian and global firms — sit one-on-one
              with each cohort. A dedicated career cell offers resume reviews, mock interviews,
              and direct referrals into hiring partner companies. The result: a degree that
              fits a life already in motion.
            </p>
            <p className="mb-4">
              Applications for the January and July 2026 cohorts are open. Interested readers
              may submit credentials in under ten minutes. A counsellor responds within a single
              working day. Classes begin within a fortnight.
            </p>
          </div>

          <div className="news-divider mt-6 pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link to="/programs" className="bg-foreground text-background px-6 py-2.5 font-serif-news text-sm uppercase tracking-widest">
              Read All Programs →
            </Link>
            <Link to="/contact" className="border border-foreground px-6 py-2.5 font-serif-news text-sm uppercase tracking-widest">
              Apply Today
            </Link>
          </div>
        </section>

        {/* DISTANCE EDUCATION FOR WHO? - REFINED SECTION */}
        <section className="mt-16 news-rule py-10 news-card bg-[#fbf6e7]">
           <p className="news-kicker">Special Feature</p>
           <h3 className="font-headline text-4xl md:text-5xl mt-2">Distance Education for Who?</h3>
           <div className="news-columns-2 mt-6 font-serif-news text-[16px] leading-relaxed">
             <p className="mb-4">
               <strong>The Working Professional:</strong> Those currently in the workforce who seek to upgrade their 
               credentials without pausing their career trajectory. Our programs are designed to fit 
               around a 9-to-5 schedule, with weekend live sessions and 24/7 portal access.
             </p>
             <p className="mb-4">
               <strong>Dropouts & Busy Learners:</strong> For those who had to leave their education 
               unfinished due to time, financial, or personal constraints. We offer a path to re-entry 
               into formal education with flexible credit systems and dedicated support.
             </p>
             <p className="mb-4">
               <strong>Early-Career Adventurers:</strong> Class XII graduates who wish to combine their first 
               degree with real-world internships. By studying online, you gain a three-year head start 
               in professional experience compared to traditional peers.
             </p>
             <p className="mb-4">
               <strong>Geographical Bound Learners:</strong> Aimed at students in Tier-2 and Tier-3 cities 
               who deserve the same quality of education as those in metros. Access India's top 
               universities from the comfort of your home.
             </p>
             <p className="mb-4">
               <strong>Eligibility:</strong> For Undergrad (BBA), a Class XII pass is mandatory. 
               For Postgrad (MBA), a recognized Bachelor's degree is required. No entrance exam 
               score is mandatory for most programs, focusing instead on prior academic merit.
             </p>
           </div>
        </section>

        {/* STATS as classified */}
        <section className="mt-12 news-rule py-6">
          <p className="news-kicker text-center mb-4">By the Numbers</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <div key={s.v} className={i < stats.length - 1 ? "md:border-r md:border-foreground/30" : ""}>
                <div className="font-headline text-4xl md:text-5xl">{s.k}</div>
                <div className="news-byline mt-2">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PARTNERS - classifieds row */}
        <section className="mt-12">
          <p className="news-kicker text-center">In Partnership With</p>
          <div className="news-divider mt-3 pt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 font-serif-news text-sm">
            {partners.map((p) => (
              <span key={p}>· {p} ·</span>
            ))}
          </div>
        </section>

        {/* TWO COLUMN: Programs + Features */}
        <section className="mt-12 grid gap-8 md:grid-cols-2 md:divide-x md:divide-foreground/40">
          <article className="md:pr-8">
            <p className="news-kicker">Featured Section</p>
            <h3 className="font-headline text-4xl mt-2">The Online BBA</h3>
            <p className="news-byline mt-1">3 Years · 6 Semesters · UGC-DEB Approved</p>
            <div className="news-divider mt-3 pt-3 font-serif-news text-[15px] leading-relaxed">
              <p className="mb-3">
                A foundation in business, refined for the digital era. Specializations include
                Marketing, Finance, Digital Business, International Trade and Entrepreneurship.
              </p>
              <p className="mb-3">
                Ideal for class XII pass-outs and early-career professionals who wish to combine
                a degree with work. Tuition payable in instalments. Scholarships available for
                merit candidates.
              </p>
              <Link to="/programs" className="news-link font-semibold uppercase tracking-wider text-xs">Continue reading →</Link>
            </div>
          </article>

          <article className="md:pl-8">
            <p className="news-kicker">Featured Section</p>
            <h3 className="font-headline text-4xl mt-2">The Online MBA</h3>
            <p className="news-byline mt-1">2 Years · 4 Semesters · AICTE & UGC-DEB</p>
            <div className="news-divider mt-3 pt-3 font-serif-news text-[15px] leading-relaxed">
              <p className="mb-3">
                The flagship qualification of the working professional. Tracks in Finance,
                Marketing, HR, Operations, Business Analytics, IT Systems and Healthcare
                Management.
              </p>
              <p className="mb-3">
                Live sessions on weekends, recordings available indefinitely. Capstone projects
                supervised by industry leaders. A career placement cell that has worked, by our
                own reckoning, with over twelve thousand learners.
              </p>
              <Link to="/programs" className="news-link font-semibold uppercase tracking-wider text-xs">Continue reading →</Link>
            </div>
          </article>
        </section>

        {/* OPINION / EDITORIAL */}
        <section className="mt-12 news-rule py-8 px-6 news-card">
          <p className="news-kicker">Editorial</p>
          <h3 className="font-headline text-3xl md:text-4xl mt-2 max-w-3xl">
            Your next chapter begins, in earnest, with a single decision.
          </h3>
          <div className="news-columns-2 mt-4 font-serif-news text-[15px] leading-relaxed">
            <p className="mb-3">
              The students who succeed in distance learning, we have observed across a decade,
              are not those with the most time, nor the most money, nor even the most prestigious
              prior credentials. They are those who decide — clearly, on a Tuesday afternoon —
              that the next two years will look different from the last.
            </p>
            <p className="mb-3">
              Apply now. Speak with a counsellor. Begin within a fortnight. The university will
              be waiting; the only variable is when you arrive. We see no reason for further delay.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/signup" className="bg-foreground text-background px-5 py-2 font-serif-news text-sm uppercase tracking-widest">
              Create Account
            </Link>
            <Link to="/contact" className="border border-foreground px-5 py-2 font-serif-news text-sm uppercase tracking-widest">
              Talk to a Counsellor
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
