import type { ReactNode } from "react";

export function Notice({ kind, children }: { kind: "info" | "error"; children: ReactNode }) {
  const tone = kind === "error" ? "border-bad/40 text-bad" : "border-line text-muted";
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 ${tone}`}>
      {children}
    </div>
  );
}