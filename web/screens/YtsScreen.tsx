import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { MovieCard } from "../components/MovieCard";
import { MovieDetails } from "../components/MovieDetails";
import { Notice } from "../components/Notice";
import { SearchBox } from "../components/SearchBox";
import { useLoad } from "../lib/useLoad";
import { searchYts, type YtsPage } from "../providers/yts";

export function YtsScreen({ tabs }: { tabs: ReactNode }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [state, run] = useLoad<YtsPage>();
  const panelRef = useRef<HTMLDivElement>(null);

  // Bring the details panel into view when a card is picked; Esc closes it.
  useEffect(() => {
    if (!selectedId) return;
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  function submit() {
    const q = query.trim();
    if (!q) return;
    setSearched(q);
    setSelectedId(null);
    run((signal) => searchYts(q, signal));
  }

  const movies = state.kind === "ok" ? state.data.movies : [];
  const selected = movies.find((m) => m.id === selectedId);

  let body: ReactNode;
  if (state.kind === "idle") body = <Notice kind="info">type a movie title and press enter</Notice>;
  else if (state.kind === "loading")
    body = <Notice kind="info">searching yts… covers are fetched through the server, so this can take a few seconds</Notice>;
  else if (state.kind === "error") body = <Notice kind="error">{state.message}</Notice>;
  else if (movies.length === 0) body = <Notice kind="info">no results for "{searched}"</Notice>;
  else
    body = (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4">
        {movies.map((m) => (
          <MovieCard
            key={m.id}
            movie={m}
            selected={m.id === selectedId}
            onSelect={() => setSelectedId(m.id === selectedId ? null : m.id)}
          />
        ))}
      </div>
    );

  return (
    <>
      <SearchBox
        value={query}
        onChange={setQuery}
        onSubmit={submit}
        busy={state.kind === "loading"}
        placeholder="movie title…"
      />
      {tabs}

      {state.kind === "ok" && movies.length > 0 && (
        <div className="text-xs text-muted">
          yts · movies · {movies.length}
          {state.data.total > movies.length && ` of ${state.data.total}`} results for "{searched}" · click a card for
          details
        </div>
      )}

      {selected && (
        <div ref={panelRef} className="scroll-mt-4">
          <MovieDetails movie={selected} onClose={() => setSelectedId(null)} />
        </div>
      )}

      {body}
    </>
  );
}