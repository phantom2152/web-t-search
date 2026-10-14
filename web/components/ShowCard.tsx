import type { ShowMatch } from "../providers/tvmaze";

interface Props {
  show: ShowMatch;
  onPick: (show: ShowMatch) => void;
}

export function ShowCard({ show, onPick }: Props) {
  const usable = show.imdb !== null;
  const meta = [show.status.toLowerCase(), show.genres.join(", ")].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-panel p-3 hover:border-edge-hi">
      <div className="flex h-18 w-12 flex-none items-end overflow-hidden rounded bg-line text-2xl font-bold leading-none text-fg/15">
        {show.poster ? (
          <img src={show.poster} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="p-1">{show.name.charAt(0)}</span>
        )}
      </div>
      <div className="min-w-0 flex-[1_1_240px]">
        <div className="text-sm font-bold">
          {show.name}
          {show.year && <span className="font-normal text-muted"> ({show.year})</span>}
        </div>
        <div className="text-xs text-muted">{meta}</div>
        <div className={`text-xs ${usable ? "text-accent" : "text-bad"}`}>{show.imdb ?? "no imdb id on tvmaze"}</div>
      </div>
      <button
        type="button"
        disabled={!usable}
        onClick={() => onPick(show)}
        className="rounded-md border border-edge-hi px-3.5 py-1.5 hover:border-edge-hot disabled:border-line disabled:text-muted disabled:hover:border-line"
      >
        {usable ? "use this show" : "unavailable"}
      </button>
    </div>
  );
}