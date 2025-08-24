// src/pages/api/cat.ts
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://cataas.com/cat", {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(t);

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream error: ${res.status}` }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    const data = (await res.json()) as {
      url?: string;
      id?: string;
      tags?: string[];
      created_at?: string;
      mimetype?: string;
    };

    const url = data?.url;
    if (!url) {
      return new Response(JSON.stringify({ error: "No URL in response" }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    const msg =
      err?.name === "AbortError" ? "Request timed out" : err?.message || "Error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};