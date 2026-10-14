import type { TPBSearchResponse, TPBSearchResult } from "../../type";
import { getJson } from "../lib/api";
import { isoDate } from "../lib/format";
import type { Result } from "../lib/types";

export const TPB_CATEGORIES = ["All", "Audio", "Video", "Applications", "Games", "Other", "Top100"] as const;
export type TpbCategory = (typeof TPB_CATEGORIES)[number];

export const TPB_SORTS = ["seeders", "leechers", "date", "size", "name"] as const;
export type TpbSort = (typeof TPB_SORTS)[number];

export type TpbOrder = "desc" | "asc";

const TOP_LEVEL: Record<string, string> = {
  "1": "Audio",
  "2": "Video",
  "3": "Applications",
  "4": "Games",
  "5": "Porn",
  "6": "Other",
};

function categoryLabel(code: string): string {
  const top = TOP_LEVEL[code.charAt(0)];
  return top ? `${top} · ${code}` : code;
}

export function toResults(rows: TPBSearchResult[]): Result[] {
  return rows
    // apibay answers "no results" with a single placeholder row whose id is "0"
    .filter((t) => t.id !== "0")
    .map((t) => ({
      id: t.id,
      title: t.title,
      size: t.size,
      seeds: t.seeds,
      peers: t.peers,
      date: isoDate(t.time),
      magnet: t.magnet,
      details: [
        { label: "category", value: categoryLabel(t.category) },
        { label: "files", value: String(t.numFiles) },
        { label: "status", value: t.status },
        { label: "info hash", value: /btih:([0-9a-f]{40})/i.exec(t.magnet)?.[1] ?? "", wide: true },
        { label: "magnet", value: t.magnet, wide: true },
      ],
    }));
}

export async function searchTpb(
  query: string,
  opts: { category?: TpbCategory; sort?: TpbSort; order?: TpbOrder } = {},
  signal?: AbortSignal,
) {
  const res = await getJson<TPBSearchResponse>(
    "/api/search/tpb",
    { query, category: opts.category, sort: opts.sort, order: opts.order },
    signal,
  );
  return { results: toResults(res.data) };
}