import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GlobalFAQ } from "@/components/site/GlobalFAQ";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JoinOnline Education | UGC-DEB Approved Online MBA & BBA Hub India" },
      { name: "description", content: "Get your Online MBA, BBA & degrees from India's top universities: Jain, Manipal, Amity, NMIMS & LPU. 100% UGC-DEB recognised. Free career counselling & EMI options." },
      { name: "keywords", content: "distance education India, online MBA India, online BBA India, UGC-DEB approved universities, JoinOnline Education, part time degree India" },
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
  "Sikkim Board (SBSE)",
];

const stats = [
  { k: "15,000+", v: "Active learners" },
  { k: "10+", v: "Core Universities" },
  { k: "60+", v: "Specializations" },
  { k: "96%", v: "Completion rate" },
];

const HOME_FAQS = [
  {
    k: "auth",
    q: "Are the degrees from these universities regular or distance?",
    a: "All degrees offered through JoinOnline Education partners are UGC-DEB approved. They carry equal legal weightage as regular degrees for government jobs, promotions, and higher studies as per 2023 UGC guidelines."
  },
  {
    k: "exam",
    q: "How will the examinations be conducted for online programs?",
    a: "Most programs offer Online Proctored Exams (OPE) from the comfort of your home using a laptop with a webcam. Some distance programs also have designated exam centres across 500+ cities in India."
  },
  {
    k: "admission",
    q: "What documents are required for PAN-India admissions?",
    a: "You typically need: (1) 10th & 12th Marksheets, (2) Graduation Degree / Provisional Certificate, (3) Aadhar Card, (4) Passport-size photograph, (5) ABC ID."
  },
  {
    k: "placement",
    q: "Does JoinOnline Education provide placement assistance?",
    a: "Yes. We and our university partners — Jain, Manipal, Amity, NMIMS, LPU — provide dedicated career cells with direct referrals to 500+ hiring companies across India."
  },
  {
    k: "fees",
    q: "Can I pay my fees in installments or EMI?",
    a: "Absolutely. Every university offers semester-wise payment plans. We also assist in zero-cost or low-interest EMI options via our financial partners."
  }
];

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col news-paper">
      <SiteHeader />

      <main className="container mx-auto px-4 py-10 text-foreground">
        {/* HEADLINE */}
        <section className="text-center max-w-5xl mx-auto">
          <p className="news-kicker">Education · Special Report</p>
          <h2 className="mt-3 font-headline text-5xl md:text-7xl lg:text-8xl">
            Distance Learning, Redefined for a New Generation
          </h2>
          <p className="mt-4 news-byline italic">
            By the JoinOnline Desk · Pan-India Coverage · Published for the 2026 cohort
          </p>
          <div className="news-divider-double mt-6" />
        </section>

        {/* LEAD STORY - 3 columns */}
        <section className="mt-8">
          <div className="news-columns-3 font-serif-news text-[15px] leading-[1.7] news-dropcap text-justify">
            <p className="mb-4">
              In an age when classrooms once demanded presence, a quiet revolution has arrived
              at the doorstep of the working professional. Online MBA, BBA and specialization
              programs from India's most respected universities — Jain, Manipal, Amity, NMIMS,
              IGNOU and LPU — are now within reach of anyone with an ambition to chase.
            </p>
            <p className="mb-4">
              JoinOnline Education has become the definitive hub for this transformation. Every
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
          </div>

          <div className="news-divider mt-6 pt-6 flex flex-wrap items-center justify-center gap-4">
            <Link to="/programs" className="bg-foreground text-background px-8 py-3 font-serif-news text-sm uppercase tracking-widest hover:bg-foreground/90 transition-all font-bold">
              Read All Programs →
            </Link>
            <Link to="/universities" className="border-4 border-foreground px-8 py-3 font-serif-news text-sm uppercase tracking-widest hover:bg-slate-50 transition-all font-bold bg-white">
              View Universities
            </Link>
          </div>
        </section>

        {/* DISTANCE EDUCATION FOR WHO? - MANDATORY MOM SECTION */}
        <section className="mt-20 border-t-8 border-b-8 border-foreground py-12 px-6 md:px-12 bg-[#fbf6e7] shadow-[12px_12px_0px_0px_#000]">
           <div className="max-w-4xl mx-auto">
             <p className="news-kicker text-center mb-2">Target Audience Analysis</p>
             <h3 className="font-headline text-5xl md:text-6xl text-center mb-10 underline underline-offset-8">Distance Education for Who?</h3>
             
             <div className="grid md:grid-cols-2 gap-10 font-serif-news text-[17px] leading-relaxed">
               <div className="space-y-6">
                 <div>
                   <h4 className="font-headline text-2xl mb-1 flex items-center gap-2"><span className="bg-foreground text-background w-6 h-6 inline-grid place-items-center text-xs">01</span> The Working Professional</h4>
                   <p className="text-foreground/90">Those currently in the workforce who seek to upgrade their credentials without pausing their career trajectory. Weekend live sessions make this possible.</p>
                 </div>
                 <div>
                   <h4 className="font-headline text-2xl mb-1 flex items-center gap-2"><span className="bg-foreground text-background w-6 h-6 inline-grid place-items-center text-xs">02</span> Dropouts & Gap Learners</h4>
                   <p className="text-foreground/90">For those who had to leave their education unfinished. We provide a recognized path to re-entry into formal education with flexible credit systems.</p>
                 </div>
               </div>
               
               <div className="space-y-6">
                 <div>
                   <h4 className="font-headline text-2xl mb-1 flex items-center gap-2"><span className="bg-foreground text-background w-6 h-6 inline-grid place-items-center text-xs">03</span> Early-Career Adventurers</h4>
                   <p className="text-foreground/90">Class XII graduates who wish to combine their first degree with real-world internships, gaining a three-year head start in professional experience.</p>
                 </div>
                 <div>
                   <h4 className="font-headline text-2xl mb-1 flex items-center gap-2"><span className="bg-foreground text-background w-6 h-6 inline-grid place-items-center text-xs">04</span> Eligibility Breakdown</h4>
                   <ul className="space-y-1 text-sm font-bold uppercase tracking-tighter">
                     <li>· Undergrad (BBA): Class XII Pass</li>
                     <li>· Postgrad (MBA): Recognized Bachelor's</li>
                     <li>· NIOS/Sikkim: Previous Grade Marks Card</li>
                   </ul>
                 </div>
               </div>
             </div>
           </div>
        </section>

        {/* STATS as classified */}
        <section className="mt-16 news-rule py-10">
          <p className="news-kicker text-center mb-8">Official Registrar Report</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-6xl mx-auto">
            {stats.map((s, i) => (
              <div key={s.v} className={i < stats.length - 1 ? "md:border-r-2 md:border-foreground/20" : ""}>
                <div className="font-headline text-5xl md:text-6xl">{s.k}</div>
                <div className="news-byline mt-2 font-bold uppercase text-[10px] tracking-widest">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SIKKIM BOARD PROMO - MANDATORY MOM SECTION */}
        <section className="mt-16 news-card border-4 border-foreground p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 mb-20">
           <div className="flex-1">
              <p className="news-kicker">Education Bureau · Special Notice</p>
              <h3 className="font-headline text-4xl mt-2 mb-4">Complete Your 10th or 12th via Sikkim Board</h3>
              <p className="font-serif-news text-lg leading-relaxed mb-6">
                Are you missing your high school credentials? Through the Sikkim Board (SBSE), we offer 
                a streamlined, government-recognized path to your secondary and senior secondary certifications. 
                Ideal for working adults and those returning to the academic fold.
              </p>
              <Link to="/universities" className="bg-foreground text-background px-6 py-2.5 font-serif-news text-sm uppercase tracking-widest hover:opacity-90">
                 View Board Information →
              </Link>
           </div>
           <div className="w-full md:w-64 h-64 border-4 border-foreground flex items-center justify-center p-6 bg-slate-50 rotate-2 shrink-0">
              <p className="font-headline text-6xl text-center leading-none opacity-20">SBSE CASE FILE</p>
           </div>
        </section>

        <GlobalFAQ faqs={HOME_FAQS} />

      </main>

      <SiteFooter />
    </div>
  );
}

