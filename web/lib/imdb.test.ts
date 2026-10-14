import { describe, expect, test } from "bun:test";
import { parseImdbId } from "./imdb";

describe("parseImdbId", () => {
  test("accepts the common ways people paste an id", () => {
    expect(parseImdbId("tt0903747")).toBe("tt0903747");
    expect(parseImdbId(" TT0903747 ")).toBe("tt0903747");
    expect(parseImdbId("0903747")).toBe("tt0903747");
    expect(parseImdbId("https://www.imdb.com/title/tt0903747/?ref_=x")).toBe("tt0903747");
  });

  test("rejects anything else", () => {
    expect(parseImdbId("breaking bad")).toBeNull();
    expect(parseImdbId("tt12")).toBeNull();
    expect(parseImdbId("")).toBeNull();
  });
});