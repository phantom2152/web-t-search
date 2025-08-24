// src/components/CatFetcher.tsx
import { useState } from "react";

type CatResponse = { url: string };
type Err = { error: string };

export default function CatFetcher() {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const getCat = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/cat");
      if (!res.ok) {
        const e = (await res.json().catch(() => null)) as Err | null;
        throw new Error(e?.error ?? `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as CatResponse;
      setImgUrl(data.url);
    } catch (e: any) {
      setErr(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="flex items-center gap-3">
        <button
          onClick={getCat}
          disabled={loading}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white font-medium shadow hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Fetching…" : "Get Cat"}
        </button>
        {err && (
          <span className="text-sm text-red-600" role="alert">
            {err}
          </span>
        )}
      </div>

      <div className="mt-6">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt="Random cat"
            className="w-full max-h-[28rem] object-contain rounded-lg border border-gray-200 shadow-sm bg-white"
          />
        ) : (
          <p className="text-gray-500">Click the button to load a cat.</p>
        )}
      </div>
    </div>
  );
}