import { useState } from "react";
import type { ReactNode } from "react";
import { Notice } from "../components/Notice";
import { ResultList } from "../components/ResultList";
import { SearchBox } from "../components/SearchBox";
import { Select } from "../components/Select";
import type { Result } from "../lib/types";
import { useLoad } from "../lib/useLoad";
import {
  searchTpb,
  TPB_CATEGORIES,
  TPB_SORTS,
  type TpbCategory,
  type TpbOrder,
  type TpbSort,
} from "../providers/tpb";

const ORDERS = ["desc", "asc"] as const;

export function TpbScreen({ tabs }: { tabs: ReactNode }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [category, setCategory] = useState<TpbCategory>("All");
  const [sort, setSort] = useState<TpbSort>("seeders");
  const [order, setOrder] = useState<TpbOrder>("desc");
  const [state, run] = useLoad<Result[]>();

  function load(q: string, c: TpbCategory, s: TpbSort, o: TpbOrder) {
    run((signal) => searchTpb(q, { category: c, sort: s, order: o }, signal).then((r) => r.results));
  }

  function submit() {
    const q = query.trim();
    if (!q) return;
    setSearched(q);
    load(q, category, sort, order);
  }

  function changeCategory(c: TpbCategory) {
    setCategory(c);
    if (searched) load(searched, c, sort, order);
  }
  function changeSort(s: TpbSort) {
    setSort(s);
    if (searched) load(searched, category, s, order);
  }
  function changeOrder(o: TpbOrder) {
    setOrder(o);
    if (searched) load(searched, category, sort, o);
  }

  let body: ReactNode;
  if (state.kind === "idle") body = <Notice kind="info">type a query and press enter</Notice>;
  else if (state.kind === "loading") body = <Notice kind="info">searching tpb…</Notice>;
  else if (state.kind === "error") body = <Notice kind="error">{state.message}</Notice>;
  else if (state.data.length === 0) body = <Notice kind="info">no results for "{searched}"</Notice>;
  else body = <ResultList results={state.data} dateLabel="added" />;

  return (
    <>
      <SearchBox
        value={query}
        onChange={setQuery}
        onSubmit={submit}
        busy={state.kind === "loading"}
        placeholder="linux iso, ubuntu, blender…"
      />
      {tabs}

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
        <Select label="category" value={category} options={TPB_CATEGORIES} onChange={changeCategory} />
        <Select label="sort" value={sort} options={TPB_SORTS} onChange={changeSort} />
        <Select label="order" value={order} options={ORDERS} onChange={changeOrder} />
        {state.kind === "ok" && (
          <span className="ml-auto">
            tpb · {state.data.length} results for "{searched}"
          </span>
        )}
      </div>

      {body}

      {state.kind === "ok" && state.data.length > 0 && (
        <p className="text-xs text-muted">tpb returns everything in one response, so there is no pagination.</p>
      )}
    </>
  );
}