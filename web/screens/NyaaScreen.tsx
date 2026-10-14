import { useState } from "react";
import type { ReactNode } from "react";
import { Notice } from "../components/Notice";
import { ResultList } from "../components/ResultList";
import { SearchBox } from "../components/SearchBox";
import type { Result } from "../lib/types";
import { useLoad } from "../lib/useLoad";
import { searchNyaa, type NyaaOrder } from "../providers/nyaa";

const PAGE_SIZE = 75; // nyaa returns 75 rows per page
const ORDERS: NyaaOrder[] = ["seeders", "date"];
const PAGER_BTN =
  "rounded-md border border-edge px-4 py-1.5 hover:border-edge-hot disabled:text-muted disabled:hover:border-edge";

export function NyaaScreen({ tabs }: { tabs: ReactNode }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(""); // the query the current results belong to
  const [order, setOrder] = useState<NyaaOrder>("seeders");
  const [page, setPage] = useState(1);
  const [state, run] = useLoad<Result[]>();

  function load(q: string, o: NyaaOrder, p: number) {
    run((signal) => searchNyaa(q, { order: o, page: p }, signal).then((r) => r.results));
  }

  function submit() {
    const q = query.trim();
    if (!q) return;
    setSearched(q);
    setPage(1);
    load(q, order, 1);
  }

  function changeOrder(o: NyaaOrder) {
    setOrder(o);
    if (!searched) return;
    setPage(1);
    load(searched, o, 1);
  }

  function goto(p: number) {
    setPage(p);
    load(searched, order, p);
  }

  let body: ReactNode;
  if (state.kind === "idle") body = <Notice kind="info">type a query and press enter</Notice>;
  else if (state.kind === "loading") body = <Notice kind="info">searching nyaa…</Notice>;
  else if (state.kind === "error") body = <Notice kind="error">{state.message}</Notice>;
  else if (state.data.length === 0) body = <Notice kind="info">no results for "{searched}"</Notice>;
  else body = <ResultList results={state.data} dateFormat="datetime" dateLabel="uploaded" />;

  const showPager = state.kind === "ok" && (state.data.length > 0 || page > 1);

  return (
    <>
      <SearchBox
        value={query}
        onChange={setQuery}
        onSubmit={submit}
        busy={state.kind === "loading"}
        placeholder="anime, music, software…"
      />
      {tabs}

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-2" role="group" aria-label="Order by">
          order
          {ORDERS.map((o) => (
            <button
              key={o}
              type="button"
              aria-pressed={o === order}
              onClick={() => changeOrder(o)}
              className={`h-8.5 rounded-md border px-3.5 ${
                o === order ? "border-accent text-accent" : "border-edge text-muted hover:border-edge-hot"
              }`}
            >
              {o}
            </button>
          ))}
        </span>
        {state.kind === "ok" && (
          <span className="ml-auto">
            nyaa · {state.data.length} results · page {page} · ordered by {order}
          </span>
        )}
      </div>

      {body}

      {showPager && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button type="button" disabled={page <= 1} onClick={() => goto(page - 1)} className={PAGER_BTN}>
            ‹ prev
          </button>
          <span className="text-muted">
            page <span className="text-fg">{page}</span>
          </span>
          <button
            type="button"
            disabled={state.kind === "ok" && state.data.length < PAGE_SIZE}
            onClick={() => goto(page + 1)}
            className={PAGER_BTN}
          >
            next ›
          </button>
        </div>
      )}
    </>
  );
}