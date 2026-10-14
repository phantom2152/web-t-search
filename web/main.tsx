import { createRoot } from "react-dom/client";

const swatches = [
  ["ground", "bg-ground"], ["well", "bg-well"], ["panel", "bg-panel"],
  ["line", "bg-line"], ["edge", "bg-edge"], ["edge-hi", "bg-edge-hi"],
  ["accent", "bg-accent"], ["good", "bg-good"], ["warn", "bg-warn"],
  ["bad", "bg-bad"], ["info", "bg-info"],
];

function App() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-lg font-bold">
        <span className="text-accent">&gt;</span> cinesearch<span className="text-accent">_</span>
      </h1>
      <div className="flex flex-wrap gap-2">
        {swatches.map(([name, cls]) => (
          <div key={name} className="flex flex-col items-center gap-1 text-xs text-muted">
            <div className={`h-10 w-10 rounded border border-edge ${cls}`} />
            {name}
          </div>
        ))}
      </div>
      <p className="text-fg">fg <span className="text-soft">soft</span> <span className="text-muted">muted</span> <span className="text-good">good</span> <span className="text-warn">warn</span> <span className="text-bad">bad</span> <span className="text-info">info</span></p>
      <div className="flex gap-2">
        <button className="rounded-md border border-edge bg-transparent px-3 py-1 text-soft hover:border-edge-hot">copy magnet</button>
        <button className="rounded-md border border-accent bg-accent px-5 py-2 font-bold text-ground">search ↵</button>
      </div>
      <input className="rounded-md border border-edge bg-panel px-3 py-2" placeholder="tab to see the focus ring" />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);