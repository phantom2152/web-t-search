import { useEffect, useRef, useState } from "react";

export type Load<T> =
  | { kind: "idle" }
  | { kind: "loading"; prev?: T }
  | { kind: "ok"; data: T }
  | { kind: "error"; message: string; prev?: T };

/**
 * Runs one async task at a time; starting a new one aborts the previous one.
 * With { keepPrevious: true } the last successful data rides along on the
 * loading / error states (used by "load more").
 */
export function useLoad<T>() {
  const [state, setState] = useState<Load<T>>({ kind: "idle" });
  const inflight = useRef<AbortController | null>(null);
  const lastOk = useRef<T | undefined>(undefined);

  useEffect(() => () => inflight.current?.abort(), []);

  function run(task: (signal: AbortSignal) => Promise<T>, opts: { keepPrevious?: boolean } = {}) {
    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    const prev = opts.keepPrevious ? lastOk.current : undefined;
    setState({ kind: "loading", prev });
    task(ctrl.signal).then(
      (data) => {
        if (ctrl.signal.aborted) return;
        lastOk.current = data;
        setState({ kind: "ok", data });
      },
      (err: unknown) => {
        if (ctrl.signal.aborted) return;
        setState({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong", prev });
      },
    );
  }

  return [state, run] as const;
}