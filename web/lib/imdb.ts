/** "tt0903747", " TT0903747 ", "0903747" or an imdb.com/title/… URL -> "tt0903747"; null if it doesn't look like an id */
export function parseImdbId(input: string): string | null {
  const s = input.trim();
  const m = /tt(\d{7,10})/i.exec(s) ?? /^(\d{7,10})$/.exec(s);
  return m?.[1] ? `tt${m[1]}` : null;
}