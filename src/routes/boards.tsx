import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/boards")({
  head: () => ({ meta: [{ title: "Educational Boards | JoinOnline Education" }] }),
  component: BoardsPage,
});

const BOARDS = [
  { name: "SBSE (Sikkim Board)", desc: "Recognized state board for 10th and 12th distance education, accepted nationwide for degree admissions." },
  { name: "NIOS", desc: "National Institute of Open Schooling — the central government's open schooling board for 10th/12th equivalency." },
  { name: "NWAC (USA)", desc: "International accreditation body recognized for secondary education equivalency abroad." },
];

function BoardsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border-b-4 border-foreground pb-4">
          <h1 className="font-headline text-4xl uppercase tracking-tight flex items-center gap-3"><BookOpen className="w-9 h-9" /> Educational Boards</h1>
          <p className="font-serif-news text-sm italic mt-1 text-[#6b3e1a]">Boards recognized for 10th / 12th equivalency ahead of degree admission.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {BOARDS.map((b) => (
            <div key={b.name} className="bg-[#fbf6e7] border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_#1a1410]">
              <h3 className="font-headline text-xl uppercase">{b.name}</h3>
              <p className="font-serif-news text-sm italic mt-2 text-foreground/80">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
