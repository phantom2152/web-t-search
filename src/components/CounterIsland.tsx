import { useEffect, useState } from "react";

export default function CounterIsland() {
  const [value, setValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/counter");
        if (!res.ok) throw new Error("Failed to load counter");
        const data = (await res.json()) as { value: number };
        if (!cancelled) setValue(data.value);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const increment = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/counter/increment", {
        method: "POST",
        headers: { "content-type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to increment");
      const data = (await res.json()) as { value: number };
      setValue(data.value);
    } catch (e: any) {
      setErr(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 8, maxWidth: 240 }}>
      <div>
        Current value:{" "}
        {value === null ? <em>loading…</em> : <strong>{value}</strong>}
      </div>
      <button onClick={increment} disabled={loading}>
        {loading ? "Updating…" : "Increment"}
      </button>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
    </div>
  );
}