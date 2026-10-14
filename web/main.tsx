import { useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [count, setCount] = useState(0);
  const [ping, setPing] = useState("not tested");

  async function testApi() {
    setPing("loading…");
    try {
      const res = await fetch("/api/search/nyaa?query=naruto");
      const data = await res.json();
      setPing(`status=${data.status}, length=${data.length}`);
    } catch (e) {
      setPing(`failed: ${(e as Error).message}`);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-light font-body flex flex-col items-center justify-center gap-4">
      <h1 className="font-display text-4xl text-accent animate-fade-up">CineSearch</h1>
      <button
        className="rounded-lg border border-border bg-panel px-4 py-2 hover:border-accent"
        onClick={() => setCount((c) => c + 1)}
      >
        clicked {count}
      </button>
      <button
        className="rounded-lg border border-border bg-panel px-4 py-2 hover:border-accent"
        onClick={testApi}
      >
        ping nyaa API
      </button>
      <p className="text-sm text-muted">{ping}</p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);