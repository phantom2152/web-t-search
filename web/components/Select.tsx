interface Props<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}

export function Select<T extends string>({ label, value, options, onChange }: Props<T>) {
  return (
    <label className="flex items-center gap-2">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-8.5 rounded-md border border-edge bg-panel px-2.5 text-fg"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}