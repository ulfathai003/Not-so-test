import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ArrowLeft, GraduationCap, ShieldCheck } from "lucide-react";
import { universities } from "@/lib/catalog";

export const Route = createFileRoute("/universities")({
  validateSearch: (search: Record<string, unknown>): { u?: string } =>
    typeof search.u === "string" ? { u: search.u } : {},
  head: () => ({
    meta: [
      { title: "University Directory | EduConnect Times" },
      { name: "description", content: "Detailed guide to our partner universities including Jain, Manipal, Amity, NMIMS and Sikkim Board." },
    ],
  }),
  component: UniversitiesPage,
});

function UniversitiesPage() {
  const navigate = useNavigate();
  const { u } = Route.useSearch();
  const selectedUni = universities.find((x) => x.id === u);

  const open = (id?: string) => navigate({ to: "/universities", search: { u: id } });

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
                The Certified Directory of Partner Universities
              </h2>
              <p className="mt-4 news-byline">
                Total Number of Verified Institutions: {universities.length}
              </p>
              <div className="news-divider-double mt-6" />
            </section>

            {/* University dropdown — jumps straight to the chosen university */}
            <section className="mt-8 max-w-md mx-auto">
              <select
                className="w-full rounded-none border-2 border-foreground bg-white font-serif-news text-sm uppercase tracking-wider px-3 py-2.5 cursor-pointer shadow-[4px_4px_0px_0px_#1a1410]"
                defaultValue=""
                aria-label="Go to university"
                onChange={(e) => e.target.value && open(e.target.value)}
              >
                <option value="" disabled>
                  Select a University →
                </option>
                {universities.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </section>

            <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 news-rule py-10">
              {universities.map((x) => (
                <div
                  key={x.id}
                  onClick={() => open(x.id)}
                  className="news-card border-2 border-foreground p-6 flex flex-col justify-between cursor-pointer group hover:bg-[#fbf6e7] transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_#000]"
                >
                  <div>
                    <h3 className="font-headline text-2xl group-hover:underline underline-offset-4">{x.name}</h3>
                    <p className="text-[10px] font-black uppercase text-foreground/50 mt-1">{x.city} · {x.affiliation}</p>
                    <div className="news-divider my-4" />
                    <p className="font-serif-news text-sm leading-relaxed line-clamp-3">
                      {x.description}
                    </p>
                  </div>
                  <div className="mt-6 flex justify-between items-center bg-foreground text-background px-4 py-2">
                    <span className="text-[10px] font-black uppercase tracking-widest">Active Partner</span>
                    <span className="text-[10px] font-bold">View Detail →</span>
                  </div>
                </div>
              ))}
            </section>
          </>
        ) : (
          /* Dedicated University Page View */
          <section className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => open(undefined)}
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
                        state={{ university: selectedUni.name } as any}
                        className="flex-1 bg-foreground text-background text-center py-3 font-serif-news uppercase tracking-widest text-xs hover:opacity-90"
                       >
                         Apply to {selectedUni.id === 'sikkim-board' ? 'Board' : 'Uni'}
                       </Link>
                    </div>
                 </div>
              </div>
            </div>
          </section>
        )}

      </main>
      <SiteFooter />
    </div>
  );
}
