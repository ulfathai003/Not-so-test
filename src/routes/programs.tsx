import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GlobalFAQ } from "@/components/site/GlobalFAQ";
import { Check } from "lucide-react";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Online BBA & MBA Programs in India 2024 | JoinOnline Education" },
      { name: "description", content: "Explore 20+ UGC-DEB approved specializations for Online MBA and BBA. Weekend live classes, EMI options, and placement support across top Indian universities." },
    ],
  }),
  component: ProgramsPage,
});

const PROGRAM_FAQS = [
  {
    k: "specializations",
    q: "Which MBA specializations are most in-demand in India?",
    a: "Currently, Data Science, Digital Marketing, Business Analytics, and Fintech are seeing the highest salary hikes. Traditional specializations like HR, Finance, and Operations remain stable and highly valuable for corporate leadership roles."
  },
  {
    k: "credits",
    q: "How many credits do I need to earn for a BBA or MBA?",
    a: "As per the National Credit Framework (NCrF), a typical 2-year MBA requires 80–104 credits, while a 3-year BBA requires 120–132 credits. These are managed through your ABC ID (Academic Bank of Credits)."
  },
  {
    k: "exam-type",
    q: "What is the pattern of examinations?",
    a: "Most online exams are a mix of MCQs (Multiple Choice Questions) and subjective/case-study based questions. They are conducted via secure proctored browsers to maintain academic integrity."
  },
  {
    k: "work-exp",
    q: "Do I need work experience to join an Online MBA?",
    a: "No, work experience is not mandatory for Online MBA programs in India. However, having experience can help you better relate to the case studies and may provide an edge during campus placements."
  },
  {
    k: "dual-degree",
    q: "Can I pursue two online degrees simultaneously?",
    a: "Yes, as per the recent UGC notification, students can pursue two degrees simultaneously (one regular and one online, or two online/distance) provided the class timings do not overlap."
  }
];

const bba = ["Marketing", "Finance", "Digital Marketing", "International Business", "Entrepreneurship", "Logistics & Supply Chain"];
const mba = ["Finance", "Marketing", "Human Resources", "Operations", "Business Analytics", "IT & Systems", "Healthcare Management", "International Business"];

function ProgramsPage() {
  return (
    <div className="min-h-screen flex flex-col news-paper">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 flex-1">

        {/* Headline */}
        <section className="text-center max-w-5xl mx-auto">
          <p className="news-kicker">Programs · Special Report</p>
          <h2 className="mt-3 font-headline text-5xl md:text-7xl lg:text-8xl">
            Two Degrees. Twenty Tracks. One Application.
          </h2>
          <p className="mt-4 news-byline">
            By the JoinOnline Programs Desk · Updated for the 2026 Cohort
          </p>
          <div className="news-divider-double mt-6" />
        </section>

        {/* Lead copy */}
        <section className="mt-8 news-columns-3 font-serif-news text-[15px] leading-[1.7] news-dropcap">
          <p className="mb-4">
            Every program listed below is delivered in partnership with a UGC-DEB approved
            university. Classes run on weekends with recordings available indefinitely.
            Fees are payable in instalments. Scholarships are available for merit candidates.
          </p>
          <p className="mb-4">
            The BBA spans three years across six semesters and is designed for those entering
            the workforce. The MBA runs two years across four semesters and is built around
            the working professional who needs to upgrade without pausing their career.
          </p>
          <p className="mb-4">
            A counsellor is available, free of charge, to help you select the specialization
            that best matches your career goals. Apply now and begin within a fortnight.
          </p>
        </section>

        {/* Programs as featured sections */}
        <section className="mt-12 grid gap-0 md:grid-cols-2 md:divide-x md:divide-foreground/40 news-rule py-8">
          {/* BBA */}
          <article className="md:pr-8">
            <p className="news-kicker">Featured Section · Undergraduate</p>
            <h3 className="font-headline text-5xl mt-2">Online BBA</h3>
            <p className="news-byline mt-1">3 Years · 6 Semesters · UGC-DEB Approved</p>
            <div className="news-divider mt-3 pt-4 font-serif-news text-[15px] leading-relaxed">
              <p className="mb-3">
                A foundation in business, refined for the digital era. Ideal for class XII
                pass-outs and early-career professionals. Tuition payable in instalments.
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {bba.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link to="/signup" className="inline-block bg-foreground text-background px-5 py-2 font-serif-news text-sm uppercase tracking-widest">
                  Apply for BBA →
                </Link>
              </div>
            </div>
          </article>

          {/* MBA */}
          <article className="mt-8 md:mt-0 md:pl-8">
            <p className="news-kicker">Featured Section · Postgraduate</p>
            <h3 className="font-headline text-5xl mt-2">Online MBA</h3>
            <p className="news-byline mt-1">2 Years · 4 Semesters · AICTE & UGC-DEB</p>
            <div className="news-divider mt-3 pt-4 font-serif-news text-[15px] leading-relaxed">
              <p className="mb-3">
                The flagship qualification of the working professional. Live sessions on
                weekends, recordings available indefinitely. Supervised capstone projects.
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {mba.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link to="/signup" className="inline-block bg-foreground text-background px-5 py-2 font-serif-news text-sm uppercase tracking-widest">
                  Apply for MBA →
                </Link>
              </div>
            </div>
          </article>
        </section>

        {/* CTA editorial box */}
        <section className="mt-12 news-rule py-8 px-6 news-card mb-20">
          <p className="news-kicker">Editorial</p>
          <h3 className="font-headline text-3xl md:text-4xl mt-2 max-w-3xl">
            Not sure which program fits? A counsellor will help — free of charge.
          </h3>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/contact" className="bg-foreground text-background px-5 py-2 font-serif-news text-sm uppercase tracking-widest">
              Talk to a Counsellor
            </Link>
            <Link to="/universities" className="border border-foreground px-5 py-2 font-serif-news text-sm uppercase tracking-widest">
              View Partner Universities
            </Link>
          </div>
        </section>

        <GlobalFAQ faqs={PROGRAM_FAQS} />

      </main>
      <SiteFooter />
    </div>
  );
}

