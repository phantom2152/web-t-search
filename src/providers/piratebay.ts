import type { TPBTorrent, TPBSearchResult, TPBSearchResponse, TPBTorrentDetails } from "../../type";

export interface TPBCategories {
  All: string;
  Audio: string;
  Video: string;
  Applications: string;
  Games: string;
  Porn: string;
  Other: string;
  Top100: string;
}

export interface TPBSearchOptions {
  category?: keyof TPBCategories;
  sortBy?: 'name' | 'date' | 'size' | 'seeders' | 'leechers';
  order?: 'asc' | 'desc';
}

const BASE_URL = 'https://apibay.org';
const CATEGORIES: TPBCategories = {
  All: '',
  Audio: '100',
  Video: '200',
  Applications: '300',
  Games: '400',
  Porn: '500',
  Other: '600',
  Top100: 'url:/top/all'
};

function formatMagnet(infoHash: string, name: string): string {
  const trackers = [
    'udp://tracker.coppersurfer.tk:6969/announce',
    'udp://9.rarbg.to:2920/announce',
    'udp://tracker.opentrackr.org:1337',
    'udp://tracker.internetwarriors.net:1337/announce',
    'udp://tracker.leechers-paradise.org:6969/announce',
    'udp://tracker.pirateparty.gr:6969/announce',
    'udp://tracker.cyberia.is:6969/announce'
  ];
  const trackersQueryString = `&tr=${trackers.map(encodeURIComponent).join('&tr=')}`;
  return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(name)}${trackersQueryString}`;
}

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

function safeInt(value: string): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function getSearchUrl(query: string, options: TPBSearchOptions = {}): string | null {
  const { category = 'All', sortBy, order } = options;
  const cat = CATEGORIES[category];
  
  if (category === 'Top100') {
    return `${BASE_URL}/precompiled/data_top100_all.json`;
  }
  
  let url = `${BASE_URL}/q.php?q=${encodeURIComponent(query)}&cat=${cat}`;
  
  if (sortBy) {
    // Map our friendly names to API values
    const sortMap = {
      'name': '1',
      'date': '3', 
      'size': '5',
      'seeders': '7',
      'leechers': '9'
    };
    url += `&sort=${sortMap[sortBy]}`;
  }
  
  if (order) {
    url += `&sort_order=${order}`;
  }
  
  return url;
}

export async function search(
  query: string, 
  options: TPBSearchOptions = {}
): Promise<TPBSearchResponse> {
  const finalObj: TPBSearchResponse = {
    status: "ok",
    query,
    data: []
  };

  try {
    const url = getSearchUrl(query, options);
    if (!url) {
      throw new Error('Invalid category or query');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TPB API request failed: ${response.status}`);
    }

    const data = await response.json() as TPBTorrent[];
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format');
    }

    finalObj.data = data.map((torrent: TPBTorrent): TPBSearchResult => ({
      provider: 'ThePirateBay',
      id: torrent.id,
      title: torrent.name,
      time: new Date(safeInt(torrent.added) * 1000).toUTCString(),
      seeds: safeInt(torrent.seeders),
      peers: safeInt(torrent.leechers),
      size: humanizeSize(torrent.size),
      magnet: formatMagnet(torrent.info_hash, torrent.name),
      numFiles: safeInt(torrent.num_files),
      status: torrent.status,
      category: torrent.category,
      imdb: torrent.imdb
    }));

    return finalObj;
  } catch (error) {
    finalObj.status = "error";
    finalObj.error = error instanceof Error ? error.message : 'Unknown error occurred';
    return finalObj;
  }
}

export async function getTorrentDetails(torrentId: string): Promise<TPBTorrentDetails | null> {
  if (!torrentId) {
    throw new Error('Missing torrent id');
  }

  try {
    const url = `${BASE_URL}/t.php?id=${torrentId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch torrent details: ${response.status}`);
    }

    const data = await response.json() as TPBTorrentDetails;
    return data;
  } catch (error) {
    console.error('Error fetching torrent details:', error);
    return null;
  }
}

export default search;