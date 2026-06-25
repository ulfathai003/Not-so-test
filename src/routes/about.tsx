import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GlobalFAQ } from "@/components/site/GlobalFAQ";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About JoinOnline Education | India's Trusted Distance Learning Hub" },
      { name: "description", content: "Learn about JoinOnline Education's mission to simplify higher education in India. 15,000+ students, top university partners, and transparent counselling since 2016." },
    ],
  }),
  component: AboutPage,
});

const ABOUT_FAQS = [
  {
    k: "mission",
    q: "What is the mission of JoinOnline Education?",
    a: "Our mission is to democratize premium higher education in India by providing a transparent, tech-driven platform that connects students with the nation's best UGC-recognised universities."
  },
  {
    k: "trust",
    q: "Why should I trust JoinOnline Education over other portals?",
    a: "We are an authorized enrollment partner with direct university tie-ups. Unlike many agencies, we provide end-to-end support including fee payment assistance, document verification, and career coaching without any hidden service charges."
  },
  {
    k: "location",
    q: "Where is JoinOnline Education based?",
    a: "Our primary office is in Bengaluru, the hub of education and technology in India. However, we serve students across all 28 states and 8 Union Territories through our digital-first support system."
  },
  {
    k: "partners",
    q: "How do you select your university partners?",
    a: "We follow a strict 'Accreditation-First' strategy. We only partner with universities that hold a minimum NAAC 'A' grade and have a proven track record of student satisfaction and placement success."
  },
  {
    k: "founder",
    q: "Are the services at JoinOnline Education really free?",
    a: "Yes. Our expert admission counselling, document guidance, and university selection support are 100% free for all students. We are compensated by our university partners for managing their student outreach."
  }
];

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col news-paper">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 flex-1">

        {/* Headline */}
        <section className="text-center max-w-4xl mx-auto">
          <p className="news-kicker">About · Our Story</p>
          <h2 className="mt-3 font-headline text-5xl md:text-7xl">
            A Decade of Distance Learning, Faithfully Reported
          </h2>
          <p className="mt-4 news-byline">
            By the JoinOnline Editorial Desk · Pan-India Admissions · Est. 2016
          </p>
          <div className="news-divider-double mt-6" />
        </section>

        {/* Lead story */}
        <section className="mt-8 news-columns-3 font-serif-news text-[15px] leading-[1.7] news-dropcap border-b-2 border-slate-200 pb-10">
          <p className="mb-4">
            JoinOnline Education began, in the summer of 2016, as a single-page counselling service in a
            co-working space in HSR Layout, Bengaluru. The idea was straightforward: working
            professionals in India deserved access to the same quality of business education
            as those who could afford to quit their jobs for two years.
          </p>
          <p className="mb-4">
            Ten years on, we have helped more than fifteen thousand learners navigate the
            often-confusing landscape of distance and online education. We have watched
            regulations sharpen, universities invest seriously in digital infrastructure,
            and employers in every sector come to value the discipline that distance learning
            demands.
          </p>
          <p className="mb-4">
            Our promise has never changed: every counsellor on our team is salaried, not
            commissioned. Every fee structure is published before you speak to anyone. Every
            program we list is UGC-DEB recognised. No asterisks. No fine print.
          </p>
          <p className="mb-4">
            We are not a university. We do not issue degrees. We are, in the old sense of
            the word, a hub: a place where information is gathered, verified, and made
            available to those who need it. The degree is yours. The credential is the
            university's. We are the desk that helps you get from here to there.
          </p>
        </section>

        {/* Stats - classifieds style */}
        <section className="mt-12 news-rule py-6">
          <p className="news-kicker text-center mb-4">By the Numbers</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
            {[
              { k: "2016", v: "Founded in Bengaluru" },
              { k: "15,000+", v: "Learners across India" },
              { k: "10+", v: "Partner universities" },
              { k: "60+", v: "Specializations" },
              { k: "96%", v: "Completion rate" },
              { k: "100%", v: "UGC-DEB recognised" },
            ].map((s, i, arr) => (
              <div key={s.v} className={i < arr.length - 1 ? "md:border-r md:border-foreground/30" : ""}>
                <div className="font-headline text-4xl md:text-5xl">{s.k}</div>
                <div className="news-byline mt-2">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Promise - editorial box */}
        <section className="mt-12 news-rule py-8 px-6 news-card mb-20">
          <p className="news-kicker">Editorial Promise</p>
          <h3 className="font-headline text-3xl md:text-4xl mt-2 max-w-3xl">
            Every counsellor. Every program. Every fee. Fully transparent.
          </h3>
          <div className="news-columns-2 mt-4 font-serif-news text-[15px] leading-relaxed">
            <p className="mb-3">
              Our counsellors are paid salaries, not commissions. There is no financial
              incentive to steer you toward a more expensive program or a particular university.
              The advice you receive from us is the advice we would give our own families.
            </p>
            <p className="mb-3">
              Every program listed on our site includes its full fee structure, semester
              breakdown, and admission criteria — before you fill a form or speak to anyone.
              We believe informed decisions are better decisions.
            </p>
          </div>
        </section>

        <GlobalFAQ faqs={ABOUT_FAQS} />

      </main>
      <SiteFooter />
    </div>
  );
}

