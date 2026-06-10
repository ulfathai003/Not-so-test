import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ArrowLeft, BookOpen, ShieldCheck } from "lucide-react";
import { boards } from "@/lib/catalog";

export const Route = createFileRoute("/boards")({
  validateSearch: (search: Record<string, unknown>): { b?: string } =>
    typeof search.b === "string" ? { b: search.b } : {},
  head: () => ({
    meta: [
      { title: "School Boards | EduConnect Times" },
      {
        name: "description",
        content: "Complete your 10th or 12th through SBSE and NIOS — recognized open schooling boards.",
      },
    ],
  }),
  component: BoardsPage,
});

function BoardsPage() {
  const navigate = useNavigate();
  const { b } = Route.useSearch();
  const selectedBoard = boards.find((x) => x.id === b);

  const open = (id?: string) => navigate({ to: "/boards", search: { b: id } });

  return (
    <div className="min-h-screen flex flex-col news-paper">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 flex-1">
        {!selectedBoard ? (
          <>
            {/* Directory View */}
            <section className="text-center max-w-4xl mx-auto">
              <p className="news-kicker">Boards · 10th &amp; 12th Desk</p>
              <h2 className="mt-3 font-headline text-5xl md:text-7xl">
                The Open Schooling Board Register
              </h2>
              <p className="mt-4 news-byline">
                Recognized Boards on File: {boards.length} · Secondary &amp; Senior Secondary
              </p>
              <div className="news-divider-double mt-6" />
            </section>

            {/* Board dropdown — jumps straight to the chosen board */}
            <section className="mt-8 max-w-md mx-auto">
              <select
                className="w-full rounded-none border-2 border-foreground bg-white font-serif-news text-sm uppercase tracking-wider px-3 py-2.5 cursor-pointer shadow-[4px_4px_0px_0px_#1a1410]"
                defaultValue=""
                aria-label="Go to board"
                onChange={(e) => e.target.value && open(e.target.value)}
              >
                <option value="" disabled>
                  Select a Board (10th / 12th) →
                </option>
                {boards.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name} · {x.level}
                  </option>
                ))}
              </select>
            </section>

            <section className="mt-10 grid gap-6 sm:grid-cols-2 news-rule py-10">
              {boards.map((x) => (
                <div
                  key={x.id}
                  onClick={() => open(x.id)}
                  className="news-card border-2 border-foreground p-6 flex flex-col justify-between cursor-pointer group hover:bg-[#fbf6e7] transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_#000]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-headline text-2xl group-hover:underline underline-offset-4">{x.name}</h3>
                      <span className="bg-foreground text-background px-2 py-1 text-[10px] font-black uppercase shrink-0">
                        Class {x.level}
                      </span>
                    </div>
                    <p className="text-[10px] font-black uppercase text-foreground/50 mt-1">{x.body}</p>
                    <div className="news-divider my-4" />
                    <p className="font-serif-news text-sm leading-relaxed line-clamp-3">{x.description}</p>
                  </div>
                  <div className="mt-6 flex justify-between items-center bg-foreground text-background px-4 py-2">
                    <span className="text-[10px] font-black uppercase tracking-widest">Recognized Board</span>
                    <span className="text-[10px] font-bold">View Detail →</span>
                  </div>
                </div>
              ))}
            </section>
          </>
        ) : (
          /* Dedicated Board Page View */
          <section className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => open(undefined)}
              className="flex items-center gap-2 font-serif-news text-sm uppercase tracking-widest mb-8 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Boards
            </button>

            <div className="news-card border-4 border-foreground p-8 md:p-12 shadow-[12px_12px_0px_0px_#000]">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b-4 border-foreground pb-8 mb-8">
                <div>
                  <p className="news-kicker">Board Detail Report · Class {selectedBoard.level}</p>
                  <h2 className="font-headline text-5xl md:text-6xl mt-2">{selectedBoard.name}</h2>
                  <p className="news-byline mt-4">{selectedBoard.body}</p>
                </div>
                <div className="bg-foreground text-background p-4 flex flex-col items-center justify-center shrink-0">
                  <ShieldCheck className="w-10 h-10 mb-2" />
                  <span className="text-[10px] font-black uppercase">Recognized</span>
                </div>
              </div>

              <div className="news-columns-2 font-serif-news text-lg leading-relaxed mb-10">
                <p className="news-dropcap">{selectedBoard.description}</p>
                <p className="mt-4 md:mt-0 font-bold italic">"{selectedBoard.highlight}"</p>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="news-rule-vertical pr-8">
                  <h3 className="font-headline text-3xl mb-4">Core Subjects</h3>
                  <ul className="space-y-2">
                    {selectedBoard.subjects.map((s) => (
                      <li key={s} className="flex items-center gap-2 font-serif-news">
                        <BookOpen className="w-4 h-4 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-headline text-3xl mb-4">Eligibility</h3>
                  <div className="p-5 border-2 border-dashed border-foreground/30 bg-slate-50">
                    <p className="font-black uppercase text-xs mb-2">Who can apply</p>
                    <p className="font-serif-news text-sm">{selectedBoard.eligibility}</p>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Link
                      to="/contact"
                      state={{ university: selectedBoard.name } as any}
                      className="flex-1 bg-foreground text-background text-center py-3 font-serif-news uppercase tracking-widest text-xs hover:opacity-90"
                    >
                      Apply for Class {selectedBoard.level}
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
