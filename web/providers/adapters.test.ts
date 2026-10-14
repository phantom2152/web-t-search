import { describe, expect, test } from "bun:test";
import type { TPBSearchResult } from "../../type";
import type { EZTVTorrentResult } from "../../src/providers/eztv";
import { toResult as nyaaResult } from "./nyaa";
import { toResults as tpbResults } from "./tpb";
import { toResult as eztvResult } from "./eztv";

const HASH = "ee34425d5595f37297bc8c94dab3184c02d43daf";

describe("nyaa", () => {
  test("turns string counts into numbers and finds the id", () => {
    const r = nyaaResult({
      type: "Anime - English-translated",
      name: "[Sub] Show - 08 [1080p].mkv",
      torrent: "https://nyaa.si/download/1361463.torrent",
      magnet: `magnet:?xt=urn:btih:${HASH}`,
      size: "1.4 GiB",
      upload_date: "2026-10-13 03:46",
      seeders: "1,524",
      leechers: "47",
      complete_downloads: "12031",
    });
    expect(r.id).toBe("1361463");
    expect(r.seeds).toBe(1524);
    expect(r.peers).toBe(47);
    expect(r.date).toBe("2026-10-13 03:46");
  });
});

describe("tpb", () => {
  const row: TPBSearchResult = {
    provider: "ThePirateBay",
    id: "42",
    title: "Some ISO",
    time: "Tue, 11 Feb 2025 10:20:30 GMT",
    seeds: 12,
    peers: 3,
    size: "628.0 MB",
    magnet: `magnet:?xt=urn:btih:${HASH}&dn=x`,
    numFiles: 1,
    status: "member",
    category: "301",
    imdb: "",
  };

  test("maps a row and pulls the info hash out of the magnet", () => {
    const [r] = tpbResults([row]);
    expect(r?.date).toBe("2025-02-11");
    expect(r?.details.find((d) => d.label === "info hash")?.value).toBe(HASH);
    expect(r?.details.find((d) => d.label === "category")?.value).toBe("Applications · 301");
  });

  test("drops apibay's placeholder row", () => {
    expect(tpbResults([{ ...row, id: "0", title: "No results returned" }])).toEqual([]);
  });
});

describe("eztv", () => {
  const row: EZTVTorrentResult = {
    provider: "EZTV",
    id: 1,
    title: "Show S02E08 1080p WEB h264-GRP",
    filename: "Show.S02E08.1080p.WEB.h264-GRP.mkv",
    season: "2",
    episode: "8",
    time: "Fri, 14 Mar 2025 20:00:00 GMT",
    seeds: 312,
    peers: 24,
    size: "1.4 GB",
    magnet: `magnet:?xt=urn:btih:${HASH}`,
    hash: HASH,
    small_screenshot: "",
    large_screenshot: "",
    imdb_id: "0000201",
  };

  test("builds an episode tag", () => {
    expect(eztvResult(row).tag).toBe("S02E08");
  });

  test("no tag for non-episodic releases", () => {
    expect(eztvResult({ ...row, season: "0", episode: "0" }).tag).toBeUndefined();
  });
});