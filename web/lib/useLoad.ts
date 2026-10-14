import { useEffect, useRef, useState } from "react";

export type Load<T> =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; data: T }
  | { kind: "error"; message: string };

/** Runs one async task at a time; starting a new one aborts the previous one. */
export function useLoad<T>() {
  const [state, setState] = useState<Load<T>>({ kind: "idle" });
  const inflight = useRef<AbortController | null>(null);

  useEffect(() => () => inflight.current?.abort(), []);

  function run(task: (signal: AbortSignal) => Promise<T>) {
    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    setState({ kind: "loading" });
    task(ctrl.signal).then(
      (data) => {
        if (!ctrl.signal.aborted) setState({ kind: "ok", data });
      },
      (err: unknown) => {
        if (ctrl.signal.aborted) return;
        setState({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong" });
      },
    );
  }

  return [state, run] as const;
}