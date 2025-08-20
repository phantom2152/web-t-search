// 1337x Types
export interface Torrent1337xSearchResult {
    name: string;
    link: string;
    seeds: string;
    leeches: string;
    date: string;
    size: string;
  }
  
  export interface Torrent1337xSearch {
    results: Torrent1337xSearchResult[];
    pagination: {
      query: string;
      currentPage: number;
      lastPage: number;
      perPageResults: number;
    };
    filters: {
      category: string;
      sort: string;
      order: string;
    };
  }
  
  export interface Torrent1337xFile {
    name: string;
    size: string;
  }
  
  export interface Torrent1337xDetails {
    name: string;
    magnet: string;
    category: string;
    uploadDate: string;
    size: string;
    language: string;
    type: string;
    seeds: string;
    leeches: string;
    uploader: string;
    files: Torrent1337xFile[];
  }
  
  // Nyaa Types
  export interface NyaaTorrentResult {
    type: string;
    name: string;
    torrent: string;
    magnet: string;
    size: string;
    upload_date: string;
    seeders: string;
    leechers: string;
    complete_downloads: string;
  }
  
  export interface NyaaSearchResponse {
    status: string;
    orderedBy: string;
    query: string;
    length: number;
    page: number;
    data: NyaaTorrentResult[];
  }
  
  // YTS Types
  export interface YTSTorrent {
    torrent_file: string;
    magnet: string;
    quality: string;
    type: string;
    seeds: number;
    peers: number;
    size: string;
    upload_date: string;
    hash: string;
  }
  
  export interface YTSMovie {
    name: string;
    cover_image: string;
    description: string;
    imdb: string;
    year: number;
    language: string;
    torrents: YTSTorrent[];
  }
  
  export interface YTSSearchResponse {
    status: string;
    movie_count: number;
    query: string;
    data: YTSMovie[];
    error?: string;
  }
  
  // Cache service type
  export interface CacheService {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
    flushall(): Promise<void>;
    isAvailable(): boolean;
  }