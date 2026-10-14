import { describe, expect, test } from "bun:test";
import { toShowMatch, type TvmazeSearchHit } from "./tvmaze";

describe("toShowMatch", () => {
  test("maps a full hit", () => {
    const hit: TvmazeSearchHit = {
      show: {
        id: 1,
        name: "Breaking Bad",
        premiered: "2008-01-20",
        status: "Ended",
        genres: ["Drama", "Crime"],
        image: { medium: "https://static.tvmaze.com/x.jpg" },
        externals: { imdb: "tt0903747" },
      },
    };
    expect(toShowMatch(hit)).toEqual({
      id: 1,
      name: "Breaking Bad",
      year: "2008",
      status: "Ended",
      genres: ["Drama", "Crime"],
      imdb: "tt0903747",
      poster: "https://static.tvmaze.com/x.jpg",
    });
  });

  test("copes with missing year, poster and imdb id", () => {
    const hit: TvmazeSearchHit = {
      show: { id: 2, name: "Obscure", premiered: null, status: "Ended", genres: [], image: null, externals: null },
    };
    const m = toShowMatch(hit);
    expect(m.year).toBe("");
    expect(m.poster).toBeNull();
    expect(m.imdb).toBeNull();
  });
});