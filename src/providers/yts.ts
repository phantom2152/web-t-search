import type { YTSSearchResponse, YTSMovie, YTSTorrent } from '../../type';

function buildMagnet(infoHash: string): string {
  return `magnet:?xt=urn:btih:${infoHash}&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://9.rarbg.to:2920/announce&tr=udp://tracker.opentrackr.org:1337&tr=udp://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.leechers-paradise.org:6969/announce&tr=udp://tracker.pirateparty.gr:6969/announce&tr=udp://tracker.cyberia.is:6969/announce`;
}


const base64EncodeImage = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    const length = uint8Array.length; 
    for (let i = 0; i < length; i++) {
      binary += String.fromCharCode(uint8Array[i]!);
    }
    const base64 = btoa(binary);
    
    return `data:${contentType.toLowerCase()};base64,${base64}`;
  } catch (error) {
    console.error('Error encoding image:', error);
    return ''; 
  }
};


export async function search(query: string, cimage: boolean = false): Promise<YTSSearchResponse> {
  const finalObj: YTSSearchResponse = {
    status: "ok",
    movie_count: 0,
    query,
    data: []
  };

  const url = `https://yts.am/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}&sort_by=download_count`;

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