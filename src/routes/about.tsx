import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About EduConnect Times" },
      { name: "description", content: "EduConnect is a distance education partner connecting working professionals with India's top universities." },
    ],
  }),
  component: AboutPage,
});

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
            By the EduConnect Editorial Desk · Bengaluru · Est. 2016
          </p>
          <div className="news-divider-double mt-6" />
        </section>

        {/* Lead story */}
        <section className="mt-8 news-columns-3 font-serif-news text-[15px] leading-[1.7] news-dropcap">
          <p className="mb-4">
            EduConnect began, in the summer of 2016, as a single-page counselling service in a
            co-working space in HSR Layout, Bengaluru. The idea was straightforward: working
            professionals in India deserved access to the same quality of business education
            as those who could afford to quit their jobs for two years.
          </p>
          <p className="mb-4">
            Ten years on, we have helped more than twelve thousand learners navigate the
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
            the word, a bureau: a place where information is gathered, verified, and made
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
              { k: "12,000+", v: "Learners across India" },
              { k: "6", v: "Partner universities" },
              { k: "20+", v: "Specializations" },
              { k: "94%", v: "Completion rate" },
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
        <section className="mt-12 news-rule py-8 px-6 news-card">
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

      </main>
      <SiteFooter />
    </div>
  );
}
