import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GlobalFAQ } from "@/components/site/GlobalFAQ";
import { useState } from "react";
import { ChevronRight, ArrowLeft, GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/universities")({
  head: () => ({
    meta: [
      { title: "Top Online Universities in India 2024 | JoinOnline Education" },
      { name: "description", content: "Compare top UGC-DEB approved online universities like Jain, Manipal, Amity, and NMIMS. Get direct admission with expert counselling in India." },
    ],
  }),
  component: UniversitiesPage,
});

const UNIVERSITY_FAQS = [
  {
    k: "accreditation",
    q: "How can I verify if a university is UGC-DEB approved?",
    a: "You can verify the status of any university on the official UGC-DEB website portal. JoinOnline Education only partners with 'Category-1' and NAAC A/A+ rated universities that have standing approval for distance and online education."
  },
  {
    k: "rankings",
    q: "Which are the top-ranked online universities in India for 2024?",
    a: "Based on NIRF rankings and NAAC scores, Jain University, Manipal University Online, Amity Online, and NMIMS are among the top choices. Each has unique strengths in specific streams like Management, IT, or Commerce."
  },
  {
    k: "campus",
    q: "Can I visit the university campus if I am an online student?",
    a: "Yes! Online students are bonafide students of the university. You can visit the campus, use the library, and attend convocation ceremonies just like regular students. Most of our partners like Jain and LPU have massive, world-class campuses in Bengaluru and Punjab."
  },
  {
    k: "international",
    q: "Are the degrees from these universities valid for WES evaluation?",
    a: "Yes, degrees from NAAC A+ accredited universities like Jain and Manipal are typically cleared by WES (World Education Services) for Canada and USA immigration/higher studies. We provide assistance in document procurement for WES."
  },
  {
    k: "support",
    q: "Who will handle my queries after admission?",
    a: "You will have a dedicated Student Relationship Manager (SRM) from the university and a support contact from JoinOnline Education. We ensure a smooth journey from enrollment to degree certificate collection."
  }
];

const universities = [
  { 
    id: "jain",
    name: "Jain (Deemed-to-be) University", 
    city: "Bengaluru", 
    description: "Jain University is a hub for learning in every sense of the word. A regular recipient of NAAC A++ accreditation, it offers a world-class environment for online management and computer application studies.",
    courses: ["Online MBA", "Online MCA", "Online BBA", "Online B.Com"],
    affiliation: "UGC-DEB, AICTE Approved",
    ranking: "#68 NIRF Ranking",
    highlight: "Industry-aligned specializations and top-tier placement support.",
    faqs: [
      { k: "jain-naac", q: "What does NAAC A++ accreditation mean for Jain University?", a: "NAAC A++ is the highest possible grade awarded by India's National Assessment and Accreditation Council. It signifies excellence in curriculum, teaching, and infrastructure, ensuring your degree is globally competitive." },
      { k: "jain-electives", q: "Can I choose my electives in the second year at Jain Online?", a: "Yes, Jain University offers a wide array of over 30+ electives in MBA and MCA, allowing students to specialize in niche areas like Digital Marketing, Business Analytics, or FinTech." }
    ]
  },
  { 
    id: "manipal",
    name: "Manipal University", 
    city: "Manipal", 
    description: "Manipal Academy of Higher Education (MAHE) is an Institution of Eminence. Their online vertical brings the same academic rigour and prestige to your home screen.",
    courses: ["Online MBA", "Online MCA", "Online BBA", "Online B.Com", "Online BCA"],
    affiliation: "UGC-DEB Approved",
    ranking: "A++ Grade by NAAC",
    highlight: "Access to a global alumni network of over 300,000 professionals.",
    faqs: [
      { k: "manipal-eminence", q: "Is Manipal University Online considered an Institution of Eminence?", a: "Yes, MAHE (Manipal Academy of Higher Education) has been awarded the 'Institution of Eminence' status by the Government of India, reflecting its commitment to global standards of education." },
      { k: "manipal-lms", q: "What platform does Manipal use for online classes?", a: "Manipal University Online uses a world-class Learning Management System (LMS) with mobile app support, allowing for seamless offline access to study materials." }
    ]
  },
  { 
    id: "amity",
    name: "Amity University", 
    city: "Noida", 
    description: "Amity University Online is devoted to creating a transformative learning environment. With a presence in London, Dubai, and Singapore, they offer a truly global perspective.",
    courses: ["Online MBA", "Online BBA", "Online BCA", "Online MCA", "Online BA"],
    affiliation: "UGC-DEB, WASC (USA) Accredited",
    ranking: "Top 3% Globally",
    highlight: "Live interactive sessions with global faculty."
  },
  { 
    id: "nmims",
    name: "NMIMS", 
    city: "Mumbai", 
    description: "Narsee Monjee Institute of Management Studies is India's premier destination for management education. Their distance programs are powered by the same legendary faculty.",
    courses: ["Online MBA", "Post Graduate Diploma", "Online BBA"],
    affiliation: "UGC-DEB Approved",
    ranking: "Category 1 Autonomy",
    highlight: "Career services that have served over 12,000 learners."
  },
  { 
    id: "sikkim-board",
    name: "Sikkim Board (SBSE)", 
    city: "Gangtok", 
    description: "The Sikkim Board of Secondary Education (SBSE) provides a recognized and flexible path for students to complete their Class 10 and 12 certifications. It is an ideal board for those returning to education after a gap.",
    courses: ["Secondary (10th)", "Senior Secondary (12th)"],
    affiliation: "State Government of Sikkim",
    ranking: "Government Recognised",
    highlight: "Simplified examination patterns and widespread validity for higher studies."
  },
  { 
    id: "lpu",
    name: "LPU (Lovely Professional University)", 
    city: "Phagwara", 
    description: "LPU Online is known for its technological edge. They offer one of the most sophisticated Learning Management Systems (LMS) in the country, ensuring a seamless student experience.",
    courses: ["Online MBA", "Online MCA", "Online BBA", "Online BCA"],
    affiliation: "UGC-DEB, NAAC A++",
    ranking: "Top Private University",
    highlight: "Innovative pedagogy and weekend live masterclasses."
  },
];

function UniversitiesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedUni = universities.find(u => u.id === selectedId);

  return (
    <div className="min-h-screen flex flex-col news-paper">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 flex-1">
        
        {!selectedUni ? (
          <>
            {/* Directory View */}
            <section className="text-center max-w-4xl mx-auto">
              <p className="news-kicker">Universities · Special Audit</p>
              <h2 className="mt-3 font-headline text-5xl md:text-7xl">
                The Verified Directory of Partner Universities
              </h2>
              <p className="mt-4 news-byline">
                Total Number of Verified Institutions: {universities.length}
              </p>
              <div className="news-divider-double mt-6" />
            </section>

            <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 news-rule py-10">
              {universities.map((u) => (
                <div 
                  key={u.id} 
                  onClick={() => setSelectedId(u.id)}
                  className="news-card border-2 border-foreground p-6 flex flex-col justify-between cursor-pointer group hover:bg-[#fbf6e7] transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_#000]"
                >
                  <div>
                    <h3 className="font-headline text-2xl group-hover:underline underline-offset-4">{u.name}</h3>
                    <p className="text-[10px] font-black uppercase text-foreground/50 mt-1">{u.city} · {u.affiliation}</p>
                    <div className="news-divider my-4" />
                    <p className="font-serif-news text-sm leading-relaxed line-clamp-3">
                      {u.description}
                    </p>
                  </div>
                  <div className="mt-6 flex justify-between items-center bg-foreground text-background px-4 py-2">
                    <span className="text-[10px] font-black uppercase tracking-widest">Active Partner</span>
                    <span className="text-[10px] font-bold">View Detail →</span>
                  </div>
                </div>
              ))}
            </section>

            <div className="mt-20">
               <GlobalFAQ faqs={UNIVERSITY_FAQS} />
            </div>
          </>
        ) : (
          /* Dedicated University Page View */
          <section className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 mb-20">
            <button 
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-2 font-serif-news text-sm uppercase tracking-widest mb-8 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </button>

            <div className="news-card border-4 border-foreground p-8 md:p-12 shadow-[12px_12px_0px_0px_#000]">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b-4 border-foreground pb-8 mb-8">
                <div>
                  <p className="news-kicker">University Detail Report</p>
                  <h2 className="font-headline text-5xl md:text-6xl mt-2">{selectedUni.name}</h2>
                  <p className="news-byline mt-4">Headquarters: {selectedUni.city} · Ranking: {selectedUni.ranking}</p>
                </div>
                <div className="bg-foreground text-background p-4 flex flex-col items-center justify-center shrink-0">
                   <ShieldCheck className="w-10 h-10 mb-2" />
                   <span className="text-[10px] font-black uppercase">Verified</span>
                </div>
              </div>

              <div className="news-columns-2 font-serif-news text-lg leading-relaxed mb-10">
                <p className="news-dropcap">{selectedUni.description}</p>
                <p className="mt-4 md:mt-0 font-bold italic">"{selectedUni.highlight}"</p>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                 <div className="news-rule-vertical pr-8">
                    <h3 className="font-headline text-3xl mb-4">Offered Courses</h3>
                    <ul className="space-y-2">
                      {selectedUni.courses.map(c => (
                        <li key={c} className="flex items-center gap-2 font-serif-news">
                          <GraduationCap className="w-4 h-4 shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                 </div>
                 <div>
                    <h3 className="font-headline text-3xl mb-4">Board/Affiliations</h3>
                    <div className="p-5 border-2 border-dashed border-foreground/30 bg-slate-50">
                       <p className="font-black uppercase text-xs mb-2">Accreditations</p>
                       <p className="font-serif-news text-sm">{selectedUni.affiliation}</p>
                    </div>
                    <div className="mt-6 flex gap-3">
                       <Link 
                        to="/contact" 
                        search={{ university: selectedUni.name }}
                        className="flex-1 bg-foreground text-background text-center py-3 font-serif-news uppercase tracking-widest text-xs hover:opacity-90"
                       >
                         Apply to {selectedUni.id === 'sikkim-board' ? 'Board' : 'Uni'}
                       </Link>
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="mt-20">
               <GlobalFAQ faqs={(selectedUni as any)?.faqs || UNIVERSITY_FAQS} />
            </div>
          </section>
        )}

      </main>
      <SiteFooter />
    </div>
  );
}

