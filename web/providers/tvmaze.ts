import { ApiError } from "../lib/api";

export interface ShowMatch {
  id: number;
  name: string;
  year: string; // "" when unknown
  status: string;
  genres: string[];
  imdb: string | null;
  poster: string | null;
}

export interface TvmazeSearchHit {
  show: {
    id: number;
    name: string;
    premiered: string | null;
    status: string;
    genres: string[];
    image: { medium: string } | null;
    externals: { imdb: string | null } | null;
  };
}

export function toShowMatch(hit: TvmazeSearchHit): ShowMatch {
  const s = hit.show;
  return {
    id: s.id,
    name: s.name,
    year: s.premiered?.slice(0, 4) ?? "",
    status: s.status,
    genres: s.genres ?? [],
    imdb: s.externals?.imdb ?? null,
    poster: s.image?.medium ?? null,
  };
}

/** Called straight from the browser (TVmaze allows CORS). Only ever call this on an explicit submit. */
export async function findShows(query: string, signal?: AbortSignal): Promise<ShowMatch[]> {
  const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`, { signal });
  if (res.status === 429) throw new ApiError("TVmaze is rate limiting us, try again in a few seconds", 429);
  if (!res.ok) throw new ApiError(`TVmaze request failed (${res.status})`, res.status);
  const hits = (await res.json()) as TvmazeSearchHit[];
  return hits.map(toShowMatch);
}