/** "1,524" | 1524 | undefined -> 1524 (0 when it can't be parsed) */
export function toInt(value: string | number | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = parseInt((value ?? "").replace(/,/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

/** Any Date-parsable string -> YYYY-MM-DD (returned unchanged if it can't be parsed). */
export function isoDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 10);
}

/** Tailwind colour class for a seed count. Keep the full class names here so Tailwind sees them. */
export function seedClass(seeds: number): string {
  if (seeds > 10) return "text-good";
  if (seeds > 0) return "text-warn";
  return "text-bad";
}