interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  busy?: boolean;
  placeholder?: string;
  buttonLabel?: string;
}

export function SearchBox({ value, onChange, onSubmit, busy, placeholder, buttonLabel = "search ↵" }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-wrap gap-2"
    >
      <label className="flex h-11 flex-[1_1_320px] items-center gap-2.5 rounded-md border border-edge bg-panel px-3.5 focus-within:border-accent">
        <span className="text-accent" aria-hidden="true">
          $
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search query"
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted"
        />
      </label>
      <button
        type="submit"
        disabled={busy || !value.trim()}
        className="h-11 rounded-md border border-accent bg-accent px-5 font-bold text-ground disabled:opacity-50"
      >
        {buttonLabel}
      </button>
    </form>
  );
}