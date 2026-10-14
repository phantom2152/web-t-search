import type { YtsMovie } from "../providers/yts";
import { Poster } from "./Poster";

interface Props {
  movie: YtsMovie;
  selected: boolean;
  onSelect: () => void;
}

export function MovieCard({ movie, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex flex-col overflow-hidden rounded-lg border bg-panel text-left hover:border-edge-hi ${
        selected ? "border-accent" : "border-line"
      }`}
    >
      <Poster src={movie.cover} title={movie.title} className="aspect-[2/3] w-full" />
      <span className="flex flex-col gap-1.5 p-3">
        <span className="text-sm font-bold leading-snug">{movie.title}</span>
        <span className="text-xs text-muted">
          {movie.year} · {movie.language}
        </span>
        <span className="flex flex-wrap gap-1.5">
          {movie.qualities.map((q) => (
            <span key={q} className="rounded border border-edge px-1.5 text-xs text-soft">
              {q}
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}