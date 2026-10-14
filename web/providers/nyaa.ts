import type { NyaaSearchResponse, NyaaTorrentResult } from "../../type";
import { getJson } from "../lib/api";
import { toInt } from "../lib/format";
import type { Result } from "../lib/types";

export type NyaaOrder = "seeders" | "date";

export function toResult(t: NyaaTorrentResult): Result {
  const id = /\/download\/(\d+)\.torrent/.exec(t.torrent)?.[1] ?? t.magnet;
  return {
    id,
    title: t.name,
    size: t.size,
    seeds: toInt(t.seeders),
    peers: toInt(t.leechers),
    date: t.upload_date,
    magnet: t.magnet,
    details: [
      { label: "type", value: t.type },
      { label: "completed downloads", value: toInt(t.complete_downloads).toLocaleString("en-US") },
      { label: "uploaded", value: t.upload_date },
      { label: ".torrent", value: t.torrent, wide: true },
      { label: "magnet", value: t.magnet, wide: true },
    ],
  };
}

export async function searchNyaa(
  query: string,
  opts: { order?: NyaaOrder; page?: number } = {},
  signal?: AbortSignal,
) {
  const res = await getJson<NyaaSearchResponse>(
    "/api/search/nyaa",
    { query, ord_by: opts.order, page: opts.page },
    signal,
  );
  return { page: res.page, results: res.data.map(toResult) };
}