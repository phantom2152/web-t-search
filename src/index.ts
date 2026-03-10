import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { readFileSync } from "fs";
import { join } from "path";
import YTSSearch from "./providers/yts";
import TPBSearch from "./providers/piratebay";
import EZTVSearch from "./providers/eztv";
import type { TPBCategories } from "./providers/piratebay";

const app = new Hono();

app.get("/", (c) => {
  const html = readFileSync(join(process.cwd(), "public", "index.html"), "utf-8");
  return c.html(html);
});

app.get("/api/search/yts", async (c) => {
  const query = c.req.query("query") || "";
  if (!query) {
    return c.json({ status: "error", error: "Missing query parameter" }, 400);
  }

  const results = await YTSSearch(query, true);
  return c.json(results);
});

app.get("/api/search/tpb", async (c) => {
  const query = c.req.query("query") || "";
  const category = c.req.query("category") || "All";
  const sortBy = c.req.query("sort") as 'name' | 'date' | 'size' | 'seeders' | 'leechers';
  const order = c.req.query("order") as 'asc' | 'desc';

  if (!query) {
    return c.json({ status: "error", error: "Missing query parameter" }, 400);
  }

  const results = await TPBSearch(query, {
    category: category as keyof TPBCategories,
    sortBy,
    order,
  });
  return c.json(results);
});

app.get("/api/search/eztv", async (c) => {
  const imdbId = c.req.query("imdb_id") || "";
  if (!imdbId) {
    return c.json({ status: "error", error: "Missing imdb_id parameter" }, 400);
  }

  const limit = parseInt(c.req.query("limit") || "30", 10);
  const page = parseInt(c.req.query("page") || "1", 10);

  const results = await EZTVSearch(imdbId, { limit, page });
  return c.json(results);
});

// Serve static files from the "public" folder
app.use("*", serveStatic({ root: "./public" }));

export default app;