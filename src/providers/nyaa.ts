import * as cheerio from "cheerio";
import axios from "axios";
import type { NyaaSearchResponse, NyaaTorrentResult } from "../../type";

const BASE_URL = "https://nyaa.si";

// Regex to extract the torrent name from the name cell
const nameRegex = /[a-zA-Z\W].+/g;

export interface NyaaSearchOptions {
  orderBy?: "seeders" | "date";
  page?: number;
}

/**
 * Search for torrents on Nyaa.si (HTML scrape)
 */
export async function search(
  query: string,
  options: NyaaSearchOptions = {}
): Promise<NyaaSearchResponse> {
  const { orderBy = "seeders", page = 1 } = options;

  const finalObj: NyaaSearchResponse = {
    status: "ok",
    orderedBy: orderBy,
    query,
    length: 0,
    page,
    data: [],
  };

  try {
    // Nyaa orders by upload time via the "id" sort key
    const sortParam = orderBy === "date" ? "id" : "seeders";
    const url = `${BASE_URL}/?q=${encodeURIComponent(query)}&s=${sortParam}&o=desc&p=${page}`;

    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const results: NyaaTorrentResult[] = $("table > tbody > tr")
      .toArray()
      .map((el) => {
        const tds = $(el).find("td");
        const type = $(tds[0]).find("a").find("img").attr("alt") || "";
        const nameMatch = $(tds[1]).text().trim().match(nameRegex);
        const name = nameMatch ? nameMatch[0].trim() : "";
        const torrent = BASE_URL + ($(tds[2]).find("a").first().attr("href") || "");
        const magnet = $(tds[2]).find("a").last().attr("href") || "";
        const size = $(tds[3]).text().trim() || "";
        const upload_date = $(tds[4]).text().trim() || "";
        const seeders = $(tds[5]).text().trim() || "0";
        const leechers = $(tds[6]).text().trim() || "0";
        const complete_downloads = $(tds[7]).text().trim() || "0";

        return {
          type,
          name,
          torrent,
          magnet,
          size,
          upload_date,
          seeders,
          leechers,
          complete_downloads,
        };
      });

    finalObj.data = results;
    finalObj.length = results.length;
    return finalObj;
  } catch (error) {
    finalObj.status = "error";
    finalObj.error = error instanceof Error ? error.message : "Unknown error occurred";
    return finalObj;
  }
}

export default search;
