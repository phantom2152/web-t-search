import { useState } from "react";
import type { ReactNode } from "react";
import { Notice } from "../components/Notice";
import { ResultList } from "../components/ResultList";
import { SearchBox } from "../components/SearchBox";
import { ShowCard } from "../components/ShowCard";
import { parseImdbId } from "../lib/imdb";
import type { Result } from "../lib/types";
import { useLoad } from "../lib/useLoad";
import { searchEztv } from "../providers/eztv";
import { findShows, type ShowMatch } from "../providers/tvmaze";

interface Picked {
  name: string;
  year: string;
  imdb: string;
}

interface Page {
  results: Result[];
  page: number;
  total: number;
}

export function EztvScreen({ tabs }: { tabs: ReactNode }) {
  const [title, setTitle] = useState("");
  const [lookedUp, setLookedUp] = useState("");
  const [imdbInput, setImdbInput] = useState("");
  const [idError, setIdError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [matches, runMatches] = useLoad<ShowMatch[]>();
  const [torrents, runTorrents] = useLoad<Page>();

  function loadFirst(imdb: string) {
    runTorrents((signal) =>
      searchEztv(imdb, { page: 1 }, signal).then((r) => ({ results: r.results, page: r.page, total: r.total })),
    );
  }

  function findShow() {
    const q = title.trim();
    if (!q) return;
    setLookedUp(q);
    setPicked(null);
    runMatches((signal) => findShows(q, signal));
  }

  function pick(show: ShowMatch) {
    if (!show.imdb) return;
    setPicked({ name: show.name, year: show.year, imdb: show.imdb });
    loadFirst(show.imdb);
  }

  function searchById() {
    const id = parseImdbId(imdbInput);
    if (!id) {
      setIdError("expected something like tt0903747");
      return;
    }
    setIdError(null);
    setPicked({ name: id, year: "", imdb: id });
    loadFirst(id);
  }

  const page: Page | undefined =
    torrents.kind === "ok" ? torrents.data : torrents.kind === "idle" ? undefined : torrents.prev;
  const loadingMore = torrents.kind === "loading" && page !== undefined;
  const hasMore = page !== undefined && page.results.length < page.total;

  function loadMore() {
    if (!picked || !page) return;
    const { imdb } = picked;
    runTorrents(
      (signal) =>
        searchEztv(imdb, { page: page.page + 1 }, signal).then((r) => ({
          results: [...page.results, ...r.results],
          page: r.page,
          total: r.total,
        })),
      { keepPrevious: true },
    );
  }

  // --- step 3: results for the picked show
  let resultsBody: ReactNode;
  if (!page) {
    resultsBody =
      torrents.kind === "error" ? (
        <Notice kind="error">{torrents.message}</Notice>
      ) : (
        <Notice kind="info">searching eztv…</Notice>
      );
  } else if (page.results.length === 0) {
    resultsBody = <Notice kind="info">no torrents on eztv for {picked?.name}</Notice>;
  } else {
    resultsBody = (
      <>
        <div className="text-xs text-muted">
          eztv · {page.total} torrents · {page.results.length} shown
        </div>
        <ResultList results={page.results} dateLabel="released" />
        {torrents.kind === "error" && <Notice kind="error">{torrents.message}</Notice>}
        {hasMore && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <button
              type="button"
              disabled={loadingMore}
              onClick={loadMore}
              className="rounded-md border border-edge px-4 py-1.5 text-fg hover:border-edge-hot disabled:text-muted"
            >
              {loadingMore ? "loading…" : `load more (page ${page.page + 1})`}
            </button>
            <span>
              {page.results.length} of {page.total}
            </span>
          </div>
        )}
      </>
    );
  }

  // --- steps 1 + 2: find a show, then pick it
  let matchesBody: ReactNode;
  if (matches.kind === "idle") {
    matchesBody = (
      <div className="max-w-[70ch] rounded-lg border border-dashed border-edge p-7 text-muted">
        eztv searches by imdb id, not by title. Type a show title and click "find show" to look it up on tvmaze. The
        lookup runs on click or Enter only, never while typing.
      </div>
    );
  } else if (matches.kind === "loading") {
    matchesBody = <Notice kind="info">looking up shows on tvmaze…</Notice>;
  } else if (matches.kind === "error") {
    matchesBody = <Notice kind="error">{matches.message}</Notice>;
  } else if (matches.data.length === 0) {
    matchesBody = <Notice kind="info">no shows on tvmaze for "{lookedUp}"</Notice>;
  } else {
    matchesBody = (
      <div className="flex flex-col gap-3">
        <div className="text-xs text-muted">
          {matches.data.length} shows on tvmaze for "{lookedUp}" · pick one to search eztv
        </div>
        {matches.data.map((m) => (
          <ShowCard key={m.id} show={m} onPick={pick} />
        ))}
      </div>
    );
  }

  return (
    <>
      {picked ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-panel px-3.5 py-2.5">
          <span className="text-good" aria-hidden="true">
            ✓
          </span>
          <span className="font-bold">{picked.name}</span>
          {picked.year && <span className="text-muted">({picked.year})</span>}
          {picked.name !== picked.imdb && <span className="text-accent">{picked.imdb}</span>}
          <button
            type="button"
            onClick={() => setPicked(null)}
            className="ml-auto rounded-md border border-edge px-3 py-0.5 text-soft hover:border-edge-hot"
          >
            change show
          </button>
        </div>
      ) : (
        <SearchBox
          value={title}
          onChange={setTitle}
          onSubmit={findShow}
          busy={matches.kind === "loading"}
          placeholder="show title…"
          buttonLabel="find show ↵"
        />
      )}
      {tabs}

      {!picked && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchById();
          }}
          className="flex flex-wrap items-center gap-2 text-xs text-muted"
        >
          <label htmlFor="imdb-id">or paste an imdb id</label>
          <input
            id="imdb-id"
            value={imdbInput}
            onChange={(e) => setImdbInput(e.target.value)}
            placeholder="tt0903747"
            className="h-8 w-40 rounded-md border border-edge bg-panel px-2.5 text-fg placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={!imdbInput.trim()}
            className="h-8 rounded-md border border-edge px-3 text-soft hover:border-edge-hot disabled:opacity-50"
          >
            search by id
          </button>
          {idError && <span className="text-bad">{idError}</span>}
        </form>
      )}

      {picked ? resultsBody : matchesBody}

      <p className="border-t border-line-soft pt-4 text-xs text-muted">
        show lookup by{" "}
        <a href="https://www.tvmaze.com" target="_blank" rel="noreferrer" className="text-soft underline">
          TVmaze
        </a>{" "}
        (CC BY-SA 4.0)
      </p>
    </>
  );
}