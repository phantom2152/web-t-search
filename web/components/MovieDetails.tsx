import { seedClass } from "../lib/format";
import type { YtsMovie } from "../providers/yts";
import { CopyButton } from "./CopyButton";
import { Poster } from "./Poster";

interface Props {
  movie: YtsMovie;
  onClose: () => void;
}

export function MovieDetails({ movie, onClose }: Props) {
  return (
    <section
      aria-label={`${movie.title} details`}
      className="flex flex-wrap gap-6 rounded-lg border border-line bg-panel p-5"
    >
      <Poster src={movie.cover} title={movie.title} className="h-[180px] w-[120px] rounded-md" />

      <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">
              {movie.title} <span className="font-normal text-muted">({movie.year})</span>
            </h2>
            <div className="text-xs text-muted">
              {movie.language}
              {movie.imdb && ` · ${movie.imdb}`}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-edge px-3 py-1 text-soft hover:border-edge-hot"
          >
            close ✕
          </button>
        </div>

        {movie.description && <p className="max-w-[64ch] text-soft">{movie.description}</p>}

        <div className="flex flex-col">
          {movie.torrents.map((t) => (
            <div
              key={`${t.quality}-${t.type}-${t.hash}`}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line py-2.5"
            >
              <span className="min-w-14 rounded border border-edge-hi px-2 text-center text-accent">{t.quality}</span>
              <span className="min-w-12 text-muted">{t.type}</span>
              <span className="min-w-[72px]">{t.size}</span>
              <span className="text-muted">
                seeds <span className={`font-bold ${seedClass(t.seeds)}`}>{t.seeds}</span>
              </span>
              <span className="text-muted">
                peers <span className="text-info">{t.peers}</span>
              </span>
              <span className="text-muted">{t.date}</span>
              <span className="ml-auto flex gap-2">
                <CopyButton text={t.magnet} className="py-1" />
                {t.torrentUrl && <CopyButton text={t.torrentUrl} label="copy .torrent" className="py-1" />}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}