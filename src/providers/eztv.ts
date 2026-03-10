import type { EZTVTorrent, EZTVSearchResponse } from "../../type";

export interface EZTVSearchOptions {
  limit?: number;
  page?: number;
}

const BASE_URL = 'https://eztvx.to/api';

function humanizeSize(bytes: string): string {
  const size = parseInt(bytes, 10);
  if (isNaN(size)) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let humanSize = size;

  while (humanSize >= 1024 && unitIndex < units.length - 1) {
    humanSize /= 1024;
    unitIndex++;
  }

  return `${humanSize.toFixed(1)} ${units[unitIndex]}`;
}

export interface EZTVTorrentResult {
  provider: string;
  id: number;
  title: string;
  filename: string;
  season: string;
  episode: string;
  time: string;
  seeds: number;
  peers: number;
  size: string;
  magnet: string;
  hash: string;
  small_screenshot: string;
  large_screenshot: string;
  imdb_id: string;
}

export interface EZTVProviderResponse {
  status: string;
  imdb_id: string;
  query_meta: {
    page: number;
    limit: number;
    torrents_count: number;
  };
  data: EZTVTorrentResult[];
  error?: string;
}

export async function search(
  imdbId: string,
  options: EZTVSearchOptions = {}
): Promise<EZTVProviderResponse> {
  const { limit = 30, page = 1 } = options;

  const finalObj: EZTVProviderResponse = {
    status: "ok",
    imdb_id: imdbId,
    query_meta: {
      page,
      limit,
      torrents_count: 0,
    },
    data: [],
  };

  if (!imdbId) {
    finalObj.status = "error";
    finalObj.error = "Missing IMDB ID";
    return finalObj;
  }

  // Strip leading 'tt' if present — EZTV expects numeric ID only
  const numericId = imdbId.replace(/^tt/i, '');

  try {
    const url = `${BASE_URL}/get-torrents?imdb_id=${numericId}&limit=${limit}&page=${page}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`EZTV API request failed: ${response.status}`);
    }

    const data = await response.json() as EZTVSearchResponse;

    finalObj.query_meta.torrents_count = data.torrents_count ?? 0;

    if(finalObj.query_meta.torrents_count === 0) {
        finalObj.status = "ok";
        return finalObj; 
    }

    if (!data || !Array.isArray(data.torrents)) {
      throw new Error('Invalid response format from EZTV API');
    }

    

    finalObj.data = data.torrents.map((torrent: EZTVTorrent): EZTVTorrentResult => ({
      provider: 'EZTV',
      id: torrent.id,
      title: torrent.title,
      filename: torrent.filename,
      season: torrent.season,
      episode: torrent.episode,
      time: new Date(torrent.date_released_unix * 1000).toUTCString(),
      seeds: torrent.seeds,
      peers: torrent.peers,
      size: humanizeSize(torrent.size_bytes),
      magnet: torrent.magnet_url,
      hash: torrent.hash,
      small_screenshot: torrent.small_screenshot
        ? `https:${torrent.small_screenshot}`
        : '',
      large_screenshot: torrent.large_screenshot
        ? `https:${torrent.large_screenshot}`
        : '',
      imdb_id: torrent.imdb_id,
    }));

    return finalObj;
  } catch (error) {
    finalObj.status = "error";
    finalObj.error = error instanceof Error ? error.message : 'Unknown error occurred';
    return finalObj;
  }
}

export default search;