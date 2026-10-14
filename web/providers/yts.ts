import type { YTSMovie, YTSSearchResponse, YTSTorrent } from "../../type";
import { getJson } from "../lib/api";

export interface YtsTorrent {
  quality: string;
  type: string;
  size: string;
  seeds: number;
  peers: number;
  date: string;
  magnet: string;
  torrentUrl: string;
  hash: string;
}

export interface YtsMovie {
  id: string;
  title: string;
  year: number;
  language: string;
  imdb: string;
  description: string;
  /** data URI from our API ("" when the cover couldn't be fetched) */
  cover: string;
  torrents: YtsTorrent[];
  /** distinct qualities, in the order the torrents come */
  qualities: string[];
}

export interface YtsPage {
  /** how many matches yts has in total (we only get the first page of them) */
  total: number;
  movies: YtsMovie[];
}

function toTorrent(t: YTSTorrent): YtsTorrent {
  return {
    quality: t.quality,
    type: t.type,
    size: t.size,
    seeds: t.seeds,
    peers: t.peers,
    date: t.upload_date.slice(0, 10),
    magnet: t.magnet,
    torrentUrl: t.torrent_file,
    hash: t.hash,
  };
}

export function toMovie(m: YTSMovie): YtsMovie {
  const torrents = m.torrents.map(toTorrent);
  return {
    id: m.imdb || m.name,
    // yts sends "Title (2008)"; the year is shown separately
    title: m.name.replace(/\s*\(\d{4}\)\s*$/, ""),
    year: m.year,
    language: m.language,
    imdb: m.imdb,
    description: m.description,
    cover: m.cover_image,
    torrents,
    qualities: [...new Set(torrents.map((t) => t.quality))],
  };
}

export async function searchYts(query: string, signal?: AbortSignal): Promise<YtsPage> {
  const res = await getJson<YTSSearchResponse>("/api/search/yts", { query }, signal);
  return { total: res.movie_count, movies: res.data.map(toMovie) };
}