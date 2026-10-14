import { describe, expect, test } from "bun:test";
import type { YTSMovie } from "../../type";
import { toMovie } from "./yts";

const base = {
  torrent_file: "https://example.test/a.torrent",
  magnet: "magnet:?xt=urn:btih:AAA",
  type: "web",
  seeds: 5,
  peers: 1,
  size: "263.5 MB",
  upload_date: "2024-03-02 10:11:12",
  hash: "AAA",
};

const movie: YTSMovie = {
  name: "Big Buck Bunny (2008)",
  cover_image: "data:image/jpeg;base64,AAAA",
  description: "A rabbit has a bad day.",
  imdb: "tt0000101",
  year: 2008,
  language: "en",
  torrents: [
    { ...base, quality: "720p" },
    { ...base, quality: "1080p" },
    { ...base, quality: "720p", type: "bluray" },
  ],
};

describe("yts", () => {
  test("strips the year from the title, trims dates, lists each quality once", () => {
    const m = toMovie(movie);
    expect(m.title).toBe("Big Buck Bunny");
    expect(m.torrents[0]?.date).toBe("2024-03-02");
    expect(m.qualities).toEqual(["720p", "1080p"]);
  });

  test("falls back to the name as id when there is no imdb code", () => {
    expect(toMovie({ ...movie, imdb: "" }).id).toBe("Big Buck Bunny (2008)");
  });
});