import { useEffect, useRef, useState } from "react";

type State = "idle" | "copied" | "failed";

interface Props {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = "copy magnet", className = "" }: Props) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2000);
  }

  const tone = state === "copied" ? "text-good" : state === "failed" ? "text-bad" : "text-soft";
  const shown = state === "copied" ? "copied ✓" : state === "failed" ? "copy failed" : label;

  return (
    <button
      type="button"
      onClick={copy}
      className={`rounded-md border border-edge px-3 py-0.5 hover:border-edge-hot ${tone} ${className}`}
    >
      {shown}
    </button>
  );
}