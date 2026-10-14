export function Header() {
  return (
    <header className="flex flex-wrap items-baseline justify-between gap-4">
      <h1 className="text-lg font-bold tracking-tight">
        <span className="text-accent">&gt;</span> cinesearch<span className="text-accent">_</span>
      </h1>
      <p className="text-xs text-muted">torrent search · yts / tpb / eztv / nyaa</p>
    </header>
  );
}