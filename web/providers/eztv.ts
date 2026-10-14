import type { EZTVProviderResponse, EZTVTorrentResult } from "../../src/providers/eztv";
import { getJson } from "../lib/api";
import { isoDate } from "../lib/format";
import type { Result } from "../lib/types";

const pad = (n: string) => n.padStart(2, "0");

function episodeTag(season: string, episode: string): string | undefined {
  if (!season || season === "0") return undefined;
  return `S${pad(season)}` + (episode && episode !== "0" ? `E${pad(episode)}` : "");
}

export function toResult(t: EZTVTorrentResult): Result {
  return {
    id: String(t.id),
    title: t.title,
    tag: episodeTag(t.season, t.episode),
    size: t.size,
    seeds: t.seeds,
    peers: t.peers,
    date: isoDate(t.time),
    magnet: t.magnet,
    details: [
      { label: "info hash", value: t.hash, wide: true },
      { label: "filename", value: t.filename, wide: true },
    ],
  };
}

export async function searchEztv(
  imdbId: string,
  opts: { page?: number; limit?: number } = {},
  signal?: AbortSignal,
) {
  const res = await getJson<EZTVProviderResponse>(
    "/api/search/eztv",
    { imdb_id: imdbId, page: opts.page, limit: opts.limit },
    signal,
  );
  return {
    page: res.query_meta.page,
    limit: res.query_meta.limit,
    total: res.query_meta.torrents_count,
    results: res.data.map(toResult),
  };
}