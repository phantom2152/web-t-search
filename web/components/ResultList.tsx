import { useState } from "react";
import { seedClass } from "../lib/format";
import type { Result } from "../lib/types";
import { CopyButton } from "./CopyButton";

// Full class names (not built dynamically) so Tailwind can see them.
const COLS = {
  date: "md:grid-cols-[minmax(0,1fr)_84px_64px_64px_104px_112px]",
  datetime: "md:grid-cols-[minmax(0,1fr)_84px_64px_64px_144px_112px]",
} as const;

interface ResultListProps {
  results: Result[];
  /** "datetime" gives the date column room for "YYYY-MM-DD HH:MM" */
  dateFormat?: keyof typeof COLS;
  dateLabel?: string;
}

export function ResultList({ results, dateFormat = "date", dateLabel = "date" }: ResultListProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const cols = COLS[dateFormat];

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-well">
      <div
        className={`hidden items-center gap-x-4 border-b border-line bg-panel px-3 py-2.5 text-xs text-muted md:grid ${cols}`}
      >
        <span>name</span>
        <span>size</span>
        <span>seeds</span>
        <span>peers</span>
        <span>{dateLabel}</span>
        <span />
      </div>
      {results.map((r) => (
        <ResultRow
          key={r.id}
          result={r}
          cols={cols}
          open={openId === r.id}
          onToggle={() => setOpenId(openId === r.id ? null : r.id)}
        />
      ))}
    </div>
  );
}

interface RowProps {
  result: Result;
  cols: string;
  open: boolean;
  onToggle: () => void;
}

function ResultRow({ result: r, cols, open, onToggle }: RowProps) {
  return (
    <div className={`border-b border-line-soft last:border-b-0 ${open ? "bg-panel" : ""}`}>
      <div
        className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 px-3 py-2.5 md:gap-x-4 ${cols}`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="text-left leading-snug [overflow-wrap:anywhere] hover:text-accent"
        >
          <span className="text-muted">{open ? "v" : ">"}</span>{" "}
          {r.tag && <span className="mr-2 rounded border border-edge-hi px-1.5 text-accent">{r.tag}</span>}
          <span>{r.title}</span>
        </button>

        <span className="order-3 col-span-full flex flex-wrap gap-x-3.5 gap-y-0.5 md:contents">
          <span>{r.size}</span>
          <span className={`font-bold ${seedClass(r.seeds)}`}>
            {r.seeds}
            <span className="font-normal text-muted"> ↑</span>
          </span>
          <span className="text-info">
            {r.peers}
            <span className="text-muted"> ↓</span>
          </span>
          <span className="text-muted">{r.date}</span>
        </span>

        <CopyButton text={r.magnet} className="col-start-2 row-start-1 justify-self-end md:col-auto md:row-auto" />
      </div>

      {open && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-6 gap-y-3 pb-4 pl-8.5 pr-3 pt-1 text-xs text-soft">
          {r.details
            .filter((d) => d.value !== "")
            .map((d) => (
              <div key={d.label} className={d.wide ? "col-span-full" : ""}>
                <div className="text-muted">{d.label}</div>
                <div className="[overflow-wrap:anywhere]">{d.value}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}