import type { ProviderId } from "../lib/types";

const TABS: ProviderId[] = ["yts", "tpb", "eztv", "nyaa"];

interface Props {
  active: ProviderId;
  onChange: (id: ProviderId) => void;
}

export function ProviderTabs({ active, onChange }: Props) {
  return (
    <nav aria-label="Providers" className="flex flex-wrap gap-1 border-b border-line">
      {TABS.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-current={id === active ? "page" : undefined}
          className={`-mb-px border-b-2 px-3.5 py-2.5 ${
            id === active ? "border-accent text-accent" : "border-transparent text-muted hover:text-fg"
          }`}
        >
          {id}
        </button>
      ))}
    </nav>
  );
}