export type ProviderId = "yts" | "tpb" | "eztv" | "nyaa";

export interface DetailField {
  label: string;
  value: string;
  wide?: boolean;
}

/** One torrent row, normalised from tpb / eztv / nyaa. (yts keeps its own movie shape.) */
export interface Result {
  id: string;
  title: string;
  /** short chip shown before the title, e.g. "S02E08" */
  tag?: string;
  size: string;
  seeds: number;
  peers: number;
  /** display date: YYYY-MM-DD (nyaa keeps its own "YYYY-MM-DD HH:MM") */
  date: string;
  magnet: string;
  /** fields for the expanded row */
  details: DetailField[];
}