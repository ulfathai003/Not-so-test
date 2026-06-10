import { useNavigate } from "@tanstack/react-router";
import { universities, boards } from "@/lib/catalog";

/* University & Board dropdowns that redirect straight to the
   selected entity's dedicated page. */

const selectCls =
  "w-full rounded-none border-2 border-foreground bg-white font-serif-news text-sm uppercase tracking-wider px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_#1a1410]";

export function QuickJump() {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 sm:grid-cols-2 w-full max-w-2xl mx-auto">
      <select
        className={selectCls}
        defaultValue=""
        aria-label="Go to university"
        onChange={(e) => {
          if (e.target.value) navigate({ to: "/universities", search: { u: e.target.value } });
        }}
      >
        <option value="" disabled>
          University Directory →
        </option>
        {universities.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      <select
        className={selectCls}
        defaultValue=""
        aria-label="Go to board"
        onChange={(e) => {
          if (e.target.value) navigate({ to: "/boards", search: { b: e.target.value } });
        }}
      >
        <option value="" disabled>
          Board (10th / 12th) →
        </option>
        {boards.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name} · {b.level}
          </option>
        ))}
      </select>
    </div>
  );
}
