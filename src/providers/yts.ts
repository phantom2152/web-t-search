import type { YTSSearchResponse, YTSMovie, YTSTorrent } from '../../type';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


const buildMagnet = (infoHash: string): string => {
  return `magnet:?xt=urn:btih:${infoHash}&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://9.rarbg.to:2920/announce&tr=udp://tracker.opentrackr.org:1337&tr=udp://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.leechers-paradise.org:6969/announce&tr=udp://tracker.pirateparty.gr:6969/announce&tr=udp://tracker.cyberia.is:6969/announce`;
};


/**
 * Fetches a cover and returns it as a data URI ("" if it can't be had).
 * 5xx answers (e.g. Cloudflare's 525) are usually transient, so those are retried;
 * 4xx answers won't improve, so they aren't.
 */
export const base64EncodeImage = async (
  imageUrl: string,
  { attempts = 3, delayMs = 250 }: { attempts?: number; delayMs?: number } = {},
): Promise<string> => {
  for (let i = 1; i <= attempts; i++) {
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        const bytes = new Uint8Array(await response.arrayBuffer());
        const contentType = (response.headers.get('content-type') || 'image/jpeg').toLowerCase();
        return `data:${contentType};base64,${Buffer.from(bytes).toString('base64')}`;
      }
      if (response.status < 500) {
        console.error(`Cover fetch failed (${response.status}), not retrying: ${imageUrl}`);
        return '';
      }
      console.warn(`Cover fetch ${response.status}, attempt ${i}/${attempts}: ${imageUrl}`);
    } catch (error) {
      console.warn(`Cover fetch error, attempt ${i}/${attempts}: ${imageUrl}`, error);
    }
    if (i < attempts) await sleep(delayMs * i);
  }
  console.error(`Giving up on cover: ${imageUrl}`);
  return '';
};


export async function search(query: string, cimage: boolean = false): Promise<YTSSearchResponse> {
  const finalObj: YTSSearchResponse = {
    status: "ok",
    movie_count: 0,
    query,
    data: []
  };

  const url = `https://movies-api.accel.li/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}&sort_by=download_count`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YTS API request failed: ${response.status}`);
    }
    
    const data: any = await response.json(); 
    const { movie_count, movies } = data.data;
    finalObj.movie_count = movie_count;

    if (movie_count === 0) return finalObj;

    const moviePromises = movies.map(async (movie: any) => {
    
      let coverImage = '';
      if (cimage && movie.large_cover_image) {
        coverImage = await base64EncodeImage(movie.large_cover_image);
      }

      // Process torrents
      const torrents: YTSTorrent[] = await Promise.all(
        (movie.torrents || []).map(async (torr: any) => {
          return {
            torrent_file: torr.url || "",
            magnet: torr.hash ? buildMagnet(torr.hash) : "",
            quality: torr.quality || "",
            type: torr.type || "",
            seeds: torr.seeds || 0,
            peers: torr.peers || 0,
            size: torr.size || "",
            upload_date: torr.date_uploaded || "",
            hash: torr.hash || "",
          };
        })
      );

      const movieData: YTSMovie = {
        name: movie.title_long || "",
        cover_image: coverImage || "",
        description: movie.synopsis || "",
        imdb: movie.imdb_code || "",
        year: movie.year || 0,
        language: movie.language || "",
        torrents
      };

      return movieData;
    });

    finalObj.data = await Promise.all(moviePromises);
    return finalObj;
  } catch (error) {
    finalObj.status = "error";
    finalObj.error = error instanceof Error ? error.message : 'Unknown error occurred';
    return finalObj;
  }
}

export default search;